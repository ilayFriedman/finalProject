import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FolderHandlerService {
  localUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getRootUserFolder(){
    return this.http.get(this.localUrl + '/private/getRootFolderById', {headers: {'token': sessionStorage.token}}).toPromise()
  }
  getFolderContents(folderId: String){
    return this.http.post(this.localUrl + '/private/getFolderContents', {headers: {'token': sessionStorage.token,'FolderID': String(folderId)}}).toPromise()
  }

}
