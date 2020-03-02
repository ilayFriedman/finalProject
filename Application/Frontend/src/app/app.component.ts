import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'ME-Mapper';
  userFullName = sessionStorage.userFullName
  constructor(private router: Router){}
  
  ngOnInit() {
    this.router.navigate([''])
  }

  isLoggedIn(){
    return sessionStorage.userFullName != null;
  }
}


