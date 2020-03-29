import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loged-home',
  templateUrl: './loged-home.component.html',
  styleUrls: ['./loged-home.component.css']
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
