import { Component, OnInit } from '@angular/core';
import {trigger, style, animate, transition} from '@angular/animations';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';


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
  localUrl = 'http://localhost:3000';
  myMaps: any;
  name: any;

  constructor(private router: Router,private formBuilder: FormBuilder) {
    
    this.fullName = sessionStorage.userFullName;
    // this.mapHandler.getMaps()
  }

  ngOnInit() {
        this.ensureUserIsLoggedIn();
  }

  private ensureUserIsLoggedIn() {
    let isLoggedIn = sessionStorage.token != null;
    if (!isLoggedIn) {
      this.router.navigate(['/openPage']);
      // alert("Please log in to view this page.");
    }
  }

}
