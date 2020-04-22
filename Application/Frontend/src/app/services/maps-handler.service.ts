import { Injectable, SimpleChanges } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = 'http://localhost:3000';
  currMap_mapViewer: any;
  myMapsPromise: Promise<any>;
  myDiagram: any;
  currMapPermission: string = "";

  constructor(private http: HttpClient) { }

  createMap(mapName: String, description: String, folderID: String) {
    const bodyReq = {
      MapName: mapName,
      Description: description,
      Model: { "class": "GraphLinksModel", "modelData": {}, "nodeDataArray": [], "linkDataArray": [] },
      folderID: folderID
    }
    return this.http.post(this.localUrl + '/private/createMap', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }


  getMap(mapId: String) {
    return this.http.get(this.localUrl + '/private/getMap/' + mapId, { headers: { 'token': sessionStorage.token } }).toPromise()
  }

  getMapDescription(mapId: String) {
    return this.http.get(this.localUrl + '/private/getMapDescription/' + mapId, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  deleteMap(mapFileToDelete) {
    return this.http.delete(this.localUrl + '/private/removeMap/' + mapFileToDelete.mapID + "&" + mapFileToDelete.parentNode.folderID, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  updateMapDecription(mapID, newName, newDescription, parentFolderID) {
    const bodyReq = {
      mapID: mapID,
      mapName: newName,
      Decription: newDescription,
      parentFolderID: parentFolderID
    }
    return this.http.post(this.localUrl + '/private/updateMapProperties', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  // PERMISSIONS //

  getMapPermission(mapId: String) {
    return this.http.get(this.localUrl + '/private/getMapPermission/' + mapId, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  removeUserPermission(mapId, userId, permission){
    // console.log(mapId,userId,permission)
    return this.http.delete(this.localUrl + '/private/removeUserPermission/'+mapId + "&" + userId+ "&" + permission, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  updateUserPermission(mapID, userId, permission_From, permission_To){
    const bodyReq = {
      mapID: mapID,
      userID: userId,
      permission_From: permission_From,
      permission_To: permission_To
    }
    return this.http.post(this.localUrl + '/private/updateUserPermission',bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }


  getUserPermission() {
    let permissions = this.currMap_mapViewer.Permission;
    let currUserId = sessionStorage.userId
    if (permissions.Owner.userId == currUserId) {
      return 3;
    }
    else if (permissions.Write.indexOf(currUserId) != -1) {
      return 2;
    }
    else if (permissions.Read.indexOf(currUserId) != -1) {
      return 1;
    }

  }

  



}
