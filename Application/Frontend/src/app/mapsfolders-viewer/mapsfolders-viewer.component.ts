import { Component, OnInit } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { of, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button'
import { ModalService } from '../services/modal.service';

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
    text: "/",
    folderID: "5e80d535132e0540b827c4cd",
    items: [],
    isFolder : true
  }];
  selectedFolder: any;
  public searchTerm = '';
  public mouseInside : boolean = false;
  public parsedData: any[] = this.data;
  public expandedKeys: any[] = ['/'];



  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private http: HttpClient, private modalHandler: ModalService) {
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

      console.log('======getRootUserFolder request OK=====');
      // console.log(res)
      // console.log('=================')
      this.insertFoldersToMapTreeViewer(res,null)
      this.inserMapsToMapTreeViewer(Object(res),null)
      

    }).catch
      (err => {
        console.log("error here");
        console.log(err)
      })

      this.parsedData = this.data;

  }

  public iconClass({ text, items }: any): any {
    return {
      'k-i-file-pdf': is(text, 'pdf'),
      'k-i-folder': items !== undefined,
      'k-i-table-align-middle-center': items == undefined,
      'k-i-image': is(text, 'jpg|png'),
      'k-icon': true
  };
}

inserMapsToMapTreeViewer(mapsIdsList,destinationFolder){
  console.log(mapsIdsList.MapsInFolder)
  mapsIdsList.MapsInFolder.forEach(map => {
    console.log(map);
    
    this.data[0].items.push({text: map.mapName,mapID: map.mapID, isFolder: false})
  });

  console.log(this.data)
}

insertFoldersToMapTreeViewer(folderIdsList, destinationFolder){
  folderIdsList.SubFolders.forEach(folder=>{
    this.data[0].items.push({text: folder.folderName,folderID: folder.folderID,items: [], isFolder: true})
  })
}
folderModal(){
  // this.mapHandler.createMap("newMap","NEW dESC",{}).then(res => {
  //   console.log('======CREATE MAP request=====');
  //   console.log(res)
    
  // }).catch
  //   (err=> {
  //     console.log("error here");
  //     console.log(err)
  //   })
  
}

submitModal(folderName,desc,parent){
  var self = this
  this.folderHandler.createFolder(folderName,desc,parent).then(res => {
      
    console.log('======create new folder request OK=====');
    self.selectedFolder.items.push({text: res})
    // console.log('=================') 
    
  }).catch
    (err=> {
      console.log("error with creation - promise return");
      console.log(err)
    })

}


addNewFolder(){
// open modal
}

ngIfManageButtons(dataItem, mouseInside){
  console.log("inside!");
  console.log(mouseInside);
  return dataItem.isFolder && mouseInside
}
// Tree-view functionallity

// public handleSelection({ dataItem }: any): void {
//   console.log(this.data)
//   console.log(dataItem)
//   this.selectedFolder = dataItem
//   dataItem.items.push("blabla")
//   console.log(this.data)
// }
public handleSelectionButton(dataItem): void {
  console.log(this.data)
  console.log(dataItem)
  this.selectedFolder = dataItem
   this.selectedFolder.items.push("blabla")
  console.log(this.data)
}

public children = (dataitem: any): Observable<any[]> => of(dataitem.items);

public hasChildren = (dataitem: any): boolean => !!dataitem.items;

public onkeyup(value: string): void {
  this.parsedData = this.search(this.data, value);
  console.log(this.parsedData)
}

public search(items: any[], term: string): any[] {
  return items.reduce((acc, item) => {
        if (this.contains(item.text, term)) {
          acc.push(item);
        } else if (item.items && item.items.length > 0) {
          const newItems = this.search(item.items, term);

          if (newItems.length > 0) {
                acc.push({ text: item.text, items: newItems });
          }
      }

        return acc;
    },                []);
}

public contains(text: string, term: string): boolean {
  return text.toLowerCase().indexOf(term.toLowerCase()) >= 0;
}


}


