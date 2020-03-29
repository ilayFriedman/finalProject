import { Component, OnInit } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';

@Component({
  selector: 'app-mapsfolders-viewer',
  templateUrl: './mapsfolders-viewer.component.html',
  styleUrls: ['./mapsfolders-viewer.component.css']
})
export class MapsfoldersViewerComponent implements OnInit {
  
  localUrl = 'http://localhost:3000';
  // maps variables
  myMaps: any;

  //folders variables
  currentLocation : String = "/";
  currntFolderID : any = null;


  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private http: HttpClient) {
  } 

  ngOnInit(){
    //maps init
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

      
  // folders init
    this.folderHandler.getRootUserFolder().then(res => {
      console.log('======folder request=====');
      console.log(res);
      
    }).catch
      (err=> {
        console.log("error here");
        console.log(err)
      })
  }


}

