import { Component, OnInit, SystemJsNgModuleLoader, SimpleChanges, Input, HostListener, OnChanges } from '@angular/core';
import { MapsHandlerService } from '../services/maps-handler.service';
import { v4 as uuid } from 'uuid';
@Component({
  selector: 'app-text-map-converter',
  templateUrl: './text-map-converter.component.html',
  styleUrls: ['./text-map-converter.component.css']
})


export class TextMapConverterComponent implements OnInit, OnChanges {
  @Input() doUpade: boolean;
  mapModel: any = null
  links: String[] = []
  numOfLinks = -1

  typesOflinks: any = []
  typesOfNodes: any = []
  typesOfNodes_model: any = []

  nodeSelected_From: any = "Choose Node"
  linkSelected: any = "Choose Link Type"
  nodeSelected_To: any = "Choose Node"

  name_From: String = ""
  name_To: String = ""

  fromColoredKey = null
  toColoredKey = null
  chooseNodeColor = "yellow"
  resetNodeColor = "white";

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mapModel != null) {
      this.convertMapToText()
    }
  }

  constructor(private mapHandler: MapsHandlerService) { }


  ngOnInit() {
    this.mapModel = this.mapHandler.myDiagram.model
    console.log(this.mapHandler.myDiagram.linkTemplateMap)
    console.log(this.mapHandler.myDiagram.linkTemplateMap.Fb)
    console.log(Object.keys(this.mapHandler.myDiagram.linkTemplateMap.Fb))
    // this.mapHandler.myDiagram.linkTemplateMap.Fb.forEach(element => {
    //   console.log(element);
    //   this.typesOflinks.push(element)
    // });
    // this.typesOfNodes = this.mapHandler.myDiagram.nodeTemplateMap.Fb
    this.typesOfNodes_model = this.mapHandler.myDiagram.model.nodeDataArray
    this.convertMapToText()

  
    // remove empty-link and comment-link elements from dict
    // this.typesOflinks = this.typesOflinks.filter(obj=> obj != "Comment")
    // this.typesOflinks = this.typesOflinks.filter(obj=> obj != "")

    // remove empty-node, Comment,LinkLabel elements from dict
    // console.log( this.typesOfNodes)
    // this.typesOfNodes = this.typesOfNodes.filter(obj=> obj != "")
    // this.typesOfNodes = this.typesOfNodes.filter(obj=> obj != "Comment")
    // this.typesOfNodes = this.typesOfNodes.filter(obj=> obj != "LinkLabel")
  }


  convertMapToText() {
    var newNumLink = this.mapModel.linkDataArray.length
    if (newNumLink != this.numOfLinks) {
      var nodesKeysDict = {};
      var translate = "";
      this.links = []

      for (let node of this.mapModel.nodeDataArray) {
        nodesKeysDict[node.key] = [node.text, node.category]
      }

      for (let link of this.mapModel.linkDataArray) {
        if (nodesKeysDict[link.from] != null && nodesKeysDict[link.to] != null) {
          translate += nodesKeysDict[link.from][1] + " " + nodesKeysDict[link.from][0].bold() + " is ";
          switch (link.category) {
            case "Association": {
              translate += "associated with " + nodesKeysDict[link.to][1] + " " + nodesKeysDict[link.to][0].bold();
              break;
            }
            case "AchievedBy": {
              translate += "achieved by " + nodesKeysDict[link.to][1] + " " + nodesKeysDict[link.to][0].bold();
              break;
            }
            case "extendBy": {
              translate += "extend by " + nodesKeysDict[link.to][1] + " " + nodesKeysDict[link.to][0].bold();
              break;
            }
            case "ConsistsOf": {
              translate += "consists of " + nodesKeysDict[link.to][1] + " " + nodesKeysDict[link.to][0].bold();
              break;
            }
            case "Contribution": {
              translate += "contributs to " + nodesKeysDict[link.to][1] + " " + nodesKeysDict[link.to][0].bold();
              break;
            }
            default: {
              translate += link.category + " " + nodesKeysDict[link.to][1] + " " + nodesKeysDict[link.to][0].bold();
              break;
            }
          }
          this.links.push(translate)
          translate = ""
        }
      }
      // console.log(this.mapModel)
    }
  }

  submitAction() {
    var self = this
    var keyToInsert = this.mapModel.nodeDataArray.length + 1
    // CASE "FROM" IS NEW
    if (!!this.nodeSelected_From.category == false) {

      // CASE "TO" IS NEW
      if (!!this.nodeSelected_To.category == false) {
        // console.log("createNewLInk!!")
        this.mapHandler.myDiagram.commit(function (d) {

          // create new Node-From
          // console.log(self.nodeSelected_From.key)
          var nodeFrom = {
            category: self.nodeSelected_From.key, text: self.name_From, id: uuid(), fill: "#ffffff",
            stroke: "#000000", strokeWidth: 1, description: "Add a Description", key: (-1 * keyToInsert), refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addNodeData(nodeFrom);
          keyToInsert++

          // create new Node-From
          var nodeTo = {
            category: self.nodeSelected_To.key, text: self.name_To, id: uuid(), fill: "#ffffff",
            stroke: "#000000", strokeWidth: 1, description: "Add a Description", key: (-1 * keyToInsert), refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addNodeData(nodeTo);

          // create link
          var link = {
            category: self.linkSelected.key, text: self.linkSelected.key, id: uuid(), from: nodeFrom.key,
            to: nodeTo.key, refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addLinkData(link);
          // console.log(d.model.linkDataArray)
        }, "createNewLinkFromTextToGragh");
      }

      // CASE "TO" IS EXIST
      else {
        // console.log("'to' is exist , but 'from' is new!!")
        this.mapHandler.myDiagram.commit(function (d) {
          // create new Node-From
          // console.log(self.nodeSelected_From.key)
          var nodeFrom = {
            category: self.nodeSelected_From.key, text: self.name_From, id: uuid(), fill: "#ffffff",
            stroke: "#000000", strokeWidth: 1, description: "Add a Description", key: (-1 * keyToInsert), refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addNodeData(nodeFrom);


          // create new Node-From
          var nodeTo = self.nodeSelected_To

          // create link
          var link = {
            category: self.linkSelected.key, text: self.linkSelected.key, id: uuid(),
            from: nodeFrom.key, to: nodeTo.key, refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addLinkData(link);
          // console.log(d.model.linkDataArray)
        }, "fromNew_ToOld");
      }
    }

    // CASE "FROM" IS EXIST
    else {
      // CASE "TO" IS NEW
      if (!!this.nodeSelected_To.category == false) {
        // console.log("'from' is exist but 'to' is new!!!")
        this.mapHandler.myDiagram.commit(function (d) {
          // create new Node-From
          // console.log(self.nodeSelected_From.key)
          var nodeFrom = self.nodeSelected_From

          // create new Node-From
          var nodeTo = {
            category: self.nodeSelected_To.key, text: self.name_To, id: uuid(), fill: "#ffffff",
            stroke: "#000000", strokeWidth: 1, description: "Add a Description", key: (-1 * keyToInsert), refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addNodeData(nodeTo);

          // create link
          var link = {
            category: self.linkSelected.key, text: self.linkSelected.key, id: uuid(),
            from: nodeFrom.key, to: nodeTo.key, refs: [], ctxs: [], comment: [], connections: []
          }
          d.model.addLinkData(link);
          // console.log(d.model.linkDataArray)
        }, "fromOld_ToNew");
      }

      // CASE "TO" IS EXIST
      else {
        // console.log("set exsisting link!!!")
        // console.log(this.nodeSelected_From)
        // console.log(this.nodeSelected_To)
        // console.log(this.linkSelected)
        // console.log(this.mapModel.linkDataArray)
        var modelLinks = this.mapHandler.myDiagram.model.linkDataArray
        var existLink = false
        modelLinks.forEach(link => {
          if (link.category != this.linkSelected.key && link.from == this.nodeSelected_From.key && link.to == this.nodeSelected_To.key) {
            existLink = true
          }
        });

        if (existLink) { // checks if selected link diffrent from the one that in the model
          if (!confirm("These nodes are connected with diffrent link already.\nAre you sure you want to update the link?")) {
            return
          }
        }
        // console.log("ok!")
        this.mapHandler.myDiagram.commit(function (d) {
          var nodeFrom = self.nodeSelected_From
          var nodeTo = self.nodeSelected_To
          var newLinkToInesrt = { category: self.linkSelected.key, text: self.linkSelected.key, id: uuid(), from: nodeFrom.key, to: nodeTo.key, connections: [] }
          // console.log(modelLinks)
          modelLinks.forEach(link => {
            if (link.from == nodeFrom.key && link.to == nodeTo.key) {
              d.model.removeLinkData(link)
            }
          });
          d.model.addLinkData(newLinkToInesrt);
        }, "fromOld_ToOld");

      }
    }
    //resets all after adding new Link
    this.name_From = ""
    this.name_To = ""
    this.nodeSelected_From = "Choose Node"
    this.linkSelected = "Choose Link Type"
    this.nodeSelected_To = "Choose Node"

    this.mapHandler.myDiagram.model.nodeDataArray.forEach(node => {
      if (node.key == this.fromColoredKey || node.key == this.toColoredKey) {
        this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.resetNodeColor)
      }
    });

    this.fromColoredKey = null
    this.toColoredKey = null

    // retranslate 
    this.convertMapToText()
  }

  ngIfCheck(check) {
    return ((!check.category) && !(typeof (check) == "string"))
  }

  submitValidationCheck() {
    var ans = this.nodeSelected_From != "Choose Node" && this.linkSelected != "Choose Link Type" && this.nodeSelected_To != "Choose Node"
    if (this.ngIfCheck(this.nodeSelected_From))
      ans = ans && this.name_From != ""
    if (this.ngIfCheck(this.nodeSelected_To))
      ans = ans && this.name_To != ""

    return ans
  }

  colorChangerWhenPick(event, sender) {
    if (event.category) {
      if (sender == "from" && event.key != this.fromColoredKey) {
        this.mapHandler.myDiagram.model.nodeDataArray.forEach(node => {
          if (node.key == this.fromColoredKey && node.key != this.toColoredKey) {
            this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.resetNodeColor)
          }
        });
        this.mapHandler.myDiagram.model.setDataProperty(event, "fill", this.chooseNodeColor)
        this.fromColoredKey = event.key
      }
      if (sender == "to" && event.key != this.toColoredKey) { // sender == "to"
        this.mapHandler.myDiagram.model.nodeDataArray.forEach(node => {
          if (node.key == this.toColoredKey && node.key != this.fromColoredKey) {
            this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.resetNodeColor)
          }
        });
        this.mapHandler.myDiagram.model.setDataProperty(event, "fill", this.chooseNodeColor)
        this.toColoredKey = event.key
      }
    }
    else {
      if (sender == "from") {
        this.mapHandler.myDiagram.model.nodeDataArray.forEach(node => {
          if (node.key == this.fromColoredKey && node.key != this.toColoredKey) {
            this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.resetNodeColor)
          }
        });
      }
      if (sender == "to") { // sender == "to"
        this.mapHandler.myDiagram.model.nodeDataArray.forEach(node => {
          if (node.key == this.toColoredKey && node.key != this.fromColoredKey) {
            this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.resetNodeColor)
          }
        });
      }
    }
  }

}

