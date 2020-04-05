import { Component, OnInit } from '@angular/core';
import { FolderHandlerService } from '../services/folder-handler.service';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { of, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button'
import { ModalService } from '../services/modal.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

const is = (fileName: string, ext: string) => new RegExp(`.${ext}\$`).test(fileName);
@Component({
  selector: 'app-mapsfolders-viewer',
  templateUrl: './mapsfolders-viewer.component.html',
  styleUrls: ['./mapsfolders-viewer.component.css']
})
export class MapsfoldersViewerComponent implements OnInit {

  // forms validation checkouts
  addFolderCheckOut;
  addMapCheckOut;
  
  //folders variables
  public data: any[] = [{
    text: "/",
    folderID: "5e80d535132e0540b827c4cd",
    items: [],
    isFolder : true,
    description: "blala"
  }];
  selectedFolder: any;
  public parsedData: any[] = this.data;
  public expandedKeys: any[] = ['/']; // root: key /, is already expanded 
  public expandedAtLeastOnce :any[] = ["0"] // root: index 0, is already expanded ; REST in saved by _id
  public selectedKeys: any
  mouseOverNode: any;




  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private http: HttpClient,  private formBuilder: FormBuilder, public router: Router,private modalService: ModalService) {
    this.addFolderCheckOut = this.formBuilder.group({folderName: ['', Validators.required],description: ['', Validators.required]});
    this.addMapCheckOut = this.formBuilder.group({mapName: ['', Validators.required]});
    
  }
  


  ngOnInit() {
    // folders init : find the root Folder
    this.folderHandler.getRootUserFolder().then(res => {

      console.log('======getRootUserFolder request OK=====');
      this.inserMapsToMapTreeViewer(Object(res), this.data[0])
      this.insertFoldersToMapTreeViewer(res, this.data[0])  

    }).catch
      (err => {
        console.log("error here");
        console.log(err)
      })

      this.parsedData = this.data;

  }

  // tree-view icon's init
  public iconClass({ text, items }: any): any {
    return {
      'k-i-file-pdf': is(text, 'pdf'),
      'k-i-folder': items !== undefined,
      'k-i-table-align-middle-center': items == undefined,
      'k-i-image': is(text, 'jpg|png'),
      'k-icon': true
  };
}


inserMapsToMapTreeViewer(folderObject,rootNode){
  folderObject.MapsInFolder.forEach(map => {
  rootNode.items.push({text: map.mapName,mapID: map.mapID, isFolder: false})
  });

}

insertFoldersToMapTreeViewer(folderObject, rootNode){
  // get all child-folder
  folderObject.SubFolders.forEach(folder=>{
    var folderNode = {text: folder.folderName,folderID: folder.folderID, items: [], isFolder: true}
    rootNode.items.push(folderNode)
    this.expandedAtLeastOnce.push(folderNode.folderID)
    // get next level of each folder
    this.folderHandler.getFolderContents(folderNode.folderID).then(res => {
          // console.log('======get Content folder request OK=====');
          this.inserMapsToMapTreeViewer(res,folderNode)
          this.shallowFolderInsert(res,folderNode)
          console.log(res);

        }).catch
          (err=> {
            console.log("error with creation - promise return");
            console.log(err)
          })

  });
}

shallowFolderInsert(folderObecjt,rootNode){
  folderObecjt.SubFolders.forEach(folder => {
    rootNode.items.push({text: folder.folderName,folderID: folder.folderID,items: [], isFolder: true})
    // this.expandedAtLeastOnce.push(folder.folderID)
    });
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

onSubmit_AddFolder(){

  if (this.addFolderCheckOut.invalid ||this.addFolderCheckOut.controls.folderName.value == "/") {
    console.log("bad form!")
    return;
  }
  var self = this
  console.log(this.addFolderCheckOut.controls.folderName.value)
  console.log(this.addFolderCheckOut.controls.description.value)
  console.log(this.selectedFolder);
  
  this.folderHandler.createFolder(this.addFolderCheckOut.controls.folderName.value,this.addFolderCheckOut.controls.description.value,this.selectedFolder.folderID).then(res => {
    console.log('======create new folder request OK=====');
    var jsonRes = JSON.parse(res)
    self.selectedFolder.items.push({text: jsonRes.Name,folderID: jsonRes._id,items: [], isFolder: true})
  }).catch
    (err=> {
      console.log("error with creation - promise return");
      console.log(err)
    })

}

onSubmit_AddMap(){

  if (this.addMapCheckOut.invalid) {
    console.log("bad form!")
    return;
  }
  var self = this
  console.log(this.addMapCheckOut.controls.mapName.value)
  
  // this.folderHandler(this.addMapCheckOut.controls.mapName.value,this.addMapCheckOut.controls.description.value,this.selectedFolder.folderID).then(res => {
  //   console.log('======create new folder request OK=====');
  //   var jsonRes = JSON.parse(res)
  //   self.selectedFolder.items.push({text: jsonRes.Name,folderID: jsonRes._id,items: [], isFolder: true})
  // }).catch
  //   (err=> {
  //     console.log("error with creation - promise return");
  //     console.log(err)
  //   })

}


getDescription(dataItem){
  if(dataItem.isFolder){
    this.folderHandler.getFolderProperties(dataItem.folderID).then(res => {
      console.log('======GET PROPERTY request OK=====');
      var jsonRes = JSON.parse(JSON.stringify(res))
      dataItem.description = JSON.parse(jsonRes.FolderDescription)
    }).catch
      (err=> {
        console.log("error with creation - promise return");
        console.log(err)
      })
      
  }
}

mouseOverNodeChanger(dataItem){
  this.mouseOverNode = dataItem
}

activateMapInMapViewer(dataItem){
  if(!dataItem.isFolder){
    this.mapHandler.getMap(dataItem.mapID).then(res => {
      console.log(res);
      this.mapHandler.currMap_mapViewer = res
      this.router.navigate(['/mapViewer']);
    }).catch
      (err=> {
        console.log("error with getMap - promise return");
        console.log(err)
      })
      
  }
}
// ############### modal functionallity ########################

openModal(id: string) {
  // this.nodeModal.loadNodeRefs()
  this.modalService.open(id);
}


closeModal(id: string) {
  this.modalService.close(id);
}


// ############### Tree-view functionallity ########################

public handleSelectionButton(dataItem) {
  this.selectedFolder = dataItem
}


public children = (dataitem: any): Observable<any[]> => of(dataitem.items);
public hasChildren = (dataitem: any): boolean => !!dataitem.items;

/**
 * A `collapse` event handler that will remove the node hierarchical index
 * from the collection, collapsing its children.
 */
public handleCollapse(node) {
  this.expandedKeys = this.expandedKeys.filter(k => k !== node.index);
}

/**
* An `expand` event handler that will add the node hierarchical index
* to the collection, expanding the its children.
*/
public handleExpand(node) {
  console.log(node);
  console.log(this.expandedAtLeastOnce)
  node.dataItem.items.forEach(folder=>{
    // console.log("=========== "+folder)
    if(this.expandedAtLeastOnce.indexOf(folder.folderID) == -1){
      this.expandedAtLeastOnce.push(folder.folderID)
      // get next level of each folder
      this.folderHandler.getFolderContents(folder.folderID).then(res => {
        // console.log('======get Content folder request OK=====');
        // console.log(res)
        // console.log(node)
        // console.log("=======================================")
        // this.inserMapsToMapTreeViewer(res,node)
        this.shallowFolderInsert(res,folder)
        // console.log(res);

      }).catch
        (err=> {
          console.log("error with creation - promise return");
          console.log(err)
        })
        
    }
  });
  this.expandedKeys = this.expandedKeys.concat(node.index);
}

public isExpanded = (dataItem: any, index: string) => {
  
  return this.expandedKeys.indexOf(index) > -1;
}

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


