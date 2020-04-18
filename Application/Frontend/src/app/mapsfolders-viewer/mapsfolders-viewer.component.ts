import { Component, OnInit } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { of, Observable, Subject, from } from 'rxjs';
import { ModalService } from '../services/modal.service';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {trigger, style, animate, transition} from '@angular/animations';
import { map } from '@progress/kendo-data-query/dist/npm/transducers';
import { UsersService } from '../services/users/users.service';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
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
  selectedNode: any = {text:"", Description: ""};
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

  //chagesProperties variables
  changeFileName = false
  changeDescription = false

  // permissions variables
  currPermissionMapDATA: any[]  = [];
  public buttonCount = 5;
  public info = true;
  public type: 'numeric'
  public pageSizes = true;
  public previousNext = true;
  public parsedDataPermissions: GridDataResult;
  public pageSize = 5;
  public changes: any = {};
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 10
};
  





  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private userHandler: UsersService, private http: HttpClient,  private formBuilder: FormBuilder, public router: Router,private modalService: ModalService) {
    this.addFolderCheckOut = this.formBuilder.group({folderName: ['', Validators.required],description: ['', Validators.required]});
    this.addMapCheckOut = this.formBuilder.group({mapName: ['', Validators.required],description: ['', Validators.required]});
    this.editPropertiesCheckOut = this.formBuilder.group({fileName: [''],description: ['']});
    
  }
  


  ngOnInit() {
    //fisrt push by hand
    this.data.push({
      text: "/",
      folderID: "5e80d535132e0540b827c4cd",
      Description:"",
      parentNode: "",
      items: [],
      isFolder : true,
    })
    // folders init : find the root Folder
    this.folderHandler.getRootUserFolder().then(res => {
      this.fillTreeView(res, this.data[0])
    }).catch
      (err => {
        console.log("error here");
        console.log(err)
      })
      this.parsedData = this.data;

      // permissions init
      // this.view = this.editService.pipe(map(data => process(data, this.gridState)));

  }

fillTreeView(folderLists,rootNode){
  if(folderLists.MapsInFolder.length != 0){
    folderLists.MapsInFolder.forEach(map => {
      rootNode.items.push({text: map.mapName, mapID: map.mapID, parentNode:rootNode, Description: "",mapPermission: "" , isFolder: false})
      this.totalMapsCounter++;
    });
  }
  if(folderLists.SubFolders.length != 0){
    folderLists.SubFolders.forEach(subFolder => {
      var folderNode = {text: subFolder.folderName, folderID: subFolder.folderID, items: [], parentNode:rootNode, Description: "",mapPermission: "" , isFolder: true}
      rootNode.items.push(folderNode)
      this.totalFolderCounter++;
      
      this.folderHandler.getFolderContentsLists(subFolder.folderID).then(res => {
        this.fillTreeView(res,folderNode)

      }).catch
        (err=> {
          console.log("error with creation - promise return");
          console.log(err)
        })

    });

  }
}

onSubmit_AddFolder(){
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
    if (self.addFolderCheckOut.controls.folderName.value == element.text){
      findDuplicateFolder = true
    } 
  });
  if(findDuplicateFolder == false){
    this.folderHandler.createFolder(this.addFolderCheckOut.controls.folderName.value,this.addFolderCheckOut.controls.description.value,this.selectedNode.folderID).then(res => {
      console.log('======create new folder request OK=====');
      var jsonRes = JSON.parse(res)
      self.selectedNode.items.push({text: jsonRes.Name, folderID: jsonRes._id, Description: jsonRes.Description, parentNode: self.selectedNode, items: [], isFolder: true})
      this.actionInModalIsSuccecs = true
      setTimeout (() => {this.closeModal("addFolderModal")}, 1000);
    }).catch
      (err=> {
        console.log("error with folder creation - promise return");
        console.log(err)
      })

    this.addFolderCheckOut.reset();
  }
  else{
    this.formErrors = "A folder with that name already exists in this folder. <br>Give another name please"
  }

}

onSubmit_AddMap(){
  if (this.addMapCheckOut.invalid) {
    // console.log("bad form!")
    this.formErrors = "Missing inputs.<br>Remember: you must enter some name for the map!"
    return;
  }
  var self = this
  console.log(this.addMapCheckOut.controls.mapName.value)
  this.formErrors = ""
  var findDuplicateFolder = false
  // look for duplicate name
  this.selectedNode.items.forEach(element => {
    if (self.addMapCheckOut.controls.mapName.value == element.text){
      findDuplicateFolder = true
    } 
  });
  
  if(findDuplicateFolder == false){
    // map creation
    this.mapHandler.createMap(this.addMapCheckOut.controls.mapName.value,this.addMapCheckOut.controls.description.value,this.selectedNode.folderID).then(res => {
      console.log('======create new map request OK=====');
      var jsonRes = JSON.parse(res)

      // add to parent folder
      // this.folderHandler.addMapToFolder(this.selectedFolder.folderID,jsonRes._id,jsonRes.MapName).then(res => {
        console.log('======add map to parent folder request OK=====');
        // add to tree-view
        self.selectedNode.items.unshift({text: jsonRes.MapName, mapID: jsonRes._id, Description: jsonRes.Description, parentNode:this.selectedNode, isFolder: false})
        this.actionInModalIsSuccecs = true
        setTimeout (() => {this.closeModal("addMapModal")}, 1000);

      // }).catch
      //   (err=> {
      //     console.log("error with addto parent folder - promise return");
      //     console.log(err)
      //   });
    }).catch
      (err=> {
        console.log("error with map creation - promise return");
        console.log(err)
      });

    this.addMapCheckOut.reset();
  }
  else{
    this.formErrors = "A folder with that name already exists in this folder. <br>Give another name please"
  }
}

preOpen_editPropertiesModal(dataItem){
  if(dataItem.Description == ""){
    if(dataItem.isFolder){
      this.folderHandler.getFolderDescription(dataItem.folderID).then(res => {
        console.log('======get description folder request OK=====');
        var jsonRes = JSON.parse(res)
        console.log(res)
        console.log(jsonRes.Description)
        dataItem.Description = jsonRes.Description
      }).catch
        (err=> {
          console.log("error with get description folder - promise return");
          console.log(err)
        });
    }
    else{
      this.mapHandler.getMapDescription(dataItem.mapID).then(res => {
        console.log('======get description map request OK=====');
        var jsonRes = JSON.parse(res)
        dataItem.Description = jsonRes.Description
      }).catch
        (err=> {
          console.log("error with get description map - promise return");
          console.log(err)
        });
    }
  }

}
onSubmit_editProperties(){
  var newName, Description
  if(this.changeFileName){
    newName = this.editPropertiesCheckOut.controls.fileName.value
  }
  else{
    newName = this.selectedNode.text
  }
  if(this.changeDescription){
    Description = this.editPropertiesCheckOut.controls.description.value
  }
  else{
    this.selectedNode.Description
  }

  if(this.selectedNode.isFolder){
    console.log(this.selectedNode.folderID,newName,Description);
    
    this.folderHandler.updateFolderProperties(this.selectedNode.folderID,newName,Description,this.selectedNode.parentNode.folderID).then(res => {
      // console.log('======update properties folder request OK=====');
      this.selectedNode.Description = Description
      this.selectedNode.text = newName
      this.actionInModalIsSuccecs = true
      this.changeDescription = false;
      this.changeFileName = false;
      this.editPropertiesCheckOut.reset();
      setTimeout (() => {this.closeModal("editPropertiesModal")}, 1000);
      
    }).catch
      (err=> {
        console.log("error with update properties folder - promise return");
        console.log(err)
      });
  }
  else{
    console.log(this.selectedNode.mapID,newName,Description);
    this.mapHandler.updateMapDecription(this.selectedNode.mapID,newName,Description,this.selectedNode.parentNode.folderID).then(res => {
      // console.log('======update properties map request OK=====');
      this.selectedNode.Description = Description
      this.selectedNode.text = newName
      this.actionInModalIsSuccecs = true
      this.changeDescription = false;
      this.changeFileName = false;
      this.editPropertiesCheckOut.reset();
      setTimeout (() => {this.closeModal("editPropertiesModal")}, 1000);
    }).catch
      (err=> {
        console.log("error with update properties map- promise return");
        console.log(err)
      });
  }

}

// listeners
mouseOverNodeChanger(dataItem){
  this.mouseOverNode = dataItem
}


public clickUpdateDataItem(dataItem) {
  this.selectedNode = dataItem
  console.log(this.selectedNode);
  
}

loadSelectedMap_toMapViewer(dataItem){
  if(!dataItem.isFolder){
    this.mapHandler.getMap(dataItem.mapID).then(res => {
      console.log(res);
      this.mapHandler.currMap_mapViewer = res
      this.router.navigate(['/mapViewer']);
    }).catch
      (err=> {
        console.log("error with getMap - promise return");
        console.log(err)
      })
      
  }
}


// ############### modal functionallity ########################

closeModal(modalId){
  this.modalService.close(modalId);
  this.actionInModalIsSuccecs = false
  this.formErrors=''
  this.addFolderCheckOut.reset();
  this.addMapCheckOut.reset();
  this.editPropertiesCheckOut.reset();
  

}


// ############### dialog functionallity (delete files from tree) ########################
public deleteDialogOpened = false;

public closeDialog(status, fileToDelete) {
  this.deleteDialogOpened = false;
  if(status == "yes"){  // the user choose to delete the file
    this.recursiveDelete(fileToDelete)
  }
}

public openDialog(dataItem) {
  this.fileToDelete = dataItem
  this.deleteDialogOpened = true;
}

public recursiveDelete(fileToDelete){
  if(!fileToDelete.isFolder){
    return this.deleteSignleMap(fileToDelete)
  }
  if(fileToDelete.isFolder && fileToDelete.items.length == 0){
    return this.deleteSingleFolder(fileToDelete)
  }
  for (let item of fileToDelete.items){
    this.recursiveDelete(item)
  }
  return this.deleteSingleFolder(fileToDelete)
  
}
  private deleteSignleMap(fileToDelete: any) {
      this.mapHandler.deleteMap(fileToDelete).then(res => {
        fileToDelete.parentNode.items = fileToDelete.parentNode.items.filter(item => item !== fileToDelete);
        this.data = this.data.slice();
        this.parsedData = this.parsedData.slice();
      }).catch(err => {
        console.log(err);
      });
  }

  private deleteSingleFolder(fileToDelete: any) {
    if(fileToDelete.parentNode != ""){ // make sure not to delete root folder
      this.folderHandler.removeFolderFromFolder(fileToDelete.parentNode.folderID, fileToDelete.folderID).then(res => {
        fileToDelete.parentNode.items = fileToDelete.parentNode.items.filter(item => item !== fileToDelete);
        this.data = this.data.slice();
        this.parsedData = this.parsedData.slice();
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

tableChange: boolean = false;
deleteIdsList = []
userDeleteDialogOpened = false;
userToDelete : any;


public closeUserPerimssionDialog(status) {
  this.userDeleteDialogOpened = false;
  if(status == "yes"){  // the user choose to delete the file
    this.removeUserHandler(this.userToDelete)
  }
}

public openUserPerimssionDialog({dataItem}) {
  this.userDeleteDialogOpened = true;
  this.userToDelete = dataItem
}

  loadPermissionTable(){
    this.currPermissionMapDATA = []
    if(this.selectedNode.mapPermission == ""){
      var mapPermission = new Map();
      this.mapHandler.getMapPermission(this.selectedNode.mapID).then(res => {
        var permissionsList = JSON.parse(res)
        console.log(permissionsList)
        //add read-permission users
        permissionsList.read.forEach(readPermission_user => {
          mapPermission.set(readPermission_user._id,{username: readPermission_user.Username ,name: readPermission_user.FirstName+" "+readPermission_user.LastName,permission: "read"})
        });

        //add write-permission users
        permissionsList.write.forEach(writePermission_user => {
          if(mapPermission.has(writePermission_user._id)){
            mapPermission.get(writePermission_user._id).permission = "write"
          }
          else{
            mapPermission.set(writePermission_user._id,{username: writePermission_user.Username ,name: writePermission_user.FirstName+" "+writePermission_user.LastName,permission: "write"})
          }
        });

        //add owner-permission users
        // permissionsList.Owner.forEach(ownerPermission_user => {
        //   if(mapPermission.has(ownerPermission_user._id)){
        //     mapPermission.get(ownerPermission_user._id).permission = "owner"
        //   }
        //   else{
        //     mapPermission.set(ownerPermission_user._id,{username: ownerPermission_user.Username ,name: ownerPermission_user.FirstName+" "+ownerPermission_user.LastName, permission: "owner"})
        //   }
        // });
      this.selectedNode.mapPermission = mapPermission
      console.log(this.selectedNode.mapPermission)
      for (const [key,value] of this.selectedNode.mapPermission.entries()) { 
        this.currPermissionMapDATA.push(value);
      }
      
      }).catch(err => {
        console.log(err);
      });
      console.log(this.currPermissionMapDATA);
    }
    else{
      console.log("using with the exist!")
      for (const [key,value] of this.selectedNode.mapPermission.entries()) { 
        this.currPermissionMapDATA.push(value);
      }
      console.log(this.currPermissionMapDATA);
      
    }
  }
  
  public cancelHandler({ sender, rowIndex }) {
    sender.closeRow(rowIndex);
}

protected addHandler({sender}) {
  // define all editable fields validators and default values
  const group = new FormGroup({
      'username': new FormControl(""),
      'read': new FormControl(),
      'write': new FormControl(),
      'owner': new FormControl()
  });
  // show the new row editor, with the `FormGroup` build above
  sender.addRow(group);
}

protected pageChange({ skip, take }: PageChangeEvent): void {
  this.gridState.skip = skip;
  this.pageSize = take;
  this.loadDataPermssions();
}

private loadDataPermssions(): void {
  this.parsedDataPermissions = {
      data: this.currPermissionMapDATA.slice(this.gridState.skip, this.gridState.skip + this.pageSize),
      total: this.currPermissionMapDATA.length
  };
}


public onStateChange(state: State) {
  this.gridState = state;
  console.log(this.gridState)
}

public removeUserHandler(dataItem) {
  this.deleteIdsList.push(this.getKeyFromValue({dataItem}))
  this.currPermissionMapDATA = this.currPermissionMapDATA.filter(item => item !== dataItem);
  this.tableChange = true
}

protected closePermissionModal(modalId){
  
    this.modalService.close(modalId);
    this.currPermissionMapDATA =[]
}
// public cellClickHandler({ sender, rowIndex, columnIndex, dataItem, isEdited }) {
//   console.log("click on:"+ dataItem)
// }

private getKeyFromValue(dataItem){
  for (const [key,value] of this.selectedNode.mapPermission.entries()) { 
    if (value == dataItem){ 
      return key
    }
  }
}

}

