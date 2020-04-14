import {Injectable, SimpleChanges} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = 'http://localhost:3000';
  currMap_mapViewer : any;
  myMapsPromise: Promise<any>;
  myDiagram : any;

  constructor(private http: HttpClient) {}

  createMap(mapName: String, description: String, folderID: String){
    const bodyReq = {
      MapName: mapName,
      Description: description,
      Model: { "class": "GraphLinksModel",  "modelData": {},  "nodeDataArray": [],  "linkDataArray": []},
      folderID: folderID
    }
    return this.http.post(this.localUrl + '/private/createMap', bodyReq ,{headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }


  getMap(mapId: String){
    return this.http.get(this.localUrl + '/private/getMap/'+mapId, {headers: {'token': sessionStorage.token}}).toPromise()
  }

  getMapDescription(mapId: String){
    return this.http.get(this.localUrl + '/private/getMapDescription/'+mapId, {headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

  getMapPermission(mapId: String){
    return this.http.get(this.localUrl + '/private/getMapPermission/'+mapId, {headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

  deleteMap(mapFileToDelete){
    return this.http.delete(this.localUrl + '/private/removeMap/'+ mapFileToDelete.mapID +"&"+ mapFileToDelete.parentNode.folderID ,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

  updateMapDecription(mapID,newName,  newDescription,parentFolderID){
    const bodyReq = {
      mapID: mapID,
      mapName: newName,
      Decription: newDescription,
      parentFolderID: parentFolderID
    }
    return this.http.post(this.localUrl + '/private/updateMapProperties', bodyReq, {headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

  
}
