import {environment} from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private http: HttpClient) { }

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
   * Update the group's description
   * 
   * @param groupId 
   * @param description 
   */
  updateGroupProperties(groupId: string, description: string){
    const requestBody = {
      _id: groupId,
      description: description,
    }

    return this.http.post(environment.backendUrl + '/private/updateGroupProperties', requestBody, { headers: { 'token': sessionStorage.token } }).toPromise()
  }

  /**
   * Remove user's permission on group
   * @param groupId 
   * @param users 
   */
  removeUserFromGroup(groupId: string, usersId: [string]){
    return this.http.delete(environment.backendUrl + '/private/RemoveUserFromGroup/' + groupId + "/" + usersId[0], { headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise();
  }

  /**
   * Set userId to have permission on groupId
   * @param groupId
   * @param usersId 
   * @param permission 
   */
  setUserPermissionForGroup(groupId: string, usersId: [string], permission: [string]){
    const requestBody = {
      _id: groupId,
      userId: usersId[0],
      permission: permission[0]
    }

    return this.http.post(environment.backendUrl + '/private/SetUserPermissionForGroup', requestBody, { headers: { 'token': sessionStorage.token},responseType: 'text'}).toPromise();
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
   * Get all groups in which the logged in user is a Member or a Manager.
   * Returns an object of the form:
   * [{"GroupId":string, "GroupName":string, "GroupDescription":string}]
   */
  getGroupsUserBlongsTo(){
    return this.http.get(environment.backendUrl + '/private/GetGroupsUserBlongsTo', { 
      headers: { 'token': sessionStorage.token }
     }).toPromise()
  }

  /**
   * Get all groups in which the logged in user is an Owner.
   * Returns an object of the form:
   * [{"GroupId":string, "GroupName":string, "GroupDescription":string}]
   */
  getGroupsUserOwns(){
    return this.http.get(environment.backendUrl + '/private/GetGroupsUserOwns', { 
      headers: { 'token': sessionStorage.token }
     }).toPromise()
  }

}
