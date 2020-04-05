import {Injectable, SimpleChanges} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = 'http://localhost:3000';
  myMaps: any; // getAllMAPS
  currMap_mapViewer : any;
  myMapsPromise: Promise<any>;
  myDiagram : any;

  constructor(private http: HttpClient) {
    this.myMapsPromise = this.http.get(this.localUrl + '/private/getAllUserMaps', {
      headers: {'token': sessionStorage.token}
    }).toPromise()
  }
  
  getMap(mapId: String){
    return this.http.get(this.localUrl + '/private/getMap', {headers: {'token': sessionStorage.token,'_id': String(mapId)}}).toPromise()
  }

  // createMap(mapName: String, description: String,model){
  
  //   return this.http.post(this.localUrl + '/private/createMap', bodyReq ,{headers: {'token': sessionStorage.token}}).toPromise()
  // }

  /**
   * Remove map
   * @param mapId
   */
  deleteMap(mapId: String){
    const httpOptions = {
      headers: new HttpHeaders({ 'token': sessionStorage.token }), body: { _id: mapId}
    };

    return this.http.delete(this.localUrl + '/private/removeMap', httpOptions).toPromise()
  }
  
}
