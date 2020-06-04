import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FolderHandlerService {
  localUrl = environment.backendUrl;
  constructor(private http: HttpClient) { }


  createFolder(folderName, folderDesc, parentDir) {
    const bodyReq = {
      folderName: folderName,
      Description: folderDesc,
      ParentDir: parentDir
    }
    return this.http.post(this.localUrl + '/private/createFolder',bodyReq,  {headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }
  /*
  return rootFolder of given user
  */
  getRootUserFolder() {
    return this.http.get(this.localUrl + '/private/getRootFolderById', { headers: { 'token': sessionStorage.token } }).toPromise()
  }
/*
returns subFolders, mapsInFolder lists of given folder
*/
  getFolderContentsLists(folderId: String) {
    const bodyReq = {
      FolderID: folderId,
    }
    return this.http.post(this.localUrl + '/private/getFolderContentsLists', bodyReq,{ headers: { 'token': sessionStorage.token}}).toPromise()
  }

  /*
  returns folder name and properties of given folder
  */  
  getFolderDescription(folderId: String) {
    return this.http.get(this.localUrl + '/private/getFolderDescription/'+folderId,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }


  removeFolderFromFolder(parentID, folderID){
    return this.http.delete(this.localUrl + '/private/removeFolderFromFolder/'+ parentID+"&"+ folderID ,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

  updateFolderProperties(folderID, newFolderName, newDescription, parentFolderID){
    const bodyReq = {
      folderID: folderID,
      folderName: newFolderName,
      Description: newDescription,
      parentFolderID: parentFolderID
    }
    return this.http.post(this.localUrl + '/private/updateFolderProperties', bodyReq,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }
  addExistMapToFolder(folderID, mapsList){
    console.log(mapsList)
    const bodyReq = {
      folderID: folderID,
      mapsList: mapsList
    }
    return this.http.post(this.localUrl + '/private/addExistMapTOfolder', bodyReq,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }
}
