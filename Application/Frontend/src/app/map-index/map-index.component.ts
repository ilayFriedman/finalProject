import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHandler, HttpHeaders} from "@angular/common/http";
import {MapsHandlerService} from "../services/maps-handler.service";

@Component({
  selector: 'app-map-index',
  templateUrl: './map-index.component.html',
  styleUrls: ['./map-index.component.css']
})
export class MapIndexComponent implements OnInit {
  fullName = ""
  localUrl = 'http://localhost:3000';
  myMaps: any;


  constructor(private mapHandler: MapsHandlerService, private http: HttpClient) {
    this.fullName = sessionStorage.userFullName;
  }

  ngOnInit() {
    this.myMaps = this.http.get(this.localUrl + '/private/getAllUserMaps', {
      headers: {'token': sessionStorage.token}
    }).subscribe(response => {
        this.myMaps = response
        // this.mapHandler.myMaps = response
        // console.log(response)
      }, error => {
        console.log(error.error)
        alert(error.error)
      }
    );
    let shit = JSON.parse(this.myMaps[0].Model);
    console.log("oren" + this.myMaps[0])
    // this.myMaps = this.mapHandler.getMaps()
    // console.log(this.myMaps)
    // console.log(this.mapHandler.myMaps)
  }

  getMaps() {

  }


}
