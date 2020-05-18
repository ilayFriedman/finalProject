import { Component, OnInit } from '@angular/core';
import {trigger, style, animate, transition} from '@angular/animations';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users/users.service';
import {environment} from '../../environments/environment';


@Component({
  selector: 'app-loged-home',
  templateUrl: './loged-home.component.html',
  styleUrls: ['./loged-home.component.css'],
  animations: [
    trigger('fade', [ 
      transition('void => *', [
        style({ opacity: 0 }), 
        animate(500, style({opacity: 1}))
      ]) 
    ])
  ]
})
export class LogedHomeComponent implements OnInit {

  fullName = ""
  localUrl = environment.backendUrl;
  myMaps: any;
  name: any;
  allUsersList :Array<string> =  [];

  constructor(private router: Router,private formBuilder: FormBuilder,private usersService: UsersService) {
    
    this.fullName = sessionStorage.userFullName;
    // this.mapHandler.getMaps()
  }

  ngOnInit() {
        this.ensureUserIsLoggedIn();
        this.getAllUsers();
  }
  getAllUsers() {
    this.usersService.getUsers().then(response =>{   
      // this.allUsersList = JSON.parse(response);
      JSON.parse(response).forEach(element => {
        this.allUsersList.push(element.Username)
      });
      // console.log( this.allUsersList)
    });
  }

  private ensureUserIsLoggedIn() {
    let isLoggedIn = sessionStorage.token != null;
    if (!isLoggedIn) {
      this.router.navigate(['/openPage']);
      // alert("Please log in to view this page.");
    }
  }

}
