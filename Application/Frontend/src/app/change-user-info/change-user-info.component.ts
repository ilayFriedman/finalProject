import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';


@Component({ 
    selector: 'app-change-user-info',
    templateUrl: './change-user-info.component.html',
    styleUrls: ['./change-user-info.component.css'] 
})
export class ChangeUserInfoComponent implements OnInit {
    changeUserInfoForm: FormGroup;
    loading = false;
    submitted = false;
    localUrl = environment.backendUrl;
    error: string;
    headers = new HttpHeaders().set('Authorization', 'Bearer ' + sessionStorage.token);
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient,
    ){}

    ngOnInit() {
        this.changeUserInfoForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });

        console.log(sessionStorage.token);

    }

    // convenience getter for easy access to form fields
    get f() { return this.changeUserInfoForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.changeUserInfoForm.invalid) {
            return;
        }
        var data = {
          'pwd': this.changeUserInfoForm.controls.password.value,
          'FirstName': this.changeUserInfoForm.controls.firstName.value,
          'LastName': this.changeUserInfoForm.controls.lastName.value
        }

        let result = this.http.post(this.localUrl + '/private/changeInfo', data, { headers: {'token': sessionStorage.token},  responseType: 'text' });
    
        result.subscribe(response => {
            this.submitted = false;
            sessionStorage.setItem('userFullName', this.changeUserInfoForm.controls.firstName.value + " " + this.changeUserInfoForm.controls.lastName.value);
            this.router.navigate(['/logedHome']);
            alert("User information successfully updated");
          }, error => {
            this.submitted = false;
            console.log(error.error);
            alert(error.error);
          }
        );
    }
}