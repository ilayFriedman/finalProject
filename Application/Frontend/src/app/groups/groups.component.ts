import { Component, OnInit, ViewChild } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';
import { UsersService } from '../services/users/users.service';
import { ModalService } from '../services/modal.service';
import { FormBuilder, Validators } from '@angular/forms';
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
  localUrl = 'http://localhost:3000';
  isPermissionChanged: boolean = false;
  selectedPermission = 'Member';
  currentlyEditedGroupId: string;
  error: string;
  groupsUserOwns;
  groupsUserMember;

  allUsersList: any;
  groupsPermissionList;
  groupsNoPermissionList;

  public data: any[] = [];
  addGroupCheckOut;
  
  allUsersTableSelection = new SelectionModel<Iuser>(true, []);
  groupsUserPermissionTableSelection = new SelectionModel<Iuser>(true, []);


  allUsersColumns = ['username', 'firstname', 'lastname'];
  groupsUsersColumns = ['username', 'firstname', 'lastname', 'permission'];


  @ViewChild(MatTable,  {static: true}) 
  permissionTable: MatTable<any>;
  
  @ViewChild(MatTable,  {static: true}) 
  noPermissionTable: MatTable<any>;
  totalGroupsNumber =  0;

  constructor(private router: Router, private http: HttpClient, private groupsService: GroupsService,
              private usersService: UsersService, private modalService: ModalService, 
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
    }
  }

  private getUsers() {

    this.usersService.getUsers()
    .then(response =>{
      console.log(response)
      this.allUsersList = JSON.parse(response);
      
      // Remove the user currently logged in from the list
      this.allUsersList = this.allUsersList.filter(obj => obj._id !== sessionStorage.userId);      
    });
  }

  private getGroupsUserOwns() {
    this.groupsService.getGroupsUserOwns()
     .then(response => {
      this.groupsUserOwns = response;

      for (let index = 0; index < this.groupsUserOwns.length; index++) {
        const element = this.groupsUserOwns[index];
        this.data.push({
          text: element.GroupName,
          GroupId: element.GroupId,
          GroupDescription: element.GroupDescription,
          items: [],
        })
        this.totalGroupsNumber++
      }
    }, error => {
      console.log(error.error);
      alert(error.error);
    });
  }

  private getGroupsUserMember() {
    this.groupsService.getGroupsUserBlongsTo()
     .then(response => {
      this.groupsUserMember = response;
    }, error => {
      console.log(error.error);
      alert(error.error);
    });
  }

  private deleteGroup(dataItem){
    if (confirm('Are you sure you want to permanently delete this group?')) {
      // Delete group from DB
      this.groupsService.deleteGroup(dataItem.GroupId);

      // Delete group from array
      const index = this.data.indexOf(dataItem);
      if (index > -1) {
        this.data.splice(index, 1);
      }
      this.totalGroupsNumber--;
    }
  }

  private addGroupToArray(res, arr){
    arr.push({
        text: res.Name,
        GroupId: res.GroupId,
        GroupDescription: res.Description,
        items: [],

      })
  }

  private createGroup(){
    const newGroupName = this.addGroupCheckOut.controls.groupName.value;
    const newGroupDescription = this.addGroupCheckOut.controls.description.value;    

    this.groupsService.createNewGroup(newGroupName, newGroupDescription)
    .then(res => {

      this.addGroupToArray(res, this.data);
      this.closeModal_addGroup();
      this.totalGroupsNumber++;

    });
  }

  openEditGroupModal(dataItem){
    this.currentlyEditedGroupId = dataItem.GroupId;

    this.modalService.open('editGroupModal');
    this.groupsService.getGroupsMembers(dataItem.GroupId)
    .then(res =>{
      this.populateGroupsPermissionList(res);
      this.populateGroupsNoPermissionList();
    });
  }
  
  private populateGroupsPermissionList(permissions){
    let ans = [];

    permissions.Member.forEach(elem => {
      let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
      if(userDetails){
        userDetails.Permission = 'Member';
        ans.push(userDetails);
      }
    });

    permissions.Manager.forEach(elem => {
      let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
      if(userDetails){
        userDetails.Permission = 'Manager';
        ans.push(userDetails);
      }
      
    });

    permissions.Owner.forEach(elem => {
      let userDetails = this.allUsersList.filter(obj => obj._id === elem.userId)[0];
      if(userDetails){
        userDetails.Permission = 'Owner';
        ans.push(userDetails);
      }
    });

    this.groupsPermissionList = ans;
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
    .then(results => alert(results))
    .catch(e => alert(e));
  }
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.allUsersTableSelection.selected.length;
    const numRows = this.allUsersList.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.allUsersTableSelection.clear() :
        this.allUsersList.data.forEach(row => this.allUsersTableSelection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.allUsersTableSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  changesMadeToPermission(){
      this.isPermissionChanged = true;
  }

  addUsersToGroup(){
    this.allUsersTableSelection.selected.forEach(element => {
        element.Permission = this.selectedPermission;
        this.groupsPermissionList.push(element);

        this.groupsNoPermissionList = this.groupsNoPermissionList.filter(item => item._id !== element._id);
    });

    this.endTablesEdit();
  }

  removeUsersFromGroup(){
    this.groupsUserPermissionTableSelection.selected.forEach(element => {
      element.Permission = undefined;
      this.groupsPermissionList = this.groupsPermissionList.filter(item => item._id !== element._id);

      this.groupsNoPermissionList.push(element);
    });

    this.endTablesEdit();
  }

  private endTablesEdit() {
    this.changesMadeToPermission();
    
    this.groupsUserPermissionTableSelection.clear();
    this.allUsersTableSelection.clear();

    this.permissionTable.renderRows();
    this.noPermissionTable.renderRows();
  }

  // private iconClass({ text, items }: any): any {
  //   return {
  //     'k-i-folder': items !== undefined,
  //     'k-icon': true
  //   };
  // }
}
