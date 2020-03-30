import { Component, OnInit } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { of } from 'rxjs';

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
  currentLocation : String = "./(Root Folder)";
  currntFolderID : any = null;
  public expandedKeys: any[] = ['0', '1'];
  public hasChildren = (item: any) => item.items && item.items.length > 0;
  public fetchChildren = (item: any) => of(item.items);
  public selectedKeys: any[] = ['0_1'];

  public isItemSelected = (_: any, index: string) => this.selectedKeys.indexOf(index) > -1;

  public handleSelection({ index }: any): void {
    console.log("hi!!")
      this.selectedKeys = [index];
  }


  public data: any[] = [{
    text: this.currentLocation,
    items: [
        // {
        //     text: 'firstFolder',
        //     items: [
        //         { text: 'map1' },
        //         { text: 'map2' },
        //         { text: 'map3' }
        //     ]
        // },
        // { text: 'map5' }
        // {
        //     text: 'New Web Site',
        //     items: [
        //         { text: 'mockup.jpg' },
        //         { text: 'Research.pdf' }
        //     ]
        // },
        // {
        //     text: 'Reports',
        //     items: [
        //         { text: 'February.pdf' },
        //         { text: 'March.pdf' },
        //         { text: 'April.pdf' }
        //     ]
        // }
    ]
}];

  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private http: HttpClient) {
  } 

  ngOnInit(){
    //maps init
    console.log("strat index")
    this.mapHandler.myMapsPromise.then(res => {
      console.log(res)
      this.mapHandler.myMaps = res;
      this.myMaps = res
      console.log('OK');
      // console.log("from index: " + this.myMaps);
      
    }).catch
      (err=> {
        console.log("error here");
        console.log(err)
      })

  

  // folders init : find the rootFolder

  
    this.folderHandler.getRootUserFolder().then(res => {
      
      console.log('======folder request=====');
      console.log(res)
      console.log('=================')
      // this.insertMaps(res[0],null)

      
    }).catch
      (err=> {
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

insertMaps(mapsIdsList,destinationFolder){
  mapsIdsList.forEach(mapId => {
    this.mapHandler.getMap(mapId).then(res => {
     
      
      this.data.push({text: res.MapName})
    }).catch
      (err=> {
        console.log("error with GetMap from insertMaps function");
        console.log(err)
      })
  });
}

play(){
  this.mapHandler.createMap("newMap","NEW dESC",{}).then(res => {
    console.log('======CREATE MAP request=====');
    console.log(res)
    
  }).catch
    (err=> {
      console.log("error here");
      console.log(err)
    })

    
}
}

