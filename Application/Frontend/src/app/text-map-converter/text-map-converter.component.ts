import { Component, OnInit, SystemJsNgModuleLoader, SimpleChanges, Input, HostListener, OnChanges } from '@angular/core';
import { MapsHandlerService } from '../services/maps-handler.service';
import * as go from 'gojs';
@Component({
  selector: 'app-text-map-converter',
  templateUrl: './text-map-converter.component.html',
  styleUrls: ['./text-map-converter.component.css']
})




export class TextMapConverterComponent implements OnInit,OnChanges {
  @Input() doUpade: boolean;
  mapModel : any = null
  links: String[] = []
  numOfLinks = -1

  typesOflinks : any = null
  typesOfNodes : any = null
  typesOfNodes_model : any = null

  ngOnChanges(changes: SimpleChanges): void {
    
    if(this.mapModel != null){
      console.log("Mapmodel not null")
      this.links = []
      this.convertMapToText() 
    }
    else{
      console.log("NULL!")
    }
  }

  constructor(private mapHandler: MapsHandlerService) { }
  

  ngOnInit() {
    this.mapModel = this.mapHandler.myDiagram.model
    this.typesOflinks = this.mapHandler.myDiagram.linkTemplateMap.Eb
    this.typesOfNodes = this.mapHandler.myDiagram.nodeTemplateMap.Eb
    this.typesOfNodes_model = this.mapHandler.myDiagram.model.nodeDataArray
    // remove empty-link and comment-link elements from dict
    delete this.typesOflinks[""]
    delete this.typesOflinks["Comment"]

    // remove empty-node, Comment,LinkLabel elements from dict
    delete this.typesOfNodes[""]
    delete this.typesOfNodes["Comment"]
    delete this.typesOfNodes["LinkLabel"]


    // console.log(this.typesOflinks)
    this.convertMapToText()
    // this.numOfLinks = this.mapModel.linkDataArray.length
    // console.log(this.numOfLinks)

  }


  convertMapToText(){
    this.addLineToModel(true,true,true,true,true,true)
    console.log("--------------")
    var newNumLink = this.mapModel.linkDataArray.length

    if(newNumLink != this.numOfLinks){
      console.log(newNumLink)
      var nodesKeysDict = {};
      var translate = "";
      this.links = []
      
    for (let node of this.mapModel.nodeDataArray) {
      nodesKeysDict[node.key]= [node.text,node.category]
    }
    
    for (let link of this.mapModel.linkDataArray) {
      if(nodesKeysDict[link.from] != null && nodesKeysDict[link.to] != null ){
        console.log()
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
    }
    console.log(this.mapModel)
    // console.log(nodesKeysDict)
    // console.log("#############")
    // console.log(this.typesOfNodes)
    // console.log("#############")
    // console.log(this.typesOfNodes_model)
    }
  }

  addLineToModel(existFrom, typeFrom, nameFrom, typeName, existTo, nameTo ){
    console.log("add!")
    // checks & add if necessary From_Node
    if(existFrom != true){

      this.mapHandler.myDiagram.addNodeData({ key: "shit", color: "white" } )
    //   var $ = go.GraphObject.make;
    //   this.mapModel.add(
    //     $(go.Node, "Auto",
    //       $(go.Shape, "Task", { fill: "lightblue" }),
    //       $(go.TextBlock, "Hello!", { margin: 5 })
    //     ));
      
    }

  }

}

