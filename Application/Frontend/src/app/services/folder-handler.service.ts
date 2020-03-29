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

}
