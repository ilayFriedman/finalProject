import { Component, OnInit } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { of, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button'

const is = (fileName: string, ext: string) => new RegExp(`.${ext}\$`).test(fileName);
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
  public data: any[] = [{
    text: "./",
    items: [
      { text: "parent", items: [{ text: "child1", isFolder: false }], isFolder: true }

    ],
    isFolder: true
  }];

  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private http: HttpClient) {
  }

  ngOnInit() {
    //maps init
    console.log("strat index")
    this.mapHandler.myMapsPromise.then(res => {
      console.log(res)
      this.mapHandler.myMaps = res;
      this.myMaps = res
      console.log('OK');
      // console.log("from index: " + this.myMaps);

    }).catch
      (err => {
        console.log("error here");
        console.log(err)
      })



    // folders init : find the rootFolder


    this.folderHandler.getRootUserFolder().then(res => {

      console.log('======folder request=====');
      console.log(res)
      console.log('=================')

      this.inserMapsToMapTreeViewer(Object(res), null)


    }).catch
      (err => {
        console.log("error here");
        console.log(err)
      })


  }

  public iconClass({ text, items }: any): any {
    return {
      'k-i-file-pdf': is(text, 'pdf'),
      'k-i-folder': items !== undefined,
      'k-i-html': is(text, 'html'),
      'k-i-image': is(text, 'jpg|png'),
      'k-icon': true
    };
  }

  inserMapsToMapTreeViewer(mapsIdsList, destinationFolder) {
    console.log(mapsIdsList.MapsInFolder)
    mapsIdsList.MapsInFolder.forEach(map => {
      console.log(map);

      this.data[0].items.push({ text: map.mapName, mapID: map.mapID, isFolder: false })
    });

    console.log(this.data)
  }

  folderModal() {
    // this.mapHandler.createMap("newMap","NEW dESC",{}).then(res => {
    //   console.log('======CREATE MAP request=====');
    //   console.log(res)

    // }).catch
    //   (err=> {
    //     console.log("error here");
    //     console.log(err)
    //   })

  }

  addNewFolder(folderName, desc) {

  }


}