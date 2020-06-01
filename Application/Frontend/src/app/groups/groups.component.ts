import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';
import { UsersService } from '../services/users/users.service';
import { ModalService } from '../services/modal.service';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTable } from '@angular/material';
import { Observable, of } from 'rxjs';

export interface Iuser {
  Permission: string;
  _id: string,
  Userame: string;
  FirstName: string;
  LastName: string;
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})

export class GroupsComponent implements OnInit {
  // isPermissionChanged: boolean = false;
  // selectedPermission = 'Member';
  // currentlyEditedGroupId: string;
  // error: string;
  // groupsUserOwns;
  // groupsUserMember;
  // formErrors: string;
  // newUserPermissionChoice: any = null;
  // userDeleteDialogOpened: boolean = false;
  // userToDelete: any;


  // groupsPermissionList: any[] = [];
  // groupsNoPermissionList: any[] = [];

  public groupsArray: any[] = [
    { text: "Owner Groups", isTitle: "true", items: [] },
    { text: "Shared Groups :Manager Permission", isTitle: "true", items: [] },
    { text: "Shared Groups :Member Permission", isTitle: "true", items: [] },
  ];
  public expandedKeys: any[] = ['Owner Groups'];
  addGroupCheckOut;
  selectedNode : any = { text: "", Description: "" };

  changeFileName = false
  changeDescription = false
  ErrPreSubmit = false
  ErrPreSubmitDuplicateNames = false

  totalGroupsNumber = 0;
  mouseOverNode: any;
  fileToDelete = null;
  deleteDialogOpened = false;
  editPropertiesCheckOut: FormGroup;

  // permissions variables
  currPermissionMapDATA: any[] = [];
  snapshootFirst = [];
  dbAction = false;
  @Input() autoCompleteUserNames: Array<string> = []
  public autoCompleteUserNamesFilterd: Array<string> = [];
  newUserPermission = ""
  userNotFound = false
  watcherPermission = "";
  senderPermissionWindow: any;
  startWrite=false

  constructor(private router: Router, private http: HttpClient, private groupsService: GroupsService,
    private usersService: UsersService, public modalService: ModalService,
    private formBuilder: FormBuilder) {

    this.addGroupCheckOut = this.formBuilder.group({
      groupName: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.editPropertiesCheckOut = this.formBuilder.group({ fileName: [''], description: [''] });

  }

  ngOnInit() {
    this.groupsService.allMyGroups = []
    // check user connected
    if (sessionStorage.token != null) {
      this.getMyGroups();
    }
  }

  // UPDATE
  private getMyGroups() {
    this.groupsService.getMyGroups()
      .then(response => {
        var totalGroups = JSON.parse(JSON.stringify(response))
        this.addToTreeView(totalGroups)
        this.totalGroupsNumber = this.groupsArray[0].items.length + this.groupsArray[1].items.length + this.groupsArray[2].items.length
        totalGroups.forEach(element => {
          this.groupsService.allMyGroups.push(element)
        });
      }, error => {
        console.log(error.error);
        alert(error.error);
      });
  }

  // UPDATE
  private addToTreeView(listToadd) {
    listToadd.forEach(element => {
      if (element.permission == "Owner") {
        this.groupsArray[0].items.push(element);
      } else if (element.permission == "Manager") {
        this.groupsArray[1].items.push(element);
      }
      else {
        this.groupsArray[2].items.push(element)
      }
    });
  }

// UPDATE
  public createGroup() {
    this.ErrPreSubmit = false
    this.ErrPreSubmitDuplicateNames = false;
    console.log(this.groupsService.allMyGroups)
    
    // check duplicate name in your tree
      if(this.addGroupCheckOut.controls.groupName.value != null && 
        this.addGroupCheckOut.controls.description.value != null && /\S/.test(this.addGroupCheckOut.controls.groupName.value) && /\S/.test(this.addGroupCheckOut.controls.description.value) ){
        if(this.groupsArray[0].items.find(x => x.text == this.addGroupCheckOut.controls.groupName.value) == null){
        this.groupsService.createNewGroup(this.addGroupCheckOut.controls.groupName.value, this.addGroupCheckOut.controls.description.value)
        .then(res => {
          var jsonRes =  JSON.parse(JSON.stringify(res))
          this.groupsService.allMyGroups.push({ text: jsonRes.Name, GroupId: jsonRes._id, GroupDescription: jsonRes.Description, permission: "Owner"})
          this.addToTreeView([{GroupId: jsonRes._id, text: jsonRes.Name, GroupDescription: jsonRes.Description, permission: "Owner" ,usersPermissionsMap: ""}])
          this.addGroupCheckOut.controls.groupName.value = ""
          this.addGroupCheckOut.controls.description.value = ""
          this.addGroupCheckOut.reset()
          this.closeModal('addGroupModal');
        });
      }
      else{
        this.ErrPreSubmitDuplicateNames =true;
        }
      }
    else{
      this.ErrPreSubmit = true;
    }

  }

// UPDATE
  public closeDialog(status) {
    this.deleteDialogOpened = false;
    if (status == "yes") {  // the user choose to delete the file

    // Delete group from DB
    this.groupsService.deleteGroup(this.fileToDelete.GroupId).then(res => {
      console.log("done")
      console.log(res)

      this.groupsService.allMyGroups = this.groupsService.allMyGroups.filter(obj=>obj.GroupId != this.fileToDelete.GroupId)
      this.groupsService.allMyGroups =this.groupsService.allMyGroups.slice();
      this.groupsArray[0].items = this.groupsArray[0].items.filter(obj => obj !== this.fileToDelete);
      this.groupsArray = this.groupsArray.slice();
    }).catch
      (err => {
        console.log("error with delete group");
        console.log(err)
      });
 
  }
}

// UPDATE
  public openDialog(dataItem) {
    this.fileToDelete = dataItem
    console.log(this.fileToDelete)
    this.deleteDialogOpened = true;
  }
  

// UPDATE
  openModalWithDataItem(dataItem,modalName) {
    console.log(dataItem)
    this.selectedNode = dataItem
    if(modalName == "permissionGroupModal" ){
      this.loadPermissionTable();
    }

    this.modalService.open(modalName)
    console.log(this.senderPermissionWindow)
    if(this.senderPermissionWindow != null){
      this.senderPermissionWindow.closeRow(-1);
    }
  }
// UPDATE
  closeModal(modalId) {
    this.modalService.close(modalId);
    this.editPropertiesCheckOut.reset();
    this.changeFileName = false;
    this.changeDescription = false;
    this.addGroupCheckOut.reset();
    this.ErrPreSubmit = false
    this.ErrPreSubmitDuplicateNames = false;
  }

// UPDATE
  public onSubmit_editProperties() {
    this.ErrPreSubmitDuplicateNames = false;
    this.ErrPreSubmit = false
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
      Description = this.selectedNode.GroupDescription
    }

      console.log(this.selectedNode.GroupId, newName, Description);

      if(/\S/.test(newName) && /\S/.test(Description) ){
        var sameNameGroups = this.groupsArray[0].items.find(x => x.text == newName)
        if((sameNameGroups == null) || (sameNameGroups !=null && sameNameGroups.GroupId == this.selectedNode.GroupId)){
          this.groupsService.updateGroupProperties(this.selectedNode.GroupId,newName,Description)
          .then(res => {
            console.log(res)
            this.selectedNode.GroupDescription = Description
            this.selectedNode.text = newName
            this.changeDescription = false;
            this.changeFileName = false;
            this.editPropertiesCheckOut.reset();
            this.closeModal("editPropertiesGroupModal");
          }).catch
            (err => {
              console.log("error with update properties folder - promise return");
              console.log(err)
        });
        }
        else{
          this.ErrPreSubmitDuplicateNames =true;
        }
      }
      else{
        this.ErrPreSubmit = true
      }

  }


  // UPDATE
  closeModal_addGroup() {
    this.modalService.close('addGroupModal');
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

  public mouseOverNodeChanger(dataItem) {
    this.mouseOverNode = dataItem
  }

 // ############### Permissions functionallity ########################

  autoCompleteHandler(value) {
    this.startWrite=true
    this.autoCompleteUserNamesFilterd = this.autoCompleteUserNames.filter((s) => s.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    this.autoCompleteUserNamesFilterd = this.autoCompleteUserNamesFilterd .filter(obj=> obj != sessionStorage.user)
    for (const [key,value] of this.selectedNode.usersPermissionsMap.entries()) { 
      this.autoCompleteUserNamesFilterd = this.autoCompleteUserNamesFilterd.filter(obj => obj != value.username);
    }
  }

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
    this.currPermissionMapDATA = []
    console.log("here")
    var usersPermissionsMap = new Map();
    var managerUser = false
    this.groupsService.getGroupsMembers(this.selectedNode.GroupId).then(res => {
      var permissionsList = JSON.parse(JSON.stringify(res))
      //add Manager-permission users
      permissionsList.Manager.forEach(ManagerUser => {
        if(ManagerUser._id == sessionStorage.userId){
          managerUser = true
        }
        usersPermissionsMap.set(ManagerUser._id, { username: ManagerUser.Username, name: ManagerUser.FirstName + " " + ManagerUser.LastName, permission: "Manager" })
      });

      //add Member-permission users
      permissionsList.Member.forEach(MemberUser => {
        if (usersPermissionsMap.has(MemberUser._id)) {
          usersPermissionsMap.get(MemberUser._id).permission = "Member"
          if(MemberUser._id == sessionStorage.userId){
            managerUser = false
          }
        }
        else {
          usersPermissionsMap.set(MemberUser._id, { username: MemberUser.Username, name: MemberUser.FirstName + " " + MemberUser.LastName, permission: "Member" })
        }
      });

      //add owner-permission users
      permissionsList.Owner.forEach(OwnerUser => {
        if(usersPermissionsMap.has(OwnerUser._id)){
          usersPermissionsMap.get(OwnerUser._id).permission = "Owner"
          if(OwnerUser._id == sessionStorage.userId){
            managerUser = false
          }
        }
        else{
          usersPermissionsMap.set(OwnerUser._id,{username: OwnerUser.Username ,name: OwnerUser.FirstName+" "+OwnerUser.LastName, permission: "Owner"})
        }
      });
    this.selectedNode.usersPermissionsMap = usersPermissionsMap

    console.log(this.selectedNode.usersPermissionsMap)
    for (const [key,value] of this.selectedNode.usersPermissionsMap.entries()) { 
      if(key != sessionStorage.userId)  // not show myself
      {
        if(managerUser){
          if(value.permission != 'Owner'){
            this.currPermissionMapDATA.push(value);
          }
        }
        else{
          this.currPermissionMapDATA.push(value);
        }
        
      }
    }
    // snapShot of permissions
    this.currPermissionMapDATA.forEach(val => this.snapshootFirst.push({username: val.username, name: val.name, permission: val.permission}));
    console.log(this.selectedNode.usersPermissionsMap)
    }).catch(err => {
      console.log(err);
    });
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
    this.userNotFound = false
    this.senderPermissionWindow =  event.sender
    event.sender.addRow(newUser);
  }

  public cancelHandler({sender,rowIndex}) {
    this.newUserPermissionChoose = null
    this.userNotFound = false
    console.log(sender)
    sender.closeRow(rowIndex);
  }


  radioButtonsUpdate(event, rowIndex) {
    console.log(event)
    
    if (rowIndex !=-1){
      console.log(this.currPermissionMapDATA)

      // update node in currDATA
      var selectRow = JSON.parse(JSON.stringify(this.currPermissionMapDATA.filter(function (item) { return item.username == event.target.name; })[0]))
      selectRow.permission = event.target.id
      this.currPermissionMapDATA.find(item => item.username == event.target.name).permission = event.target.id;

      // origin item before this change
      var originRow = JSON.parse(JSON.stringify(this.snapshootFirst.filter(item => { return item.username == selectRow.username })[0]))
      var toAdd = { userID: this.getKeyFromValue(originRow), old: originRow.permission, new: selectRow.permission }


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

  cleanFromDuplicates(){
    return this.currPermissionMapDATA.find(i => i.username === this.newUserPermission) != null
  }

  watcherPermissionStatus(){
    try{
      if(this.selectedNode.hasOwnProperty('usersPermissionsMap')){
        this.watcherPermission = this.selectedNode.usersPermissionsMap.get(sessionStorage.userId).permission
        return this.watcherPermission
      }

      return ""
    } catch{
      return ""
    }
  }

  public addNewUserToPermission(event){
    this.userNotFound = false
    console.log(this.selectedNode)
    console.log(event)
    this.dbAction = true

    this.groupsService.addUserToGroup(this.selectedNode.GroupId,this.newUserPermissionChoose.target.name, this.newUserPermissionChoose.target.id).then(res => {
      this.dbAction = false
      var jsonRes = JSON.parse(res)
        // ---- seach for username in DB ---  then --//
    if(this.newUserPermissionChoose != null){
      this.currPermissionMapDATA.push({username: this.newUserPermissionChoose.target.name, name: jsonRes.FirstName + " " + jsonRes.LastName, permission: this.newUserPermissionChoose.target.id})
      

      // update snapshoorFirst
      this.snapshootFirst = []
      this.currPermissionMapDATA.forEach(element => {
        this.snapshootFirst.push({username: element.username, name: element.name, permission: element.permission})
      });

      // console.log(res)
      // update usersPermissionsMap
      this.selectedNode.usersPermissionsMap.set(jsonRes._id, { username: this.newUserPermissionChoose.target.name, name: jsonRes.FirstName + " " + jsonRes.LastName, permission: this.newUserPermissionChoose.target.id })

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
      this.currPermissionMapDATA.push({ username: element.username, name: element.name, permission: element.permission })
    });
    this.currPermissionMapDATA = this.currPermissionMapDATA.slice()
    this.updatePermissionUsers = []

    // undo addUserRow (only close added row!)
    this.newUserPermission = ""
    this.userNotFound = false
    // this.cancelHandler(event)
  }

  public closePermissionModal(modalId) {
    this.deleteUsersChange = false
    this.deleteUserList = []
    this.currPermissionMapDATA = []
    this.snapshootFirst = [];
    this.modalService.close(modalId);

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
        promises.push(this.groupsService.removeUserFromGroup(this.selectedNode.GroupId,userID,duplicateUser.old))
        this.updatePermissionUsers = this.updatePermissionUsers.filter(item => item != duplicateUser);
      }
      promises.push(this.groupsService.removeUserFromGroup(this.selectedNode.GroupId, userID, this.selectedNode.usersPermissionsMap.get(userID).permission))
      this.currPermissionMapDATA = this.currPermissionMapDATA.filter(item => item !== deleteUser);
      this.selectedNode.usersPermissionsMap.delete(userID)
    });

    // ----- update all radiobuttons -------
    this.updatePermissionUsers.forEach(user => {
      promises.push(this.groupsService.updateUserPermission(this.selectedNode.GroupId, user.userID, user.old, user.new))
      
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
        this.dbAction = false;
        // console.log("currPermissionMapDATA: "+this.currPermissionMapDATA)
        // console.log("selectNode map: " + this.selectedNode.usersPermissionsMap)
        // users Reset
        this.deleteUserList = []
        this.deleteUsersChange = false
        // permissions Reset
        this.updatePermissionUsers = []
        this.snapshootFirst = []
        this.currPermissionMapDATA.forEach(element => {
          this.snapshootFirst.push({ username: element.username, name: element.name, permission: element.permission })
        });


      })
      .catch(e => alert(e));
  }
  

}
