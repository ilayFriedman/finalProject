import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  localUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  /**
   * Create a new group. The creating user will be set as the groups owner.
   * @param newGroupName 
   * @param newGroupDescriptoin 
   */
  // TODO return the new groups ID from backend @Saar
  createNewGroup(newGroupName: string, newGroupDescription: string) {
    const requestBody = {
      groupName: newGroupName,
      description: newGroupDescription,
    }

    return this.http.post(this.localUrl + '/private/createGroup', requestBody, { headers: { 'token': sessionStorage.token } }).toPromise()
  }

  /**
   * Permanently delete group
   * @param groupId 
   */
  deleteGroup(groupId: string){
    
    const httpOptions = {
      headers: new HttpHeaders({ 'token': sessionStorage.token }), body: { _id: groupId }
    };

    return this.http.delete(this.localUrl + '/private/deleteGroup', httpOptions).toPromise();
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

    return this.http.post(this.localUrl + '/private/updateGroupProperties', requestBody, { headers: { 'token': sessionStorage.token } }).toPromise()
  }

  /**
   * Remove user's permission on group
   * @param groupId 
   * @param users 
   */
  removeUserFromGroup(groupId: string, usersId: [string]){
    
    const httpOptions = {
      headers: new HttpHeaders({ 'token': sessionStorage.token }), body: { _id: groupId, userId: usersId[0] }
    };

    return this.http.delete(this.localUrl + '/private/RemoveUserFromGroup', httpOptions).toPromise();
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

    return this.http.post(this.localUrl + '/private/SetUserPermissionForGroup', requestBody, { headers: { 'token': sessionStorage.token } }).toPromise();
  }

  /**
   * Get all group's members.
   * Returns an object of the form:
   * {{"Owner":[{"userId": string]}}, {"Manager":[{"userId": string}]}, {"Member":[{"userId": string]}}}
   * @param groupId
   */
  getGroupsMembers(groupId: string){
    const httpOptions = {
      headers: new HttpHeaders({ 'token': sessionStorage.token }), 
      body: { _id: groupId }
    };

    return this.http.get(this.localUrl + '/private/GetGroupsMembers', httpOptions).toPromise();
  }

  /**
   * Get all groups in which the logged in user is a Memenr or Manager.
   * Returns an object of the form:
   * [{"GroupId":string, "GroupName":string, "GroupDescription":string}]
   */
  getGroupsUserBlongsTo(){
    return this.http.get(this.localUrl + '/private/GetGroupsUserBlongsTo', { 
      headers: { 'token': sessionStorage.token }
     }).toPromise()
  }

  /**
   * Get all groups in which the logged in user is an Owner.
   * Returns an object of the form:
   * [{"GroupId":string, "GroupName":string, "GroupDescription":string}]
   */
  getGroupsUserOwns(){
    return this.http.get(this.localUrl + '/private/GetGroupsUserOwns', { 
      headers: { 'token': sessionStorage.token }
     }).toPromise()
  }

}
