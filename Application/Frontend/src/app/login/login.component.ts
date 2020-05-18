import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { MapsHandlerService } from '../services/maps-handler.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {environment} from '../../environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fade', [ 
      transition('void => *', [
        style({ opacity: 0 }), 
        animate(500, style({opacity: 1}))
      ]) 
    ])
  ]
})
export class LoginComponent implements OnInit {
  localUrl = environment.backendUrl;
  submitted = false
  loginForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),

  });


  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient) {
  }


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    var data = {
      'Username': this.loginForm.controls.username.value,
      'Password': this.loginForm.controls.password.value
    }
    let result = this.http.post(this.localUrl + '/login', data);
    result.subscribe(response => {
      this.submitted = false;
      // @ts-ignore
      sessionStorage.setItem('token', response.token);
      // @ts-ignore
      sessionStorage.setItem('userFullName', response.fullName);
      // @ts-ignore
      sessionStorage.setItem('userId', response._id);
      this.router.navigate(['/logedHome']);
    }, error => {
      this.submitted = false;
      console.log(error.error)
      alert(error.error)
    }
    );
  }

}
