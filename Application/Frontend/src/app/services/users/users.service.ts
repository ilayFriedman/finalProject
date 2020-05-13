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

  sendMailToUser(reciever_mail, subject, text){
    const bodyReq = {
      reciever_mail: reciever_mail,
      subject: subject,
      text: text,
    }
    return this.http.post(this.localUrl + '/private/sendMailToUser', bodyReq, { headers: { 'token': sessionStorage.token }, responseType: 'text' }).toPromise()
  }

  // getUserDetailsById(userID: String){
  //   return this.http.get(this.localUrl + '/private/getUserDetailsById/'+ userID, { headers: { 'token': sessionStorage.token }}).toPromise()
  // }

}
