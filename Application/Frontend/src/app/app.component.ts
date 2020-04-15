import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
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
  constructor(private router: Router) { }

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

  // @HostListener('window:beforeunload', ['$event'])
  // public beforeunloadHandler($event) {
  //   sessionStorage.token = "";
  //   alert("close?")
  //   $event.returnValue = "Are you sure?";
  // }
}


