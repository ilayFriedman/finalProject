import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  localUrl = 'http://localhost:3000';
  
  constructor() { }
}
