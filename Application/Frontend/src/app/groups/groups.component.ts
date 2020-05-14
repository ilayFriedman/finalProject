import { Component, OnInit, ViewChild } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';
import { UsersService } from '../services/users/users.service';
import { ModalService } from '../services/modal.service';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';
import { MatTable } from '@angular/material';

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
  isPermissionChanged: boolean = false;
  selectedPermission = 'Member';
  currentlyEditedGroupId: string;
  error: string;
  groupsUserOwns;
  groupsUserMember;
  formErrors: string;
  newUserPermissionChoice: any = null;
  userDeleteDialogOpened: boolean = false;
  userToDelete: any;

  allUsersList: any;
  groupsPermissionList: any[] = [];
  groupsNoPermissionList: any[] = [];

  public groupsArray: any[] = [];
  addGroupCheckOut;
  
  // allUsersTableSelection = new SelectionModel<Iuser>(true, []);
  // groupsUserPermissionTableSelection = new SelectionModel<Iuser>(true, []);


  // allUsersColumns = ['username', 'firstname', 'lastname'];
  // groupsUsersColumns = ['username', 'firstname', 'lastname', 'permission'];


  // @ViewChild(MatTable,  {static: true}) 
  // permissionTable: MatTable<any>;
  
  // @ViewChild(MatTable,  {static: true}) 
  // noPermissionTable: MatTable<any>;
  totalGroupsNumber =  0;

  constructor(private router: Router, private http: HttpClient, private groupsService: GroupsService,
              private usersService: UsersService, public modalService: ModalService, 
              private formBuilder: FormBuilder) {

    this.addGroupCheckOut = this.formBuilder.group({groupName: ['', Validators.required],
                                                    description: ['', Validators.required]});

   }

  ngOnInit() {
    // check user connected
    if(sessionStorage.token != null){
      this.getGroupsUserOwns();
      this.getGroupsUserMember();
      this.getUsers();
      console.log(this.groupsArray);
      }
  }

  //USING
  private getUsers() {

    this.usersService.getUsers()
    .then(response =>{
      this.allUsersList = JSON.parse(response);
      
      // Remove the user currently logged in from the list
      this.allUsersList = this.allUsersList.filter(obj => obj._id !== sessionStorage.userId);      
    });
  }

  //USING
  private getGroupsUserOwns() {
    this.groupsService.getGroupsUserOwns()
     .then(response => {
      this.groupsUserOwns = response;

      for (let index = 0; index < this.groupsUserOwns.length; index++) {
        const element = this.groupsUserOwns[index];
        this.groupsArray.push({
          text: element.GroupName,
          GroupId: element.GroupId,
          GroupDescription: element.GroupDescription,
        })
        this.totalGroupsNumber++
      }
    }, error => {
      console.log(error.error);
      alert(error.error);
    });
  }

  //USING
  private getGroupsUserMember() {
    this.groupsService.getGroupsUserBlongsTo()
     .then(response => {
      this.groupsUserMember = response;
    }, error => {
      console.log(error.error);
      alert(error.error);
    });
  }

  public deleteGroup(dataItem){
    if (confirm('Are you sure you want to permanently delete this group?')) {
      // Delete group from DB
      this.groupsService.deleteGroup(dataItem.GroupId);

      // Delete group from array
      const index = this.groupsArray.indexOf(dataItem);
      if (index > -1) {
        this.groupsArray.splice(index, 1);
      }
      this.totalGroupsNumber--;
    }
  }

  //USING
  private addGroupToArray(res, arr){
    arr.push({
        text: res.Name,
        GroupId: res.GroupId,
        GroupDescription: res.Description,
      })
  }

  //USING
  public createGroup(){
    const newGroupName = this.addGroupCheckOut.controls.groupName.value;
    const newGroupDescription = this.addGroupCheckOut.controls.description.value;    

    if(!(newGroupName && newGroupDescription)){
      this.formErrors = "Worng/Missing inputs.<br> Make sure you filled all the requierd fields."
    }

    this.groupsService.createNewGroup(newGroupName, newGroupDescription)
    .then(res => {

      this.addGroupToArray(res, this.groupsArray);
      this.closeModal_addGroup();
      this.totalGroupsNumber++;

    });
  }

  //USING
  openEditGroupModal(dataItem){
    this.currentlyEditedGroupId = dataItem.GroupId;

    this.modalService.open('editGroupModal');
    this.groupsService.getGroupsMembers(dataItem.GroupId)
    .then(res =>{
      this.populateGroupsPermissionList(res);
      this.populateGroupsNoPermissionList();
    });
  }
  
  //USING
  private populateGroupsPermissionList(permissions){
    let ans = [];
    permissions.Member.forEach(elem => {
      let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
      if(userDetails){
        userDetails.Permission = 'Member';
        userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;
        ans.push(userDetails);
      }
    });

    permissions.Manager.forEach(elem => {
      let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
      if(userDetails){
        userDetails.Permission = 'Manager';
        userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;
        ans.push(userDetails);
      }
      
    });

    permissions.Owner.forEach(elem => {
      let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
      if(userDetails){
        userDetails.Permission = 'Owner';
        userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;
        ans.push(userDetails);
      }
    });

    this.groupsPermissionList = ans;
  }

  //USING
  AddNewRow(event) {

    // define all editable fields validators and default values
    const newUser = new FormGroup({
      'Username': new FormControl(""),
      'Permission': new FormControl({"": []})
    });
    // show the new row editor, with the `FormGroup` build above
    event.sender.addRow(newUser);
  }

  public addNewUserPermission(event){
    if(this.newUserPermissionChoice != null){

      let userDetails = this.allUsersList.filter(obj => obj.Username === this.newUserPermissionChoice.target.name)[0];

      if(userDetails){
        userDetails.Permission = this.newUserPermissionChoice.target.id;
        userDetails.FullName = userDetails.FirstName + " " + userDetails.LastName;

        this.groupsPermissionList = [userDetails].concat(this.groupsPermissionList);
        var userInNoPermissionList = this.groupsNoPermissionList.filter(item => item.Username === event.dataItem.Username)
        if(userInNoPermissionList.length != 0){
          const index = this.groupsNoPermissionList.indexOf(userInNoPermissionList[0]);
          if(index > -1){
            this.groupsNoPermissionList.splice(index, 1);
          }
        }

        this.changesMadeToPermission();
      }
    }

    this.cancelHandler(event)

    //TODO handle the case where the user is not found.
  }

  public openUserPerimssionDialog(dataItem) {
    this.userDeleteDialogOpened = true;
    this.userToDelete = dataItem;
  }

  public closeUserPerimssionDialog(status) {
    this.userDeleteDialogOpened = false;
    if (status == "yes") {  // the user choose to delete the file
      this.removeUserHandler(this.userToDelete)
    }
  }

  public removeUserHandler(event) {
    this.groupsNoPermissionList.push(event.dataItem);

    this.groupsPermissionList = this.groupsPermissionList.filter(item => item !== event.dataItem);

    this.changesMadeToPermission();
  }

  public cancelHandler({ sender, rowIndex }) {
    this.newUserPermissionChoice = null;
    sender.closeRow(rowIndex);
  }

  populateGroupsNoPermissionList(){
    this.groupsNoPermissionList = [];
    this.allUsersList.forEach(allUser => {
      if(this.groupsPermissionList.filter(obj => obj._id === allUser._id).length == 0){
        this.groupsNoPermissionList.push(allUser);
      }
    });
  }

  closeModal_addGroup(){
    this.modalService.close('addGroupModal');
  }
  
  closeModal_editGroup(){
    if(!this.isPermissionChanged || confirm("Discard permission changes?")){
        this.groupsPermissionList = [];
        this.groupsNoPermissionList = [];
        this.currentlyEditedGroupId = undefined;
        this.isPermissionChanged = false; 
        this.modalService.close('editGroupModal');
    }
  }

  savePermissionChanges(){
    let promises = [];

    if(!this.isPermissionChanged){
      return;
    }

    this.isPermissionChanged = false;

    this.groupsPermissionList.forEach(elem =>{
      promises.push(this.groupsService.setUserPermissionForGroup(this.currentlyEditedGroupId, [elem._id], [elem.Permission]));
    });

    this.groupsNoPermissionList.forEach(elem =>{
      promises.push(this.groupsService.removeUserFromGroup(this.currentlyEditedGroupId, [elem._id]));
    });

    Promise.all(promises.map(p => p.catch(e => e)))
    .then(results => alert("Permission changes were successfully saved."))
    .catch(e => alert(e));
  }

  changesMadeToPermission(){
      this.isPermissionChanged = true;
  }

  radioButtonsUpdate(event, rowIndex) {
    if (rowIndex !=-1){
      this.groupsPermissionList.find(item => item.Username == event.target.name).Permission = event.target.id;
      this.changesMadeToPermission();
    }
    else{ //This is a new user
      this.newUserPermissionChoice = event;
    }
  }
}
