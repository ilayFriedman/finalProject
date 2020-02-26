import {Injectable, SimpleChanges} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = 'http://localhost:3000';
  myMaps: any;
  shit : any;
  myMapsPromise: Promise<any>;
  myDiagram : any;

  constructor(private http: HttpClient) {
    this.myMapsPromise = this.http.get(this.localUrl + '/private/getAllUserMaps', {
      headers: {'token': sessionStorage.token}
    }).toPromise()
  }
  
}
