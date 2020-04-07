import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  localUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }
  //TODO @Saar - Add Login, Register, ChangeUserInfo functions, and remove previous implementations from components.
  /**
   * Get all users.
   * Returns an object of the form:
   * [{"_id":string, "Username":string, "FirstName":string, "LastName":string}]
   */
  getUsers(){
    return this.http.get(this.localUrl + '/private/getUsers', { 
      headers: { 'token': sessionStorage.token }
     }).toPromise()
  }
}
