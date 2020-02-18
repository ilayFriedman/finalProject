import { Component, OnInit, SystemJsNgModuleLoader } from '@angular/core';
import { MapsHandlerService } from '../services/maps-handler.service';
@Component({
  selector: 'app-text-map-converter',
  templateUrl: './text-map-converter.component.html',
  styleUrls: ['./text-map-converter.component.css']
})
export class TextMapConverterComponent implements OnInit {

  constructor(private mapHandler: MapsHandlerService) { }

  ngOnInit() {
    console.log(this.mapHandler.myDiagram)
  }

}
