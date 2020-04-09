import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FolderHandlerService {
  localUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

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
  getFolderProperties(folderId: String) {
    return this.http.post(this.localUrl + '/private/getFolderProperties', {FolderID: folderId},{ headers: { 'token': sessionStorage.token}}).toPromise()
  }


  createFolder(folderName, folderDesc, parentDir) {
    const bodyReq = {
      folderName: folderName,
      Description: folderDesc,
      ParentDir: parentDir
    }
    return this.http.post(this.localUrl + '/private/createFolder',bodyReq,  {headers: {'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }


  removeFolderFromFolder(parentID, folderID){
    return this.http.delete(this.localUrl + '/private/removeFolderFromFolder/'+ parentID+"&"+ folderID ,{ headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise()
  }

}
