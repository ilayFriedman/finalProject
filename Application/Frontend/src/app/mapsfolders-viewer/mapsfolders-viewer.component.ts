import { Component, OnInit, Input } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { of, Observable, Subject, from } from 'rxjs';
import { ModalService } from '../services/modal.service';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { map } from '@progress/kendo-data-query/dist/npm/transducers';
import { UsersService } from '../services/users/users.service';
import { GridDataResult, PageChangeEvent} from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { windowWhen } from 'rxjs/operators';
import { GroupsService } from '../services/groups/groups.service';
// import { read } from 'fs';



const is = (fileName: string, ext: string) => new RegExp(`.${ext}\$`).test(fileName);
@Component({
  selector: 'app-mapsfolders-viewer',
  templateUrl: './mapsfolders-viewer.component.html',
  styleUrls: ['./mapsfolders-viewer.component.css']
  // animations: [
  //   trigger('fade', [ 
  //     transition('void => *', [
  //       style({ opacity: 0 }), 
  //       animate(500, style({opacity: 1}))
  //     ]) 
  //   ])
  // ]
})
export class MapsfoldersViewerComponent implements OnInit {

  // forms validation checkouts
  addFolderCheckOut;
  addMapCheckOut;
  editPropertiesCheckOut;

  //folders variables
  public data: any[] = [];
  selectedNode: any = { text: "", Description: "" };
  public expandedKeys: any[] = ['/']; // root: key /, is already expanded 
  mouseOverNode: any;
  actionInModalIsSuccecs: boolean = false;
  formErrors: string;
  fileToDelete: any;
  totalFolderCounter = 0
  totalMapsCounter = 0

  // filter on tree
  public searchTerm = '';
  public parsedData: any[] = this.data;
  public folderNamesList = []

  //chagesProperties variables
  changeFileName = false
  changeDescription = false

  // permissions variables
  currPermissionMapDATA: any[] = [];
  snapshootFirst = [];
  dbAction = false;
  @Input() autoCompleteUserNames: Array<string> = []
  public autoCompleteUserNamesFilterd: Array<string> = [];
  public autoCompleteUserGroupsFilterd: Array<string> = [];

  newUserPermission = ""
  newGroupPermission = ""
  userNotFound = false
  startWrite=false

  currPermissionMapDATAGroupsNumber = 0
  currPermissionMapDATAUsersNumber = 0
  // sharedMaps variables
  sharedMapList_notAssociated = []
  sharedMapList_Associated = []
  folderToSelected : Object  
  senderPermissionWindow: any;
  sharedMapsToAddMyTree = [];
 
  // groups permission  butttons
  groupAdderClick = false
  ownerGroupsNames = this.groupsService.allMyGroups.filter(obj=> obj.permission == "Owner");

  
  





  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private userHandler: UsersService, private http: HttpClient, private formBuilder: FormBuilder, 
    public router: Router, public modalService: ModalService, private groupsService: GroupsService) {
    this.addFolderCheckOut = this.formBuilder.group({ folderName: ['', Validators.required], description: ['', Validators.required] });
    this.addMapCheckOut = this.formBuilder.group({ mapName: ['', Validators.required], description: ['', Validators.required] });
    this.editPropertiesCheckOut = this.formBuilder.group({ fileName: [''], description: [''] });
  }



  ngOnInit() {
    // check user connected
    if(sessionStorage.token != null){
      console.log(this.ownerGroupsNames)
          // folders init : find the root Folder
    this.folderHandler.getRootUserFolder().then(res => {
      
      var jsonRes = JSON.parse(JSON.stringify(res))
      this.folderNamesList.push({folderID: jsonRes._id, name: jsonRes.Name})
      this.data.push({
        text: "/",
        folderID: jsonRes._id,
        Description: "",
        parentNode: "",
        items: [],
        isFolder: true,
      })
      // console.log(this.data)

      // get all shared maps of user
      this.mapHandler.getSharedMaps(sessionStorage.userId).then(res => {

        JSON.parse(res).forEach(element => {
          this.sharedMapList_notAssociated.push(element)
        });


        // fill the treeView : jsonRes= folder in backend, this.data= folder on treeView
        this.fillTreeView(jsonRes, this.data[0])
        this.parsedData = this.data;
        this.mapHandler.folderNamesList = this.folderNamesList

        // this.autoCompleteUserNamesFilterd = this.autoCompleteUserNames.slice();
        

      }).catch
        (err => {
          console.log("error with getShared maps");
          console.log(err)
        })

    }).catch
    (err => {
      console.log("error with getRoot folder");
      console.log(err)
    })
    }
  }

  public fillTreeView(folderLists, rootNode) {
    if (folderLists.MapsInFolder.length != 0) {
      folderLists.MapsInFolder.forEach(map => {
        var specificMapFromShared = JSON.parse(JSON.stringify(this.sharedMapList_notAssociated.filter(elem => elem.mapID == map.mapID)[0])) 
        rootNode.items.push({ text: map.mapName, mapID: map.mapID, parentNode: rootNode, Description: "", usersPermissionsMap: "",permission: specificMapFromShared.permission ,isFolder: false })
        this.sharedMapList_notAssociated = this.sharedMapList_notAssociated.filter(item => item.mapID != specificMapFromShared.mapID);
        this.sharedMapList_Associated.push(specificMapFromShared)
        this.totalMapsCounter++;
      });
    }
    if (folderLists.SubFolders.length != 0) {
      folderLists.SubFolders.forEach(subFolder => {
        var folderNode = { text: subFolder.folderName, folderID: subFolder.folderID, items: [], parentNode: rootNode, Description: "", usersPermissionsMap: "", isFolder: true }
        rootNode.items.push(folderNode)
        this.folderNamesList.push({folderID: subFolder.folderID, name: subFolder.folderName})
        this.totalFolderCounter++;

        this.folderHandler.getFolderContentsLists(subFolder.folderID).then(res => {
          this.fillTreeView(res, folderNode)

        }).catch
          (err => {
            console.log("error with creation - promise return");
            console.log(err)
          })

      });

    }
  }

  public onSubmit_AddFolder() {
    if (this.addFolderCheckOut.invalid) {
      // console.log("bad form!")
      this.formErrors = "Worng/Missing inputs.<br> Make sure you filled all the requierd fields"
      return;
    }
    this.formErrors = ""
    var self = this
    var findDuplicateFolder = false
    // look for duplicate name
    this.selectedNode.items.forEach(element => {
      if (self.addFolderCheckOut.controls.folderName.value == element.text) {
        findDuplicateFolder = true
      }
    });
    if (findDuplicateFolder == false) {
      this.folderHandler.createFolder(this.addFolderCheckOut.controls.folderName.value, this.addFolderCheckOut.controls.description.value, this.selectedNode.folderID).then(res => {
        console.log('======create new folder request OK=====');
        var jsonRes = JSON.parse(res)
        self.selectedNode.items.push({ text: jsonRes.Name, folderID: jsonRes._id, Description: jsonRes.Description, parentNode: self.selectedNode, items: [], isFolder: true })
        this.folderNamesList.push({folderID: jsonRes._id, name: jsonRes.Name})
        this.actionInModalIsSuccecs = true
       this.closeModal("addFolderModal");
        this.totalFolderCounter++;
      }).catch
        (err => {
          console.log("error with folder creation - promise return");
          console.log(err)
        })

      this.addFolderCheckOut.reset();
    }
    else {
      this.formErrors = "A folder with that name already exists in this folder. <br>Give another name please"
    }

  }

  public onSubmit_AddMap() {
    if (this.addMapCheckOut.invalid) {
      // console.log("bad form!")
      this.formErrors = "Missing inputs.<br>Remember: you must enter some name for the map!"
      return;
    }
    var self = this
    // console.log(this.addMapCheckOut.controls.mapName.value)
    this.formErrors = ""
    var findDuplicateFolder = false
    // look for duplicate name
    this.selectedNode.items.forEach(element => {
      if (self.addMapCheckOut.controls.mapName.value == element.text) {
        findDuplicateFolder = true
      }
    });

    if (findDuplicateFolder == false) {
      // map creation
      this.mapHandler.createMap(this.addMapCheckOut.controls.mapName.value, this.addMapCheckOut.controls.description.value, this.selectedNode.folderID).then(res => {
        console.log('======create new map request OK=====');
        var jsonRes = JSON.parse(res)

        // add to tree-view
        self.selectedNode.items.unshift({ text: jsonRes.MapName, mapID: jsonRes._id, parentNode: this.selectedNode, Description: jsonRes.Description, usersPermissionsMap: "", permission: "Owner",isFolder: false })
        this.actionInModalIsSuccecs = true
        this.closeModal("addMapModal")
        this.totalMapsCounter++;

      }).catch
        (err => {
          console.log("error with map creation - promise return");
          console.log(err)
        })

      this.addMapCheckOut.reset();
    }
    else {
      this.formErrors = "A folder with that name already exists in this folder. <br>Give another name please"
    }
  }
  
  public preOpen_editPropertiesModal(dataItem) {
    if (dataItem.Description == "") {
      if (dataItem.isFolder) {
        this.folderHandler.getFolderDescription(dataItem.folderID).then(res => {
          console.log('======get description folder request OK=====');
          var jsonRes = JSON.parse(res)
          console.log(res)
          console.log(jsonRes.Description)
          dataItem.Description = jsonRes.Description
        }).catch
          (err => {
            console.log("error with get description folder - promise return");
            console.log(err)
          });
      }
      else {
        this.mapHandler.getMapDescription(dataItem.mapID).then(res => {
          console.log('======get description map request OK=====');
          var jsonRes = JSON.parse(res)
          dataItem.Description = jsonRes.Description
        }).catch
          (err => {
            console.log("error with get description map - promise return");
            console.log(err)
          });
      }
    }

  }
  public onSubmit_editProperties() {
    var newName, Description
    if (this.changeFileName) {
      newName = this.editPropertiesCheckOut.controls.fileName.value
    }
    else {
      newName = this.selectedNode.text
    }
    if (this.changeDescription) {
      Description = this.editPropertiesCheckOut.controls.description.value
    }
    else {
      Description = this.selectedNode.Description
    }

    if (this.selectedNode.isFolder) {
      console.log(this.selectedNode.folderID, newName, Description);
      this.folderHandler.updateFolderProperties(this.selectedNode.folderID, newName, Description, this.selectedNode.parentNode.folderID).then(res => {
        // console.log('======update properties folder request OK=====');
        this.selectedNode.Description = Description
        this.selectedNode.text = newName
        this.actionInModalIsSuccecs = true
        this.changeDescription = false;
        this.changeFileName = false;
        this.editPropertiesCheckOut.reset();
        this.closeModal("editPropertiesModal")

      }).catch
        (err => {
          console.log("error with update properties folder - promise return");
          console.log(err)
        });
    }
    else {
      console.log(this.selectedNode.mapID, newName, Description);
      this.mapHandler.updateMapDecription(this.selectedNode.mapID, newName, Description).then(res => {
        // console.log('======update properties map request OK=====');
        this.selectedNode.Description = Description
        this.selectedNode.text = newName
        this.actionInModalIsSuccecs = true
        this.changeDescription = false;
        this.changeFileName = false;
        this.editPropertiesCheckOut.reset();
        this.closeModal("editPropertiesModal")
      }).catch
        (err => {
          console.log("error with update properties map- promise return");
          console.log(err)
        });
    }

  }

  // listeners
  public mouseOverNodeChanger(dataItem) {
    this.mouseOverNode = dataItem
  }

  public clickUpdateDataItem(dataItem) {
    this.selectedNode = dataItem
    console.log(this.selectedNode);

  }

  // update clicked map before move to MapViewer Component
  public loadSelectedMap_toMapViewer(dataItem) {
    if (!dataItem.isFolder) {
      this.mapHandler.getMap(dataItem.mapID).then(res => {
        console.log(res);
        this.mapHandler.currMap_mapViewer = res
        this.router.navigate(['/mapViewer']);
      }).catch
        (err => {
          console.log("error with getMap - promise return");
          console.log(err)
        })

    }
  }


  // ############### modal functionallity ########################

  closeModal(modalId) {
    this.modalService.close(modalId);
    this.actionInModalIsSuccecs = false
    this.formErrors = ''
    this.addFolderCheckOut.reset();
    this.addMapCheckOut.reset();
    this.editPropertiesCheckOut.reset();
    this.changeFileName = false;
    this.changeDescription = false;
  }

  // ############### dialog functionallity (delete files from tree) ########################
  public deleteDialogOpened = false;

  public closeDialog(status, fileToDelete) {
    this.deleteDialogOpened = false;
    if (status == "yes") {  // the user choose to delete the file
      this.recursiveDelete(fileToDelete)
    }
  }

  public openDialog(dataItem) {
    this.fileToDelete = dataItem
    this.deleteDialogOpened = true;
  }

  public recursiveDelete(fileToDelete) {
    if (!fileToDelete.isFolder) {
      return this.deleteSingleMap(fileToDelete)
    }
    if (fileToDelete.isFolder && fileToDelete.items.length == 0) {
      return this.deleteSingleFolder(fileToDelete)
    }
    for (let item of fileToDelete.items) {
      this.recursiveDelete(item)
    }
    return this.deleteSingleFolder(fileToDelete)
  }

  private deleteSingleMap(fileToDelete: any) {
    console.log(fileToDelete)
    this.mapHandler.deleteMap(fileToDelete).then(res => {
      fileToDelete.parentNode.items = fileToDelete.parentNode.items.filter(item => item !== fileToDelete);
      this.data = this.data.slice();
      this.parsedData = this.parsedData.slice();
      this.totalMapsCounter--;
    }).catch(err => {
      console.log(err);
    });
  }

  private deleteSingleFolder(fileToDelete: any) {
    if (fileToDelete.parentNode != "") { // make sure not to delete root folder
      this.folderHandler.removeFolderFromFolder(fileToDelete.parentNode.folderID, fileToDelete.folderID).then(res => {
        fileToDelete.parentNode.items = fileToDelete.parentNode.items.filter(item => item !== fileToDelete);
        this.folderNamesList = this.folderNamesList.filter(item => item.folderID != fileToDelete.folderID);
        this.data = this.data.slice();
        this.parsedData = this.parsedData.slice();
        this.totalFolderCounter--;
      }).catch(err => {
        console.log(err);
      });
    }
  }


  // ############### Tree-view functionallity ########################


  public children = (dataitem: any): Observable<any[]> => of(dataitem.items);
  public hasChildren = (dataitem: any): boolean => !!dataitem.items;

  /**
   * A `collapse` event handler that will remove the node hierarchical index
   * from the collection, collapsing its children.
   */
  public handleCollapse(node) {
    this.expandedKeys = this.expandedKeys.filter(k => k !== node.index);
  }

  /**
  * An `expand` event handler that will add the node hierarchical index
  * to the collection, expanding the its children.
  */
  public handleExpand(expandedNode) {
    this.expandedKeys = this.expandedKeys.concat(expandedNode.index);
  }

  public isExpanded = (dataItem: any, index: string) => {

    return this.expandedKeys.indexOf(index) > -1;
  }

  public onkeyup(value: string): void {
    this.parsedData = this.search(this.data, value);
    // console.log(this.parsedData)
  }

  public search(items: any[], term: string): any[] {
    return items.reduce((acc, item) => {
      if (this.contains(item.text, term)) {
        acc.push(item);
      } else if (item.items && item.items.length > 0) {
        const newItems = this.search(item.items, term);

        if (newItems.length > 0) {
          acc.push({ text: item.text, items: newItems });
        }
      }

      return acc;
    }, []);
  }

  public contains(text: string, term: string): boolean {
    return text.toLowerCase().indexOf(term.toLowerCase()) >= 0;
  }

  // tree-view icon's init
  public iconClass(dataItem): any {

    return {
      'k-i-file-pdf': is(dataItem.text, 'pdf'),
      'k-i-folder': dataItem.items !== undefined,
      'k-i-table-align-middle-center': dataItem.items == undefined,
      'k-i-image': is(dataItem.text, 'jpg|png'),
      'k-icon': true
    };
  }

// ############### permissions functionallity ########################

deleteUsersChange: boolean = false;
deleteUserList = []
updatePermissionUsers =[]
userDeleteDialogOpened = false;
userToDelete : any;
newUserPermissionChoose: any


  public closeUserPerimssionDialog(status) {
    this.userDeleteDialogOpened = false;
    if (status == "yes") {  // the user choose to delete the file
      this.removeUserHandler(this.userToDelete)
    }
  }

  public openUserPerimssionDialog(dataItem) {
    this.userDeleteDialogOpened = true;
    this.userToDelete = dataItem
  }

  public loadPermissionTable() {
    this.currPermissionMapDATAGroupsNumber = 0
    this.currPermissionMapDATAUsersNumber = 0
    this.currPermissionMapDATA = []
    // if (this.selectedNode.usersPermissionsMap == "") {
      var usersPermissionsMap = new Map();
      this.mapHandler.getUsersPermissionsMap(this.selectedNode.mapID).then(res => {
        var permissionsList = JSON.parse(res)
        console.log(permissionsList)
        //add read-permission users
        permissionsList.read.forEach(readPermission_user => {
          if(readPermission_user.type == "PersonalPermission"){
            usersPermissionsMap.set(readPermission_user._id, { type: "PersonalPermission", username: readPermission_user.Username, name: readPermission_user.FirstName + " " + readPermission_user.LastName, permission: "Read"});
            this.currPermissionMapDATAUsersNumber++;
          }
          else{
            usersPermissionsMap.set(readPermission_user._id, { type: "Group", username: readPermission_user.Name,  permission: "Read"});
            this.currPermissionMapDATAGroupsNumber++;
          }
        });

        //add write-permission users
        permissionsList.write.forEach(writePermission_user => {
          if (usersPermissionsMap.has(writePermission_user._id)) {
            usersPermissionsMap.get(writePermission_user._id).permission = "Write"
          }
          else {
            if(writePermission_user.type == "PersonalPermission"){
              usersPermissionsMap.set(writePermission_user._id, { type: "PersonalPermission", username: writePermission_user.Username, name: writePermission_user.FirstName + " " + writePermission_user.LastName, permission: "Write" })
              this.currPermissionMapDATAUsersNumber++;
            }
            else{
              usersPermissionsMap.set(writePermission_user._id, { type: "Group", username: writePermission_user.Name,  permission: "Write"});
              this.currPermissionMapDATAGroupsNumber++;
            }
          }
        });

        //add owner-permission users
        permissionsList.owner.forEach(ownerPermission_user => {
          if(usersPermissionsMap.has(ownerPermission_user._id)){
            usersPermissionsMap.get(ownerPermission_user._id).permission = "Owner"
          }
          else{
            if(ownerPermission_user.type == "PersonalPermission"){
              usersPermissionsMap.set(ownerPermission_user._id,{type: "PersonalPermission", username: ownerPermission_user.Username ,name: ownerPermission_user.FirstName+" "+ownerPermission_user.LastName, permission: "Owner"})
              this.currPermissionMapDATAUsersNumber++;
            }
            else{
              usersPermissionsMap.set(ownerPermission_user._id, { type: "Group", username: ownerPermission_user.Name,  permission: "Owner"});
              this.currPermissionMapDATAGroupsNumber++;
            }   
          }
        });
      this.selectedNode.usersPermissionsMap = usersPermissionsMap
      console.log(this.selectedNode.usersPermissionsMap)
      for (const [key,value] of this.selectedNode.usersPermissionsMap.entries()) { 
        if(key != sessionStorage.userId)  // not showe myself
        {
          this.currPermissionMapDATA.push(value);
        }
      }
      // snapShot of permissions
      this.currPermissionMapDATA.forEach(val => this.snapshootFirst.push({type: val.type, username: val.username, name: val.name, permission: val.permission}));
      console.log("%%%%%%%%%%%%%%%%%%")
      console.log(this.selectedNode.usersPermissionsMap)
      }).catch(err => {
        console.log(err);
      });
      console.log(this.currPermissionMapDATA);
  }


  public cancelHandler({sender,rowIndex}) {
    this.newUserPermissionChoose = null
    this.userNotFound = false
    sender.closeRow(rowIndex);
  }

  public openNewRow(event) {
    this.startWrite=false
    console.log(event)
    // define all editable fields validators and default values
    const newUser = new FormGroup({
      // 'username': new FormControl(""),
      'permission': new FormControl({"": []})
    });

    // RESETS
    this.newUserPermission = ""
    this.newGroupPermission = ""
    this.userNotFound = false
    this.senderPermissionWindow =  event.sender
    event.sender.addRow(newUser);
  }


  public addNewUserToPermission(event){
    this.userNotFound = false
    console.log(this.selectedNode)
    console.log(event)
    console.log("##----###")
    console.log(this.newUserPermissionChoose)

    this.dbAction = true

    var selectedTypeObj = ""
    if(this.groupAdderClick){
      selectedTypeObj = "Group"
    }
    else{
      selectedTypeObj = "PersonalPermission"
    }
    
    this.mapHandler.addNewPermission(this.selectedNode.mapID,this.newUserPermissionChoose.target.name,selectedTypeObj,this.newUserPermissionChoose.target.id).then(res => {
      console.log("here now")
      this.dbAction = false
      var jsonRes = JSON.parse(res)
      console.log(jsonRes)
        // ---- seach for username in DB ---  then --//
        console.log()
    if(this.newUserPermissionChoose != null){
      this.currPermissionMapDATA.push({type: jsonRes.type, username: this.newUserPermissionChoose.target.name, name: jsonRes.name, permission: this.newUserPermissionChoose.target.id})
      if(jsonRes.type == "Group"){
        this.currPermissionMapDATAGroupsNumber++;
      }
      else{
        this.currPermissionMapDATAUsersNumber++;
      }
      
      // update snapshoorFirst
      this.snapshootFirst = []
      this.currPermissionMapDATA.forEach(element => {
        this.snapshootFirst.push({type: jsonRes.type, username: element.username, name: element.name, permission: element.permission})
      });

      // console.log(res)
      // update usersPermissionsMap
      this.selectedNode.usersPermissionsMap.set(jsonRes._id, { type: jsonRes.type ,username: this.newUserPermissionChoose.target.name, name: jsonRes.name, permission: this.newUserPermissionChoose.target.id })

      this.newUserPermissionChoose = null
    }
    console.log(event)
    this.cancelHandler(event)

    
   
      }).catch(err => {
        this.dbAction = false;
        if(err.status == 404)
          console.log("theres no such user!!")
          this.userNotFound = true
        // console.log(err);
      });
  }

  public removeUserHandler(event) {
    console.log(event.dataItem)
    console.log(this.currPermissionMapDATA)
    // this.currPermissionMapDATA.forEach(element => {
    //   if(element == dataItem)
    //     console.log(true)
    // });
    this.deleteUserList.push(event.dataItem)
    this.currPermissionMapDATA = this.currPermissionMapDATA.filter(item => item !== event.dataItem);
    this.deleteUsersChange = true
  }


  public saveAllChangesClick() {
    console.log("selectNode map: ")
    // console.log(this.selectedNode.usersPermissionsMap);
    console.log("delete list:")
    
    console.log( this.deleteUserList)
    console.log("update list:")
    console.log( this.updatePermissionUsers)
    let promises = [];
    // ---- delete all remove users -------
    this.deleteUserList.forEach(deleteUser => {
      var userID = this.getKeyFromValue(deleteUser)

      // look if user changed on radiobuttons
      var duplicateUser = this.updatePermissionUsers.find(elem => elem.userID == userID)
      if(duplicateUser!= null){
        // take the old permission to delete and delete from updateButtonsList
        if(deleteUser.type == "PersonalPermission"){
          promises.push(this.mapHandler.removeUserPermission(this.selectedNode.mapID, userID, duplicateUser.old))
        }
        else{ // group element
          promises.push(this.mapHandler.removeGroupPermission(this.selectedNode.mapID,userID))
        }
        this.updatePermissionUsers = this.updatePermissionUsers.filter(item => item != duplicateUser);
      }
      else{
        if(deleteUser.type == "PersonalPermission"){
          promises.push(this.mapHandler.removeUserPermission(this.selectedNode.mapID, userID, duplicateUser.old))
        }
        else{ // group element
          promises.push(this.mapHandler.removeGroupPermission(this.selectedNode.mapID,userID))
        }
        this.updatePermissionUsers = this.updatePermissionUsers.filter(item => item != duplicateUser);
      }
      this.currPermissionMapDATA = this.currPermissionMapDATA.filter(item => item !== deleteUser);
      this.selectedNode.usersPermissionsMap.delete(userID)
    });

    // ----- update all radiobuttons -------
    this.updatePermissionUsers.forEach(user => {

      promises.push(this.mapHandler.addNewPermission(this.selectedNode.mapID,user.username.username ,user.type ,user.new ))
      // promises.push(this.mapHandler.updateUserPermission(this.selectedNode.mapID, user.userID, user.old, user.new))
      // update mapPermission on selectedMap
      for (const [key, value] of this.selectedNode.usersPermissionsMap.entries()) {
        if (key == user.userID) {
          value.permission = user.new;
        }
      }
    });
    this.dbAction = true;
    Promise.all(promises.map(p => p.catch(e => e)))
      .then(results => {
        console.log("selectNode map: " + this.selectedNode.usersPermissionsMap)
        // users Reset
        this.deleteUserList = []
        this.deleteUsersChange = false

        // permissions Reset
        this.updatePermissionUsers = []
        this.snapshootFirst = []
        // this.currPermissionMapDATA.forEach(element => {
        //   this.snapshootFirst.push({ username: element.username, name: element.name, permission: element.permission })
        // });

        this.loadPermissionTable()
        this.dbAction = false;


      })
      .catch(e => alert(e));
  }

  public undoAllChangesClick() {

    // undo all deleted
    this.deleteUserList.forEach(deleteUser => {
      this.currPermissionMapDATA.push(deleteUser)
    });
    this.currPermissionMapDATA = this.currPermissionMapDATA.slice()
    this.deleteUserList = []
    this.deleteUsersChange = false

    // undo all radioButtons
    this.currPermissionMapDATA = []
    this.snapshootFirst.forEach(element => {
      this.currPermissionMapDATA.push({ type: element.type, username: element.username, name: element.name, permission: element.permission })
    });
    this.currPermissionMapDATA = this.currPermissionMapDATA.slice()
    this.updatePermissionUsers = []

    // undo addUserRow (only close added row!)
    this.newUserPermission = ""
    this.newGroupPermission =""
    this.userNotFound = false
    // this.cancelHandler(event)
  }

  public openPermissionsModal() {
    this.deleteUsersChange = false
    this.deleteUserList = []
    this.snapshootFirst = []
    // console.log("curr "+ this.currPermissionMapDATA)
    this.currPermissionMapDATA.forEach(element => {
      this.snapshootFirst.push({ type: element.type, username: element.username, name: element.name, permission: element.permission })
    });
    if(this.senderPermissionWindow != null){
      this.senderPermissionWindow.closeRow(-1);
    }
    this.modalService.open('usersPermissionsModal')

  }

  cleanFromDuplicates(){
    return this.currPermissionMapDATA.find(i => i.username === this.newUserPermission) != null
  }

  cleanFromDuplicatesGroups(){
    return this.currPermissionMapDATA.find(i => i.username === this.newGroupPermission) != null
  }
  public closePermissionModal(modalId) {
    this.deleteUsersChange = false
    this.deleteUserList = []
    this.currPermissionMapDATA = []
    this.snapshootFirst = [];
    this.modalService.close(modalId);
    
  }

  radioButtonsUpdate(event, rowIndex,dataItem) {
    console.log(event)
    console.log(dataItem)
    
    if (rowIndex !=-1){
      console.log(this.currPermissionMapDATA)

      // update node in currDATA
      var selectRow = JSON.parse(JSON.stringify(this.currPermissionMapDATA.filter(function (item) { return item.username == event.target.name; })[0]))
      selectRow.permission = event.target.id
      this.currPermissionMapDATA.find(item => item.username == event.target.name).permission = event.target.id;

      // origin item before this change
      var originRow = JSON.parse(JSON.stringify(this.snapshootFirst.filter(item => { return item.username == selectRow.username })[0]))
      var toAdd = { type: dataItem.type, username:originRow, userID: this.getKeyFromValue(originRow), old: originRow.permission, new: selectRow.permission }


      if (this.snapshootFirst.some(item => item.username == selectRow.username && item.permission == selectRow.permission)) { // back to origin!
        console.log("back to origin!");
        this.updatePermissionUsers = this.updatePermissionUsers.filter(item => item.userID != toAdd.userID);
      }
      else { // new permission choosen
        console.log("new permission");
        if (this.updatePermissionUsers.some(item => item.userID === toAdd.userID)) {
          this.updatePermissionUsers = this.updatePermissionUsers.filter(item => item.userID !== toAdd.userID);
        }

        this.updatePermissionUsers.push(toAdd)
      }

      console.log(this.updatePermissionUsers);
    }
    else{   // new row permission touch
      this.newUserPermissionChoose = event
      }
}

  private getKeyFromValue(dataItem) {
    for (const [key, value] of this.selectedNode.usersPermissionsMap.entries()) {
      if (value.username == dataItem.username) {
        return key
      }
    }
  }

  autoCompleteHandler(value) {
    this.startWrite=true
    this.autoCompleteUserNamesFilterd = this.autoCompleteUserNames.filter((s) => s.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    this.autoCompleteUserNamesFilterd = this.autoCompleteUserNamesFilterd .filter(obj=> obj != sessionStorage.user)
    for (const [key,value] of this.selectedNode.usersPermissionsMap.entries()) { 
      this.autoCompleteUserNamesFilterd = this.autoCompleteUserNamesFilterd.filter(obj => obj != value.username);
    }
  }

  autoCompleteHandlerGroups(value) {
    this.startWrite=true
    this.ownerGroupsNames = this.groupsService.allMyGroups.filter(obj=> obj.permission == "Owner").map(({ text }) => text);;
    console.log(this.ownerGroupsNames)
    this.autoCompleteUserGroupsFilterd = this.ownerGroupsNames.filter((s) => s.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    this.autoCompleteUserGroupsFilterd = this.autoCompleteUserGroupsFilterd.filter(obj=> obj != sessionStorage.user)
    for (const [key,value] of this.selectedNode.usersPermissionsMap.entries()) { 
      this.autoCompleteUserGroupsFilterd = this.autoCompleteUserGroupsFilterd.filter(obj => obj != value.username);
    }
  }

// ############### permissions- not Associated  functionallity ########################

checkCheckBoxvalue(event, clickedMap){
  if(event.checked){
    this.sharedMapsToAddMyTree.push(clickedMap)
  }else{
    this.sharedMapsToAddMyTree = this.sharedMapsToAddMyTree.filter(obj=>obj != clickedMap.mapID)
  }
  console.log(event.checked)


}

getNodeFromTree(currNode,folderID){
  if(currNode.isFolder && currNode.folderID == folderID){
    return currNode
  }
    if(currNode.items != null){
      for (let item of currNode.items) {
        if(item.isFolder)
          return this.getNodeFromTree(item, folderID)
      }
  }

}
AssociatedMap(){
  // console.log(sharedMap)
  // console.log(this.folderToSelected)
  // console.log(this.sharedMapsToAddMyTree)
//   "mapID" : req.body.mapID, "mapName": req.body.mapName
  var folderToSelected = JSON.parse(JSON.stringify(this.folderToSelected))
  var subList = []
  this.sharedMapsToAddMyTree.forEach(element => {
    subList.push({mapID: element.mapID, mapName: element.MapName})
  });

  // console.log(subList)
  this.folderHandler.addExistMapToFolder(folderToSelected.folderID,subList).then(res => {
    this.sharedMapsToAddMyTree.forEach(sharedMap => {
      this.sharedMapList_notAssociated = this.sharedMapList_notAssociated.filter(item => item.mapID != sharedMap.mapID);
      this.sharedMapList_Associated.push(sharedMap)
      this.folderToSelected == ''

      // add to tree
      var parentFolder = this.getNodeFromTree(this.data[0],folderToSelected .folderID)
      parentFolder.items.unshift({ text: sharedMap.MapName, mapID: sharedMap.mapID, parentNode: parentFolder, Description: "", usersPermissionsMap: "",permission: sharedMap.permission ,isFolder: false })
      // console.log(parentFolder)
      this.totalMapsCounter++;
    });

  }).catch
    (err => {
      console.log("error with creation - promise return");
      console.log(err)
    })
}
  

}

