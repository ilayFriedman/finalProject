import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent {
  title = 'ME-Mapper';
  userFullName = sessionStorage.userFullName

  localUrl = environment.backendUrl;
  submitted = false
  loginForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),

  });
  fullName = sessionStorage.userFullName;


  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    // this.logOut()
    // this.router.navigate(['/login'])

    this.router.navigate(['/logedHome']) //remove at the end of debug
  }

  isLoggedIn() {
    return sessionStorage.userFullName != null;
  }

  logOut() {
    sessionStorage.clear()
  }

  
}


