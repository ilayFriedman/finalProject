import { Component, ViewEncapsulation, OnInit, HostListener, ViewChild, ContentChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MapsHandlerService } from './services/maps-handler.service';
import { MatSelectionList } from '@angular/material';
import { MapViewerComponent } from './map-viewer/map-viewer.component';


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
  ],
  providers: [MapViewerComponent]
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
  fullName = "";
  inputTextSearch: string;
  showSearchResults: boolean = false;
  searchResults: any[] = [];
  showPopDiv = false;

  @ContentChild(MapViewerComponent, { static: false }) mapViewer: MapViewerComponent;
  @ViewChild('results', { static: false }) results: MatSelectionList;

  constructor(private router: Router, private formBuilder: FormBuilder, public mapHandler: MapsHandlerService, public changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    // this.logOut()
    // this.router.navigate(['/login'])
    this.router.navigate(['/logedHome']) //remove at the end of debug
    this.inputTextSearch = ""
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }
  ngOnChanges() {
    this.changeDetector.detectChanges();
  }


  isLoggedIn() {
    this.fullName = sessionStorage.userFullName;
    return sessionStorage.userFullName != null;
  }

  logOut() {
    if (this.mapHandler.currMap_mapViewer)
      this.mapHandler.updateInUse(" ");
    sessionStorage.clear()
  }

  onClickedOutside(e: Event) {
    console.log("hi")
    this.showPopDiv = false;
  }

  searchNodesAndMaps() {
    this.searchResults = [[], []];
    this.searchNodes();
    this.searchMaps();
    this.showPopDiv = true
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
          this.searchResults[0].push(map)
        })
        this.showSearchResults = true;

      }
    }).catch
      (err => {
        console.log("error searching node");
        console.log(err)
      });

  }
  closeSearchDiv(event) {
    this.showSearchResults = false;
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
          this.searchResults[1].push(map)
          // if (!this.searchResults.some(mapRes => mapRes['mapID'] === map.mapID)) {
          // }
        })
        this.showSearchResults = true;
      }
    }).catch
      (err => {
        console.log("error searching maps");
        console.log(err)
      });
  }

  goToResult(res, type) {
    console.log(res);
    // not in mapViewer
    this.mapHandler.getMap(res.mapID).then(map => {
      this.inputTextSearch = "";
      this.showSearchResults = false;
      if (!this.mapHandler.currMap_mapViewer) {
        this.mapHandler.currMap_mapViewer = map;
        this.router.navigate(['/mapViewer'])
        // this.mapHandler.myDiagram.select(this.mapHandler.myDiagram.findNodeForKey(res.nodeKey));
      }
      else {
        if (type == 'node') {
          this.mapViewer.goToConnectMap([map, res.nodeKey])
        }
      }
    }).catch
      (err => {
        console.log("error with getMap for go to search map");
        console.log(err)
      })

  }

  isSavedFunc() {
    // console.log(!this.mapHandler.isSaved && !this.mapHandler.isReadOnlyMode);
    return !this.mapHandler.isSaved && !this.mapHandler.isReadOnlyMode
  }

}


