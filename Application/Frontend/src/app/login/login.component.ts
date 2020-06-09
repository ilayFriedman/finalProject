import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { MapsHandlerService } from '../services/maps-handler.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {environment} from '../../environments/environment';
import { ModalService } from '../services/modal.service';
import { UsersService } from '../services/users/users.service';


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
  fullName = "sessionStorage.userFullName";
  emailInput = ""
  pwdSent = false;
  errMessage = "";
  dbAction = false;

  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient,public modalService: ModalService,  private usersService: UsersService) {
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
    console.log("IM LOCAL!")
    console.log(this.localUrl)
    let result = this.http.post(this.localUrl + '/login', data);
    result.subscribe(response => {
      this.submitted = false;
      // @ts-ignore
      sessionStorage.setItem('token', response.token);
      // @ts-ignore
      sessionStorage.setItem('userFullName', response.fullName);
      // @ts-ignore
      sessionStorage.setItem('userId', response._id);
      this.loginForm.reset();
      this.fullName = sessionStorage.userFullName
      this.router.navigate(['/logedHome']);
    }, error => {
      this.submitted = false;
      console.log(error.error)
      alert(error.error)
      this.loginForm.reset();
    }
    );
  }

  restorePassword(){
    this.dbAction = true;
    this.usersService.restorePassword(this.emailInput).then(results => {
      this.pwdSent = true;
      this.dbAction = false;

    })
    .catch(e=>{
      this.dbAction = false;
      if(e.status == 404){
        this.errMessage = "Can't find user with this e-mail."
      }
      else{
        this.errMessage = "Something worng with your request: " + e.status + " problem"
      }
    });

  }


}
