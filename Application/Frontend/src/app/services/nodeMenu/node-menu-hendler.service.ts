import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// export interface ReferenceElement {
//   _id: string,
//   Title: string,
//   CreatorId: string,
//   CreationTime: string,
//   Authors: string,
//   Publication: string,
//   Description: string,
//   Link: string
// }


@Injectable({
  providedIn: 'root'
})

export class NodeMenuHendlerService {
  localUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  // references
  getAllReferences() {
    return this.http.get(this.localUrl + '/private/getAllReferences', {
      headers: { 'token': sessionStorage.token }
    }).toPromise()
  }

  createNewRef(fields: any) {
    console.log(fields.title.value);

    var data = {
      "Title": fields.title.value,
      "Authors": fields.authors.value,
      "Publication": fields.publication.value,
      "Description": fields.description.value,
      "Link": fields.link.value
    }
    console.log(data);
    return this.http.post(this.localUrl + '/private/createReference', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    }).toPromise()

  }

  // contxts
  getAllContexts() {
    return this.http.get(this.localUrl + '/private/getAllContexts', {
      headers: { 'token': sessionStorage.token }
    }).toPromise()
  }

  createNewCtx(fields: any) {
    console.log(fields.title.value);

    var data = {
      "Title": fields.title.value
    }
    console.log(data);
    return this.http.post(this.localUrl + '/private/createContext', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    }).toPromise()
  }

  createNewComment(data: any) {
    return this.http.put(this.localUrl + '/private/addNewComment', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    }).toPromise();

  }

  updateComment(data: any) {
    return this.http.put(this.localUrl + '/private/updateComment', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    }).toPromise();

  }

  deleteComment(data: any) {
    return this.http.put(this.localUrl + '/private/deleteComment', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    }).toPromise();

  }

  // comments
  addLikeToComment(data: any) {
    console.log(data);
    return this.http.put(this.localUrl + '/private/addLikeToComment', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    }).toPromise();
  }
}
