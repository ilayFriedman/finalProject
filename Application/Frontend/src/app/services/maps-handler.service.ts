import { Injectable, SimpleChanges } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = environment.backendUrl;
  currMap_mapViewer: any;
  myDiagram: any;
  folderNamesList: any = [];


  constructor(private http: HttpClient) { }

  createMap(mapName: String, description: String, folderID: String) {
    const bodyReq = {
      MapName: mapName,
      Description: description,
      Model: '{ "class": "GraphLinksModel", "modelData": {}, "nodeDataArray": [], "linkDataArray": [] }',
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
    return this.http.delete(this.localUrl + '/private/removeMap/' + mapFileToDelete.mapID + "&" + mapFileToDelete.permission + "&" + mapFileToDelete.parentNode.folderID, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  updateMapDecription(mapID, newName, newDescription) {
    const bodyReq = {
      mapID: mapID,
      mapName: newName,
      Decription: newDescription,
    }
    return this.http.post(this.localUrl + '/private/updateMapProperties', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  // PERMISSIONS //

  addNewPermission(mapID, name, type, permission_To) {
    const bodyReq = {
      mapId: mapID,
      elementToAdd: { name: name, type: type, permission_To: permission_To }
    }
    console.log(bodyReq)
    return this.http.post(this.localUrl + '/private/addNewPermission', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  getUsersPermissionsMap(mapId: String) {
    return this.http.get(this.localUrl + '/private/getUsersPermissionsMap/' + mapId, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  removeUserPermission(mapId, userId, permission) {
    // console.log(mapId,userId,permission)
    return this.http.delete(this.localUrl + '/private/removeUserPermission/' + mapId + "&" + userId + "&" + permission, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  updateUserPermission(mapID, userId, permission_From, permission_To) {
    const bodyReq = {
      mapID: mapID,
      userID: userId,
      permission_From: permission_From,
      permission_To: permission_To
    }
    return this.http.post(this.localUrl + '/private/updateUserPermission', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }


  getUserPermission() {
    let permissions = this.currMap_mapViewer.Permission;
    let currUserId = sessionStorage.userId
    if (this.currMap_mapViewer.Permission.Owner.filter(obj => obj.id == sessionStorage.userId) != null) {
      return 3;
    }
    else if (this.currMap_mapViewer.Permission.Write.filter(obj => obj.id == sessionStorage.userId) != null) {
      return 2;
    }
    // else if (this.currMap_mapViewer.Permission.Read.filter(obj=>obj.id == sessionStorage.userId) != null) {
    else {
      return 1;
    }

  }

  // Shared maps //
  getSharedMaps(userID) {
    return this.http.get(this.localUrl + '/private/getSharedMaps/' + userID, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }


  // connect maps //
  searchNodes(nodeName) {
    return this.http.get(this.localUrl + '/private/searchNodes/' + nodeName, { headers: { 'token': sessionStorage.token } }).toPromise()
  }

  // subscripotions //
  addNewSubscriber() {
    const bodyReq = {
      mapID: this.currMap_mapViewer._id,
      userID: sessionStorage.userId
    }
    console.log(bodyReq)
    return this.http.post(this.localUrl + '/private/addNewSubscriber', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }


  removeSubscriber() {
    // console.log(mapId,userId,permission)
    let params = this.currMap_mapViewer._id + "&" + sessionStorage.userId
    console.log(params);
    return this.http.delete(this.localUrl + '/private/removesubscriber/' + params, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

}
