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
<<<<<<< HEAD
    console.log(this.mapHandler.myDiagram)
=======
    console.log(this.mapHandler.myDiagram.model)
>>>>>>> 7bdf5f9402af009734d1abc737f3e5464e9fe97c
  }

}