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
    // this.mapHandler.getMaps()
  }

  ngOnInit() {
    console.log("strat index")
    this.mapHandler.myMapsPromise.then(res => {
      this.mapHandler.myMaps = res;
      this.myMaps = res
      console.log('OK');
      console.log("from index: " + this.myMaps);
      
    }).catch
      (err=> {
        console.log("error here");
        console.log(err)
      })
  }

}
