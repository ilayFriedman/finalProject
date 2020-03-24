import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpClient} from "@angular/common/http";
import { first } from 'rxjs/operators';


@Component({ 
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'] 
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    localUrl = 'http://localhost:3000';
    error: string;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient
    ){}

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
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

        var data = {
          'email': this.registerForm.controls.email.value,
          'pwd': this.registerForm.controls.password.value,
          'FirstName': this.registerForm.controls.firstName.value,
          'LastName': this.registerForm.controls.lastName.value
        }
        let result = this.http.post(this.localUrl + '/register', data, { responseType: 'text' });
    
        result.subscribe(response => {
            this.submitted = false;
            this.router.navigate(['/login']);
            alert("New user successfully registered.");
          }, error => {
            this.submitted = false;
            console.log(error.error);
            alert(error.error);
          }
        );
    }
}