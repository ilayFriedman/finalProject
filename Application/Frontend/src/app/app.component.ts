import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fade', [ 
      transition('void => *', [
        style({ opacity: 0 }), 
        animate(500, style({opacity: 1}))
      ]) 
    ])
  ]
})
export class AppComponent {
  title = 'ME-Mapper';
  userFullName = sessionStorage.userFullName

  localUrl = 'http://localhost:3000';
  submitted = false
  loginForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),

  });


  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    // this.logOut()
    // this.router.navigate(['/login'])

    this.router.navigate(['/logedHome']) //remove at the end of debug

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  isLoggedIn() {
    return sessionStorage.userFullName != null;
  }

  logOut() {
    sessionStorage.clear()
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

  // @HostListener('window:beforeunload', ['$event'])
  // public beforeunloadHandler($event) {
  //   sessionStorage.token = "";
  //   alert("close?")
  //   $event.returnValue = "Are you sure?";
  // }
}


