import {Injectable, SimpleChanges} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { type } from 'os';

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = 'http://localhost:3000';
  currMap_mapViewer : any;
  myMapsPromise: Promise<any>;
  myDiagram : any;

  constructor(private http: HttpClient) {}
  
  getMap(mapId: String){
    return this.http.get(this.localUrl + '/private/getMap', {headers: {'token': sessionStorage.token,'_id': String(mapId)}}).toPromise()
  }

  createMap(mapName: String, description: String, folderID: String){
    const bodyReq = {
      MapName: mapName,
      Description: description,
      Model: { "class": "GraphLinksModel",  "modelData": {},  "nodeDataArray": [],  "linkDataArray": []},
      folderID: folderID
    }
    return this.http.post(this.localUrl + '/private/createMap', bodyReq ,{headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

  /**
   * Remove map
   * @param mapID
   */
  deleteMap(mapFileToDelete){
    return this.http.delete(this.localUrl + '/private/removeMap/'+ mapFileToDelete.mapID +"&"+ mapFileToDelete.parentNode.folderID ,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }


  
}
