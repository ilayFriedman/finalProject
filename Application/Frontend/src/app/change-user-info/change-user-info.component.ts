import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { UsersService } from '../services/users/users.service';
import { trigger, transition, animate, style } from '@angular/animations';
import { ModalService } from '../services/modal.service';
import { GroupsService } from '../services/groups/groups.service';


@Component({ 
    selector: 'app-change-user-info',
    templateUrl: './change-user-info.component.html',
    styleUrls: ['./change-user-info.component.css'],
    animations: [
        trigger('fade', [ 
          transition('void => *', [
            style({ opacity: 0 }), 
            animate(500, style({opacity: 1}))
          ]) 
        ])
      ]
})
export class ChangeUserInfoComponent implements OnInit {
    changeUserInfoForm: FormGroup;
    loading = false;
    submitted = false;
    localUrl = environment.backendUrl;
    error: string;
    headers = new HttpHeaders().set('Authorization', 'Bearer ' + sessionStorage.token);
    existUser = null;
    done = false;
    badForm = false;
    userNameInput = ""
    dbAction = false


    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient,
        private usersService: UsersService,
        private modalService: ModalService,
        private groupsService: GroupsService
    ){}

    userNameCheck(){
      return this.userNameInput == this.existUser.Username
    }
    ngOnInit() {
        this.changeUserInfoForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            password: ['', [Validators.required]],
            getPermissionUpdate: new FormControl(null, Validators.required)
        });
        this.usersService.getUserDetails().then(response => {
          this.existUser = response
          console.log( this.existUser)

          this.changeUserInfoForm = this.formBuilder.group({
            firstName: [this.existUser.FirstName, Validators.required],
            lastName: [this.existUser.LastName, Validators.required],
            password: ['', [Validators.required]],
            getPermissionUpdate: new FormControl(this.existUser.getPermissionUpdate, Validators.required)
        });

        }, error => {
          console.log(error.error);
          alert(error.error);
        });
        // console.log(sessionStorage.token);

    }

    // convenience getter for easy access to form fields
    get f() { return this.changeUserInfoForm.controls; }

    onSubmit() {
        // stop here if form is invalid
        if (this.changeUserInfoForm.invalid) {
            this.badForm = true
            return;
        }
        this.badForm = false;
        var data = {
          'pwd': this.changeUserInfoForm.controls.password.value,
          'FirstName': this.changeUserInfoForm.controls.firstName.value,
          'LastName': this.changeUserInfoForm.controls.lastName.value,
          'getPermissionUpdate': this.changeUserInfoForm.controls.getPermissionUpdate.value
        }
        console.log(data)


        this.usersService.changeInfo(data).then(response => {
            sessionStorage.setItem('userFullName', this.changeUserInfoForm.controls.firstName.value + " " + this.changeUserInfoForm.controls.lastName.value);
            this.done = true;
            setTimeout(() => {  this.router.navigate(['/logedHome']); }, 2000);
            // alert("User information successfully updated");
          }, error => {
            console.log(error.error);
            alert(error.error);
          }
        );
    }

    deleteAccount(){
      this.groupsService.getSingleOwnerPermission().then(response => {
        var promises = []
        var singleGroupList = response
        console.log(singleGroupList)
        // this.groupsService.deleteGroup()
        this.dbAction=true
        console.log(this.groupsService.allMyGroups)

        this.done = true;
        setTimeout(() => {  this.router.navigate(['/logedHome']); }, 2000);
        // alert("User information successfully updated");
      }, error => {
        console.log(error.error);
        alert(error.error);
      }
    );

    }
}