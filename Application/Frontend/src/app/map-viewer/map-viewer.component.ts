import {Component, Input, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import {MapsHandlerService} from "../services/maps-handler.service";

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.css']
})
export class MapViewerComponent implements OnInit {
  // @Input('mapModel') mapModelId: any;
  mapModel: any;
  constructor(private mapHandler:MapsHandlerService ) { }

  ngOnInit() {
      this.mapModel= sessionStorage.getItem("myMaps")
    // params.subscribe(params => {
    //   this.mapModel = params['model']
    // })
  }

}
