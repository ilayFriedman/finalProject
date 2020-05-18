import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContextHendlerService {
  localUrl = environment.backendUrl;
  constructor(private http: HttpClient) { }


}
