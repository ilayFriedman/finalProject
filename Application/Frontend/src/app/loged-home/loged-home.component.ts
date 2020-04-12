import { Component, OnInit } from '@angular/core';
import {trigger, style, animate, transition} from '@angular/animations';
import { Observable } from 'rxjs';


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

  constructor() {
    this.fullName = sessionStorage.userFullName;
    // this.mapHandler.getMaps()
  }

  ngOnInit() {
  }

}
