import {Injectable, SimpleChanges} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

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
  
  getMap(mapId: String){
    
    return this.http.get(this.localUrl + '/private/getMap', {headers: {'token': sessionStorage.token,'_id': mapId}}).toPromise()
  }

  createMap(mapName: String, description: String,model){
    const bodyReq = {
      MapName: mapName,
      Description: description,
      Model: model
    }
    return this.http.post(this.localUrl + '/private/createMap', bodyReq ,{headers: {'token': sessionStorage.token}}).toPromise()
  }

  deleteMap(mapId: String){
    console.log()
    const jsonRequest = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': sessionStorage.token
      }),
      body: {
        _id: mapId
      },
    };
    
    return this.http.delete(this.localUrl + '/private/removeMap', jsonRequest).toPromise()
  }
  
}
