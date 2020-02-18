import { Component, OnInit, SystemJsNgModuleLoader } from '@angular/core';
import { MapsHandlerService } from '../services/maps-handler.service';
@Component({
  selector: 'app-text-map-converter',
  templateUrl: './text-map-converter.component.html',
  styleUrls: ['./text-map-converter.component.css']
})
export class TextMapConverterComponent implements OnInit {
  mapModel : any
  translatedMap : any
  constructor(private mapHandler: MapsHandlerService) { }

  ngOnInit() {
    this.mapModel = this.mapHandler.myDiagram.model
    this.convertMapToText()
  }
  
  convertMapToText(){
    var nodesKeysDict = {};
    var translate = "";
    for (let node of this.mapModel.nodeDataArray) {
      nodesKeysDict[node.key]= [node.text,node.category]
    }

    for (let link of this.mapModel.linkDataArray) {
      translate += nodesKeysDict[link.from][1]+" "+ nodesKeysDict[link.from][0]+" is "
      console.log(link.category)
      switch(link.category) { 
        case "Association": { 
          translate += "associated with " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0]+"\n"
           break; 
        } 
        case "AchievedBy": { 
          translate += "achieved by " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0]+"\n"
           break; 
        } 
        case "extendBy": { 
          translate += "extend by " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0]+"\n"
          break; 
        } 
        case "ConsistsOf": { 
          translate += "consists of " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0]+"\n"
          break; 
        } 
        case "Contribution": { 
          translate += "contributs to " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0]+"\n"
          break; 
        } 
        default: { 
          translate += link.category+ " " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0]+"\n"
           break; 
        } 
     } 
    }
    console.log(translate)
    this.translatedMap = translate
  }
}