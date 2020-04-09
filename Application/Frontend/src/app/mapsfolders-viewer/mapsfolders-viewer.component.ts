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
    parentNode: "",
    items: [],
    isFolder : true,
  }];
  selectedFolder: any;
  public parsedData: any[] = this.data;
  public expandedKeys: any[] = ['/']; // root: key /, is already expanded 
  public expandedAtLeastOnce :any = ['5e80d535132e0540b827c4cd']  // root: index 0, is already expanded ; REST in saved by _id
  mouseOverNode: any;
  actionInModalIsSuccecs: boolean = false;
  formErrors: string;
  fileToDelete: any;




  constructor(private folderHandler: FolderHandlerService, private mapHandler: MapsHandlerService, private http: HttpClient,  private formBuilder: FormBuilder, public router: Router,private modalService: ModalService) {
    this.addFolderCheckOut = this.formBuilder.group({folderName: ['', Validators.required],description: ['', Validators.required]});
    this.addMapCheckOut = this.formBuilder.group({mapName: ['', Validators.required],description: ['', Validators.required]});
    
  }
  


  ngOnInit() {
    // folders init : find the root Folder
    this.folderHandler.getRootUserFolder().then(res => {

      console.log('======getRootUserFolder request OK=====');
      this.inserMapsToMapTreeViewer(res, this.data[0])
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


inserMapsToMapTreeViewer(folderLists,rootNode){
  folderLists.MapsInFolder.forEach(map => {
  rootNode.items.push({text: map.mapName, mapID: map.mapID, parentNode:rootNode, isFolder: false})
  });

}

insertFoldersToMapTreeViewer(folderLists, rootNode){
  // get all child-folder
  folderLists.SubFolders.forEach(folder=>{
    var folderNode = {text: folder.folderName, folderID: folder.folderID, parentNode:rootNode, items: [], isFolder: true}
    // console.log("inset folder: "+ folderNode.folderID);
    
    rootNode.items.push(folderNode)
    // get next level of each folder
    this.folderHandler.getFolderContentsLists(folderNode.folderID).then(res => {
          // console.log('======get Content folder request OK=====');
          this.inserMapsToMapTreeViewer(res,folderNode)
          this.nextLevelSubFoldersInsert(res,folderNode)
          console.log(res);

        }).catch
          (err=> {
            console.log("error with creation - promise return");
            console.log(err)
          })

  });
  
  
}

nextLevelSubFoldersInsert(folderObecjt,rootNode){
  folderObecjt.SubFolders.forEach(folder => {
    rootNode.items.push({text: folder.folderName, folderID: folder.folderID, parentNode: rootNode,  items: [], isFolder: true})
    });
}

onSubmit_AddFolder(){
  if (this.addFolderCheckOut.invalid ||this.addFolderCheckOut.controls.folderName.value == "/") {
    console.log("bad form!")
    this.formErrors = "Worng/Missing inputs.<br>Remember: can't create Folder with the name '/'."
    return;
  }
  this.formErrors = ""
  var self = this
  var findDuplicateFolder = false
  // look for duplicate name
  this.selectedFolder.items.forEach(element => {
    if (self.addFolderCheckOut.controls.folderName.value == element.text){
      findDuplicateFolder = true
    } 
  });
  if(findDuplicateFolder == false){
    this.folderHandler.createFolder(this.addFolderCheckOut.controls.folderName.value,this.addFolderCheckOut.controls.description.value,this.selectedFolder.folderID).then(res => {
      console.log('======create new folder request OK=====');
      var jsonRes = JSON.parse(res)
      self.selectedFolder.items.push({text: jsonRes.Name, folderID: jsonRes._id, parentNode: self.selectedFolder, items: [], isFolder: true})
      this.actionInModalIsSuccecs = true
      setTimeout (() => {this.closeModal("addFolderModal")}, 1000);
    }).catch
      (err=> {
        console.log("error with folder creation - promise return");
        console.log(err)
      })

    this.addFolderCheckOut.reset();
  }
  else{
    this.formErrors = "A folder with that name already exists in this folder. <br>Give another name please"
  }

}

onSubmit_AddMap(){
  if (this.addMapCheckOut.invalid) {
    // console.log("bad form!")
    this.formErrors = "Missing inputs.<br>Remember: you must enter some name for the map!"
    return;
  }
  var self = this
  console.log(this.addMapCheckOut.controls.mapName.value)
  this.formErrors = ""
  var findDuplicateFolder = false
  // look for duplicate name
  this.selectedFolder.items.forEach(element => {
    if (self.addMapCheckOut.controls.mapName.value == element.text){
      findDuplicateFolder = true
    } 
  });
  
  if(findDuplicateFolder == false){

    // map creation
    this.mapHandler.createMap(this.addMapCheckOut.controls.mapName.value,this.addMapCheckOut.controls.description.value,this.selectedFolder.folderID).then(res => {
      console.log('======create new map request OK=====');
      var jsonRes = JSON.parse(res)

      // add to parent folder
      // this.folderHandler.addMapToFolder(this.selectedFolder.folderID,jsonRes._id,jsonRes.MapName).then(res => {
        console.log('======add map to parent folder request OK=====');
        // add to tree-view
        self.selectedFolder.items.unshift({text: jsonRes.MapName, mapID: jsonRes._id, parentNode:this.selectedFolder, isFolder: false})
        this.actionInModalIsSuccecs = true
        setTimeout (() => {this.closeModal("addMapModal")}, 1000);

      // }).catch
      //   (err=> {
      //     console.log("error with addto parent folder - promise return");
      //     console.log(err)
      //   });
    }).catch
      (err=> {
        console.log("error with map creation - promise return");
        console.log(err)
      });

    this.addMapCheckOut.reset();
  }
  else{
    this.formErrors = "A folder with that name already exists in this folder. <br>Give another name please"
  }
}

// getDescription(dataItem){
//   if(dataItem.isFolder){
//     this.folderHandler.getFolderProperties(dataItem.folderID).then(res => {
//       console.log('======GET PROPERTY request OK=====');
//       var jsonRes = JSON.parse(JSON.stringify(res))
//       dataItem.description = JSON.parse(jsonRes.FolderDescription)
//     }).catch
//       (err=> {
//         console.log("error with creation - promise return");
//         console.log(err)
//       })
      
//   }
// }

mouseOverNodeChanger(dataItem){
  this.mouseOverNode = dataItem
}

loadSelectedMap_toMapViewer(dataItem){
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

closeModal(modalId){
  this.modalService.close(modalId);
  this.actionInModalIsSuccecs = false
  this.formErrors=''
  this.addFolderCheckOut.reset();
  this.addMapCheckOut.reset();

}


// ############### dialog functionallity (delete files from tree) ########################
public deleteDialogOpened = false;

public closeDialog(status, fileToDelete) {
  this.deleteDialogOpened = false;
  console.log(fileToDelete)
  if(status == "yes"){  // the user choose to delete the file
    if(fileToDelete.isFolder){  // folder-file
      if(fileToDelete.items.length != 0){}  // delete all inside

      // delete the folder
      this.deleteSingleFolder(fileToDelete);
    }
    else{ // map-file
      console.log(fileToDelete)
      this.deleteSignleMap(fileToDelete);
    }
  }
}

  private deleteSignleMap(fileToDelete: any) {

    
    // this.folderHandler.removeMapFromFolder(fileToDelete.parentNode.folderID, fileToDelete.mapID).then(res => {
      this.mapHandler.deleteMap(fileToDelete).then(res => {
        fileToDelete.parentNode.items = fileToDelete.parentNode.items.filter(item => item !== fileToDelete);
        this.data = this.data.slice();
        this.parsedData = this.parsedData.slice();
      }).catch(err => {
        console.log(err);
      });
    // }).catch(err => {
    //   console.log(err);
    // });
  }

  private deleteSingleFolder(fileToDelete: any) {
    this.folderHandler.removeFolderFromFolder(fileToDelete.parentNode.folderID, fileToDelete.folderID).then(res => {
      fileToDelete.parentNode.items = fileToDelete.parentNode.items.filter(item => item !== fileToDelete);
      this.data = this.data.slice();
      this.parsedData = this.parsedData.slice();
    }).catch(err => {
      console.log(err);
    });
  }

public openDialog(dataItem) {
  this.fileToDelete = dataItem
  this.deleteDialogOpened = true;
}


// ############### Tree-view functionallity ########################

public clickUpdateDataItem(dataItem) {
  this.selectedFolder = dataItem
  console.log(this.selectedFolder);
  
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
  // console.log(node);

  node.dataItem.items.forEach(folder=>{
    // console.log("=========== "+folder)
    if(this.expandedAtLeastOnce.indexOf(folder.folderID) == -1){
      this.expandedAtLeastOnce.push(folder.folderID)
      // get next level of each folder
      this.folderHandler.getFolderContentsLists(folder.folderID).then(res => {
        this.nextLevelSubFoldersInsert(res,folder)
      }).catch
        (err=> {
          console.log("error with getFolderContentsLists - promise return");
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


