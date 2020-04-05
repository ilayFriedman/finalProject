import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ReferenceElement {
  _id: string,
  Title: string,
  CreatorId: string,
  CreationTime: string,
  Authors: string,
  Publication: string,
  Description: string,
  Link: string
}


@Injectable({
  providedIn: 'root'
})


export class ReferenceHendlerService {
  localUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

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
}