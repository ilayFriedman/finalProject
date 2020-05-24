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
    { text: "Manager Groups", isTitle: "true", items: [] },
    { text: "Member Groups", isTitle: "true", items: [] },
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
  public autoCompleteUserNamesFilterd: Array<string>;
  newUserPermission = ""
  userNotFound = false
  watcherPermission = "";

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
    
    // check duplicate name in your tree
      if(this.addGroupCheckOut.controls.groupName.value != null && 
        this.addGroupCheckOut.controls.description.value != null && /\S/.test(this.addGroupCheckOut.controls.groupName.value) && /\S/.test(this.addGroupCheckOut.controls.description.value) ){
        if(this.groupsArray[0].items.find(x => x.text == this.addGroupCheckOut.controls.groupName.value) == null){
        this.groupsService.createNewGroup(this.addGroupCheckOut.controls.groupName.value, this.addGroupCheckOut.controls.description.value)
        .then(res => {
          var jsonRes =  JSON.parse(JSON.stringify(res))
          this.addToTreeView([{ text: jsonRes.Name, GroupId: jsonRes._id, GroupDescription: jsonRes.Description, permission: "Owner" ,usersPermissionsMap: ""}])
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

  // checkPermissionClick(dataItem){
  //   if(dataItem.permission == 'Owner' || dataItem.permission == 'Manager'){
  //     this.openModalWithDataItem(dataItem,'permissionGroupModal');
  //   }
  // }

  //  //USING
  //  private populateGroupsPermissionList(permissions) {
  //   let ans = [];
  //   permissions.Member.forEach(elem => {
  //     let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
  //     if (userDetails) {
  //       userDetails.Permission = 'Member';
  //       userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;
  //       ans.push(userDetails);
  //     }
  //   });

  //   permissions.Manager.forEach(elem => {
  //     let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
  //     if (userDetails) {
  //       userDetails.Permission = 'Manager';
  //       userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;
  //       ans.push(userDetails);
  //     }

  //   });

  //   permissions.Owner.forEach(elem => {
  //     let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
  //     if (userDetails) {
  //       userDetails.Permission = 'Owner';
  //       userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;
  //       ans.push(userDetails);
  //     }
  //   });

  //   this.groupsPermissionList = ans;
  // }

  // //USING
  // AddNewRow(event) {

  //   // define all editable fields validators and default values
  //   const newUser = new FormGroup({
  //     'Username': new FormControl(""),
  //     'Permission': new FormControl({ "": [] })
  //   });
  //   // show the new row editor, with the `FormGroup` build above
  //   event.sender.addRow(newUser);
  // }

  // public addNewUserPermission(event) {
  //   if (this.newUserPermissionChoice != null) {

  //     let userDetails = this.allUsersList.filter(obj => obj.Username === this.newUserPermissionChoice.target.name)[0];

  //     if (userDetails) {
  //       userDetails.Permission = this.newUserPermissionChoice.target.id;
  //       userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;

  //       this.groupsPermissionList = [userDetails].concat(this.groupsPermissionList);
  //       var userInNoPermissionList = this.groupsNoPermissionList.filter(item => item.Username === event.dataItem.Username)
  //       if (userInNoPermissionList.length != 0) {
  //         const index = this.groupsNoPermissionList.indexOf(userInNoPermissionList[0]);
  //         if (index > -1) {
  //           this.groupsNoPermissionList.splice(index, 1);
  //         }
  //       }

  //       this.changesMadeToPermission();
  //     }
  //   }

  //   this.cancelHandler(event)

  //   //TODO handle the case where the user is not found.
  // }

  // public openUserPerimssionDialog(dataItem) {
  //   this.userDeleteDialogOpened = true;
  //   this.userToDelete = dataItem;
  // }

  // public closeUserPerimssionDialog(status) {
  //   this.userDeleteDialogOpened = false;
  //   if (status == "yes") {  // the user choose to delete the file
  //     this.removeUserHandler(this.userToDelete)
  //   }
  // }

  // public removeUserHandler(event) {
  //   this.groupsNoPermissionList.push(event.dataItem);

  //   this.groupsPermissionList = this.groupsPermissionList.filter(item => item !== event.dataItem);

  //   this.changesMadeToPermission();
  // }

  // public cancelHandler({ sender, rowIndex }) {
  //   this.newUserPermissionChoice = null;
  //   sender.closeRow(rowIndex);
  // }

  // populateGroupsNoPermissionList() {
  //   this.groupsNoPermissionList = [];
  //   this.allUsersList.forEach(allUser => {
  //     if (this.groupsPermissionList.filter(obj => obj._id === allUser._id).length == 0) {
  //       this.groupsNoPermissionList.push(allUser);
  //     }
  //   });
  // }


  // closeModal_editGroup() {
  //   if (!this.isPermissionChanged || confirm("Discard permission changes?")) {
  //     this.groupsPermissionList = [];
  //     this.groupsNoPermissionList = [];
  //     this.currentlyEditedGroupId = undefined;
  //     this.isPermissionChanged = false;
  //     this.modalService.close('editGroupModal');
  //   }
  // }

  // savePermissionChanges() {
  //   let promises = [];

  //   if (!this.isPermissionChanged) {
  //     return;
  //   }

  //   this.isPermissionChanged = false;

  //   this.groupsPermissionList.forEach(elem => {
  //     promises.push(this.groupsService.setUserPermissionForGroup(this.currentlyEditedGroupId, [elem._id], [elem.Permission]));
  //   });

  //   this.groupsNoPermissionList.forEach(elem => {
  //     promises.push(this.groupsService.removeUserFromGroup(this.currentlyEditedGroupId, [elem._id]));
  //   });

  //   Promise.all(promises.map(p => p.catch(e => e)))
  //     .then(results => alert("Permission changes were successfully saved."))
  //     .catch(e => alert(e));
  // }

  // changesMadeToPermission() {
  //   this.isPermissionChanged = true;
  // }

  // radioButtonsUpdate(event, rowIndex) {
  //   if (rowIndex != -1) {
  //     this.groupsPermissionList.find(item => item.Username == event.target.name).Permission = event.target.id;
  //     this.changesMadeToPermission();
  //   }
  //   else { //This is a new user
  //     this.newUserPermissionChoice = event;
  //   }
  // }



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
    this.autoCompleteUserNamesFilterd = this.autoCompleteUserNames.filter((s) => s.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    // this.currPermissionMapDATA.forEach(element => {
    //   this.autoCompleteUserNamesFilterd = this.autoCompleteUserNamesFilterd.filter(obj => obj !== element.username);
    // });
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
      // this.removeUserHandler(this.userToDelete)
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
    this.groupsService.getGroupsMembers(this.selectedNode.GroupId).then(res => {
      var permissionsList = JSON.parse(JSON.stringify(res))
      //add Manager-permission users
      permissionsList.Manager.forEach(ManagerUser => {
        usersPermissionsMap.set(ManagerUser._id, { username: ManagerUser.Username, name: ManagerUser.FirstName + " " + ManagerUser.LastName, permission: "Manager" })
      });

      //add Member-permission users
      permissionsList.Member.forEach(MemberUser => {
        if (usersPermissionsMap.has(MemberUser._id)) {
          usersPermissionsMap.get(MemberUser._id).permission = "Member"
        }
        else {
          usersPermissionsMap.set(MemberUser._id, { username: MemberUser.Username, name: MemberUser.FirstName + " " + MemberUser.LastName, permission: "Member" })
        }
      });

      //add owner-permission users
      permissionsList.Owner.forEach(OwnerUser => {
        if(usersPermissionsMap.has(OwnerUser._id)){
          usersPermissionsMap.get(OwnerUser._id).permission = "Owner"
        }
        else{
          usersPermissionsMap.set(OwnerUser._id,{username: OwnerUser.Username ,name: OwnerUser.FirstName+" "+OwnerUser.LastName, permission: "Owner"})
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
    this.currPermissionMapDATA.forEach(val => this.snapshootFirst.push({username: val.username, name: val.name, permission: val.permission}));
    console.log(this.selectedNode.usersPermissionsMap)
    }).catch(err => {
      console.log(err);
    });
  }

  ownerCheck(){
    if(this.selectedNode.hasOwnProperty('usersPermissionsMap')){
      this.watcherPermission = this.selectedNode.usersPermissionsMap.get(sessionStorage.userId).permission
      return this.selectedNode.usersPermissionsMap.get(sessionStorage.userId).permission != 'Owner'
      
      // console.log(this.selectedNode)
    }
    return true
  }

}
