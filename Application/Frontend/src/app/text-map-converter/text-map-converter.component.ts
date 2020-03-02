import { Component, OnInit, SystemJsNgModuleLoader, SimpleChanges, Input, HostListener } from '@angular/core';
import { MapsHandlerService } from '../services/maps-handler.service';
@Component({
  selector: 'app-text-map-converter',
  templateUrl: './text-map-converter.component.html',
  styleUrls: ['./text-map-converter.component.css']
})
export class TextMapConverterComponent implements OnInit  {

  mapModel : any
  links: String[] = []

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
      translate += nodesKeysDict[link.from][1]+" "+ nodesKeysDict[link.from][0].bold()+" is ";
      // console.log(link.category);
      switch(link.category) { 
        case "Association": { 
          translate += "associated with " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0].bold();
           break; 
        } 
        case "AchievedBy": { 
          translate += "achieved by " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0].bold();
           break; 
        } 
        case "extendBy": { 
          translate += "extend by " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0].bold();
          break; 
        } 
        case "ConsistsOf": { 
          translate += "consists of " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0].bold();
          break; 
        } 
        case "Contribution": { 
          translate += "contributs to " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0].bold();
          break; 
        } 
        default: { 
          translate += link.category+ " " + nodesKeysDict[link.to][1]+" " + nodesKeysDict[link.to][0].bold();
           break; 
        } 
     } 
     this.links.push(translate)
     translate = ""
    }
    // console.log(this.links)
  }

  


  // doTextareaValueChange(ev) {
  //   try {
  //     this.translatedMap = ev.target.value;
  //   } catch(e) {
  //     console.info('could not set textarea-value');
  //   }
  // }
}