import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  localUrl = 'http://localhost:3000';
  error: string;
  groupsUserOwns;
  groupsUserMember;
  public data: any[] = [];

  constructor(private router: Router, private http: HttpClient, private groupService: GroupsService) { }

  ngOnInit() {
    this.ensureUserIsLoggedIn();
    this.getGroupsUserOwns();
    this.getGroupsUserMember();
  }

  private ensureUserIsLoggedIn() {
    let isLoggedIn = sessionStorage.token != null;
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      alert("Please log in to view this page.");
    }
  }

  private getGroupsUserOwns() {
    this.groupService.getGroupsUserOwns()
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
      }
      console.log(this.data);
    }, error => {
      console.log(error.error);
      alert(error.error);
    });
  }

  private getGroupsUserMember() {
    this.groupService.getGroupsUserBlongsTo()
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
      this.groupService.deleteGroup(dataItem.GroupId);

      // Delete group from array
      const index = this.data.indexOf(dataItem);
      if (index > -1) {
        this.data.splice(index, 1);
      }
    }
  }
  
  private iconClass({ text, items }: any): any {
    return {
      'k-i-folder': items !== undefined,
      'k-icon': true
    };
  }
}
