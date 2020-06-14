import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  localUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }
  //TODO @Saar - Add Login, Register, ChangeUserInfo functions, and remove previous implementations from components.
  /**
   * Get all users.
   * Returns an object of the form:
   * [{"_id":string, "Username":string, "FirstName":string, "LastName":string}]
   */
  getUsers(){
    return this.http.get(this.localUrl + '/private/getUsers', { headers: { 'token': sessionStorage.token },responseType: 'text'}).toPromise()
  }

  /**
   * Register a new user. The function transform email address to lowercase.
   * @param email 
   * @param pwd 
   * @param firstName 
   * @param lastname 
   * @param getPermissionUpdate
   */
  registerUser(email, pwd, firstName, lastname, getPermissionUpdate){
    var data = {
      'email': email.toLowerCase(),
      'pwd': pwd,
      'FirstName': firstName,
      'LastName': lastname,
      'getPermissionUpdate': getPermissionUpdate
    }

    return this.http.post(this.localUrl + '/register', data, { responseType: 'text' });
  }

  restorePassword(Username){
    return this.http.post(this.localUrl + '/restorePassword', {Username: Username}, {responseType: 'text'}).toPromise()
  }

  getUserDetails(){
    return this.http.get(this.localUrl + '/private/getUserDetails',{ headers: { 'token': sessionStorage.token }}).toPromise()
  }
  
  changeInfo(data){
    return this.http.post(this.localUrl + '/private/changeInfo', data, { headers: {'token': sessionStorage.token},  responseType: 'text' }).toPromise();
  }

  removeUser(){
    return this.http.delete(this.localUrl + '/private/removeUser', { headers: {'token': sessionStorage.token},  responseType: 'text' }).toPromise();
  }

}
