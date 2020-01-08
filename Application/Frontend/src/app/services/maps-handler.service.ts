import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MapsHandlerService {
  localUrl = 'http://localhost:3000';
  myMaps: Array<any>;

  constructor(private http: HttpClient) {
  }

  // async getMaps() {
  //   this.myMaps = await this.http.get(this.localUrl + '/private/getAllUserMaps', {
  //     headers: {'token': sessionStorage.token}
  //   }).toPromise().then(function (response) {
  //     let shit = response
  //
  //   })
  //
  //
  //   // usersMaps.subscribe(response => {
  //   //     this.myMaps = response
  //   //     console.log(this.myMaps)
  //   //     return this.myMaps
  //   //   }, error => {
  //   //     console.log(error.error)
  //   //     alert(error.error)
  //   //   }
  //   //
  //   // );
  //   console.log("nu! " + this.myMaps)
  // }
}
