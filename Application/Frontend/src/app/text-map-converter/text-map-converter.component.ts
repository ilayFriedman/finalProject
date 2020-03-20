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

  nodeSelected_From :any = "Choose Node"
  linkSelected : any = "Choose Link Type"
  nodeSelected_To : any = "Choose Node"

  name_From: String = ""
  name_To: String = ""

  ngOnChanges(changes: SimpleChanges): void {
    
    if(this.mapModel != null){
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
    console.log("-----converter---------")
    var newNumLink = this.mapModel.linkDataArray.length

    if(newNumLink != this.numOfLinks){
      // console.log(newNumLink)
      var nodesKeysDict = {};
      var translate = "";
      this.links = []
      
    for (let node of this.mapModel.nodeDataArray) {
      nodesKeysDict[node.key]= [node.text,node.category]
    }
    
    for (let link of this.mapModel.linkDataArray) {
      if(nodesKeysDict[link.from] != null && nodesKeysDict[link.to] != null ){
        // console.log()
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

  submitAction(){
    var self = this
    var keyToInsert = this.mapModel.nodeDataArray.length + 1
    // CASE FROM IS NEW
    if(!!this.nodeSelected_From.category == false){
      
      // CASE TO IS NEW
      if(!!this.nodeSelected_To.category == false){
        console.log("createNewLInk!!")
        this.mapHandler.myDiagram.commit(function(d) {
          
          // create new Node-From
          console.log(self.nodeSelected_From.key)
          var nodeFrom = {category: self.nodeSelected_From.key, text: self.name_From, fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description",key: (-1 * keyToInsert)}
          d.model.addNodeData(nodeFrom);
          keyToInsert++
          
          // create new Node-From
          var nodeTo = {category: self.nodeSelected_To.key, text: self.name_To, fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description",key: (-1 * keyToInsert)}
          d.model.addNodeData(nodeTo);

          // create link
          var link = {category: self.linkSelected.key, text: self.linkSelected.key ,from: nodeFrom.key, to: nodeTo.key } 
          d.model.addLinkData(link);
          console.log(d.model.linkDataArray)
        }, "createNewLinkFromTextToGragh");
      }

      // CASE TO IS EXIST
      else{
        console.log("'to' is exist , but 'from' is new!!")
        this.mapHandler.myDiagram.commit(function(d) {
          // create new Node-From
          console.log(self.nodeSelected_From.key)
          var nodeFrom = {category: self.nodeSelected_From.key, text: self.name_From, fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description",key: (-1 * keyToInsert)}
          d.model.addNodeData(nodeFrom);
          
          // create new Node-From
          var nodeTo = self.nodeSelected_To

          // create link
          var link = {category: self.linkSelected.key, text: self.linkSelected.key ,from: nodeFrom.key, to: nodeTo.key } 
          d.model.addLinkData(link);
          console.log(d.model.linkDataArray)
        }, "fromNew_ToOld");
      }
    }

    // CASE FROM IS EXIST
    else{
            // CASE TO IS NEW
            if(!!this.nodeSelected_To.category == false){
              console.log("'from' is exist but 'to' is new!!!")
              this.mapHandler.myDiagram.commit(function(d) {
                // create new Node-From
                console.log(self.nodeSelected_From.key)
                var nodeFrom = self.nodeSelected_From
                
                // create new Node-From
                var nodeTo = {category: self.nodeSelected_To.key, text: self.name_To, fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description",key: (-1 * keyToInsert)}
                d.model.addNodeData(nodeTo);
      
                // create link
                var link = {category: self.linkSelected.key, text: self.linkSelected.key ,from: nodeFrom.key, to: nodeTo.key } 
                d.model.addLinkData(link);
                console.log(d.model.linkDataArray)
              }, "fromOld_ToNew");
            }
      
            // CASE TO IS EXIST
            else{
              console.log("set exsisting link!!!")
              
            }
    }
    // console.log("add now!")
    // // checks! key is string or num, type is valid
    // this.mapHandler.myDiagram.commit(function(d) {
    //   // create new Node-From
    //   var nodeFrom = {category: typeFrom, text: nameFrom, fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description",key: keyFrom}
    //   d.model.addNodeData(nodeFrom);
      
    //   // create new Node-From
    //   var nodeTo = {category: typeTo, text: nameTo, fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description",key: keyTo}
    //   d.model.addNodeData(nodeTo);

    //   var link = { category: linktType, text: linkName ,from: nodeFrom.key, to: nodeTo.key } 
    //   d.model.addLinkData(link);
    //   console.log(d.model.linkDataArray)
    // }, "createNewLinkFromTextToGragh");
  }


  
  // submitAction(){
    // var typeFrom: any
    // var nameFrom: any
    // var keyFrom: any
    // var linktType: any
    // var linkName: any
    // var typeTo: any
    // var nameTo: any
    // var keyTo: any

    // //checks if nodeSelected_From is exist
    // if(!!this.nodeSelected_From.category == true){  // return true if in the model already :: exist!
    //   console.log("im node that already exist!")
    //   typeFrom = this.nodeSelected_From.category
    //   nameFrom = this.nodeSelected_From.text
    //   keyFrom = this.nodeSelected_From.key
    // }
    // else{
    //   console.log("im new node")
    // }
    // // create link selected
    //  linktType = this.linkSelected.key
    //  linkName = this.linkSelected.key

    //  //checks if nodeSelected_To is exist
    //  if(!!this.nodeSelected_To.category == true){  // return true if in the model already :: exist!
    //   console.log("im node that already exist!")
    //   typeTo = this.nodeSelected_To.category
    //   nameTo = this.nodeSelected_To.text
    //   keyTo = this.nodeSelected_To.key
    // }
    // else{
    //   console.log("im new node")
    // }

    // console.log(this.linkSelected)
    // // console.log(this.nodeSelected_From)
    // // console.log()


    // if(this.typesOfNodes_model.some(e => e.key == '-1')) {
    //   console.log('Exists');
    // }
    //create the link
    // this.creteLinkInModel(typeFrom,nameFrom,keyFrom,linktType,linkName,typeTo,nameTo,keyTo)
  // }

  ngIfCheck(check){
    return ((!check.category) && !(typeof(check) == "string"))
  }
}

