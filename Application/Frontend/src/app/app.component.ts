import {Component, ViewEncapsulation,} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'ME-Mapper';
  userFullName = sessionStorage.userFullName

  isLoggedIn(){
    return sessionStorage.userFullName != null;
  }
}


