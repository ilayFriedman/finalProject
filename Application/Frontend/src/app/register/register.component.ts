import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {HttpClient} from "@angular/common/http";
import { trigger, transition, animate, style } from '@angular/animations';
import { UsersService } from '../services/users/users.service';
import {environment} from '../../environments/environment';


@Component({ 
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    animations: [
        trigger('fade', [ 
          transition('void => *', [
            style({ opacity: 0 }), 
            animate(500, style({opacity: 1}))
          ]) 
        ])
      ]
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    localUrl = environment.backendUrl;
    error: string;
  done = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient,
        public usersService: UsersService
    ){}

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            getPermissionUpdate: new FormControl(true, Validators.required)
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        var data = this.getFormData()

        let result = this.usersService.registerUser(data.email, data.pwd, data.FirstName, data.LastName, data.getPermissionUpdate);
    
        result.subscribe(response => {
            this.submitted = false;
            // this.router.navigate(['/login']);
            this.done = true;
            setTimeout(() => { this.done=false }, 2000);
            
            // alert("New user successfully registered.");
          }, error => {
            this.submitted = false;
            console.log(error.error);
            alert(error.error);
          }
        );
    }

  private getFormData() {
    return {
      'email': this.registerForm.controls.email.value,
      'pwd': this.registerForm.controls.password.value,
      'FirstName': this.registerForm.controls.firstName.value,
      'LastName': this.registerForm.controls.lastName.value,
      'getPermissionUpdate': this.registerForm.controls.getPermissionUpdate.value
    };
  }
}