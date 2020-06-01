import {environment} from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  public allMyGroups: any = []
  constructor(private http: HttpClient) { }

  getMyGroups(){
    const httpOptions = {
      headers: new HttpHeaders({ 'token': sessionStorage.token })
    };

    return this.http.get(environment.backendUrl + '/private/getMyGroups', httpOptions).toPromise();
  }



  /**
   * Create a new group. The creating user will be set as the groups owner.
   * @param newGroupName 
   * @param newGroupDescription 
   */
  createNewGroup(newGroupName: string, newGroupDescription: string) {
    const requestBody = {
      groupName: newGroupName,
      description: newGroupDescription,
    }

    return this.http.post(environment.backendUrl + '/private/createGroup', requestBody, { headers: { 'token': sessionStorage.token } }).toPromise()
  }

  /**
   * Permanently delete group
   * @param groupId 
   */
  deleteGroup(groupId: string){
    const headers = new HttpHeaders().set('token', sessionStorage.token);
    
    return this.http.delete(environment.backendUrl + '/private/deleteGroup/' + groupId, {headers, 'responseType': 'text'}).toPromise();
  }

    /**
   * Get all group's members.
   * Returns an object of the form:
   * {{"Owner":[{"userId": string]}}, {"Manager":[{"userId": string}]}, {"Member":[{"userId": string]}}}
   * @param groupId
   */
  getGroupsMembers(groupId: string){
    const httpOptions = {
      headers: new HttpHeaders({ 'token': sessionStorage.token })
    };

    return this.http.get(environment.backendUrl + '/private/GetGroupsMembers/' + groupId, httpOptions).toPromise();
  }


  /**
   * Update the group's description
   * 
   * @param groupId 
   * @param groupName 
   * @param description 
   */
  updateGroupProperties(groupId: string, groupName: string, description: string){
    const requestBody = {
      _id: groupId,
      groupName: groupName,
      description: description,
    }

    return this.http.post(environment.backendUrl + '/private/updateGroupProperties', requestBody, { headers: { 'token': sessionStorage.token },responseType: 'text'}).toPromise()
  }


  /**
   * Remove user's permission on group
   * @param groupId 
   * @param users 
   */
  removeUserFromGroup(groupId, usersId, permission){
    console.log("send: "+ groupId + usersId + permission)
    return this.http.delete(environment.backendUrl + '/private/RemoveUserFromGroup/' + groupId + "&" + usersId + "&" + permission, { headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise();
  }

  /**
   * Set userId to have permission on groupId
   * @param groupId
   * @param usersId 
   * @param permission 
   */

  addUserToGroup(groupId, username, permission_To){
    const requestBody = {
      groupId: groupId,
      username: username,
      permission_To: permission_To
    }
    return this.http.post(environment.backendUrl + '/private/addUserToGroup', requestBody, { headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise();
  }

  updateUserPermission(groupId, userID,permission_From,permission_To){
    const requestBody = {
      groupId: groupId,
      userID: userID,
      permission_From: permission_From,
      permission_To: permission_To
    }
    console.log(requestBody)
    return this.http.post(environment.backendUrl + '/private/updateGroupUserPermission', requestBody, { headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise();
  }


}
