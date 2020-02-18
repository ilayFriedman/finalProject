import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from "@angular/common/http";
import {Router} from '@angular/router';
import { MapsHandlerService } from '../services/maps-handler.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  localUrl = 'http://localhost:3000';
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
      // console.log(response.token)
      // @ts-ignore
        sessionStorage.setItem('token', response.token);
      // @ts-ignore
      sessionStorage.setItem('userFullName', response.fullName);
        this.router.navigate(['/logedHome']);
      }, error => {
        this.submitted = false;
        console.log(error.error)
        alert(error.error)
      }
    );
  }

}
