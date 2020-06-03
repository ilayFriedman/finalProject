import { Component, ViewEncapsulation, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MapsHandlerService } from './services/maps-handler.service';
import { MatSelectionList } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent {
  title = 'ME-Mapper';
  userFullName = sessionStorage.userFullName

  localUrl = environment.backendUrl;
  submitted = false
  loginForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),

  });
  fullName = sessionStorage.userFullName;
  inputTextSearch: string;
  showSearchResults: boolean = false;
  searchResults: any[] = [];

  @ViewChild('results', { static: false }) results: MatSelectionList;

  constructor(private router: Router, private formBuilder: FormBuilder, public mapHandler: MapsHandlerService) { }

  ngOnInit() {
    // this.logOut()
    // this.router.navigate(['/login'])
    this.router.navigate(['/logedHome']) //remove at the end of debug
  }

  isLoggedIn() {
    return sessionStorage.userFullName != null;
  }

  logOut() {
    sessionStorage.clear()
  }

  searchNodesAndMaps() {
    this.searchResults = [];
    this.searchNodes();
    this.searchMaps();
  }
  searchNodes() {
    console.log(this.inputTextSearch);
    if (this.inputTextSearch == '') {
      return;
    }
    this.mapHandler.searchNodes(this.inputTextSearch).then(res => {
      console.log(res);
      let mapResults: any = res;
      if (mapResults) {
        mapResults.forEach(map => {
          this.searchResults.push(map)
        })
        this.showSearchResults = true;

      }
    }).catch
      (err => {
        console.log("error searching node");
        console.log(err)
      });

  }

  searchMaps() {
    console.log(this.inputTextSearch);
    console.log("search map");

    if (this.inputTextSearch == '') {
      return;
    }
    this.mapHandler.searchMaps(this.inputTextSearch).then(res => {
      console.log(res);
      let mapResults: any = res;
      if (mapResults) {
        mapResults.forEach(map => {
          if (!this.searchResults.some(mapRes => mapRes['mapID'] === map.mapID)) {
            this.searchResults.push(map)
          }
        })
        this.showSearchResults = true;
      }
    }).catch
      (err => {
        console.log("error searching maps");
        console.log(err)
      });
  }

  goToResult(res) {
    console.log(res);
    this.mapHandler.getMap(res.mapID).then(map => {
      this.inputTextSearch = ""
      this.showSearchResults = false;
      this.mapHandler.currMap_mapViewer = map
      this.router.navigate(['/mapViewer'])

    }).catch
      (err => {
        console.log("error with getMap for go to search map");
        console.log(err)
      })

  }

}


