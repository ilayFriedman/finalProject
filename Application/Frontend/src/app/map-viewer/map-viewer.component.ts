import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { MapsHandlerService } from "../services/maps-handler.service";
import { AppModule } from '../app.module';
import * as go from 'gojs';

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.css']
})
export class MapViewerComponent implements OnInit {
  // @Input('name') mapIdx: any;
  mapModel: any;
  currIdx: any;
  currMap: any;
  myDiagram: any;
  constructor(private router: ActivatedRoute, private mapHandler: MapsHandlerService) { }

  ngOnInit() {
    this.router.params.subscribe(params => {
      this.currIdx = params['id'];
    });
    this.currMap = this.mapHandler.myMaps[this.currIdx]
    console.log(this.currIdx);
    console.log("curr map: " + this.currMap.MapName);
    this.init()
  }

  init() {
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    this.myDiagram = $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
      {
        "undoManager.isEnabled": true  // enable undo & redo
      });

    // define a simple Node template
    // this.myDiagram.nodeTemplate =
    //   $(go.Node, "Auto",  // the Shape will go around the TextBlock
    //     $(go.Shape, "RoundedRectangle", { strokeWidth: 2, fill: "white" },
    //       // Shape.fill is bound to Node.data.color
    //       new go.Binding("fill", "color")),
    //     $(go.TextBlock,
    //       { margin: 8, font: "bold 14px sans-serif", stroke: '#333' }, // Specify a margin to add some room around the text
    //       // TextBlock.text is bound to Node.data.key
    //       new go.Binding("text", "text"))
    //   );

    var qualityTemplate =
      $(go.Node, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, "Ellipse", { strokeWidth: 2, fill: "white" },
            new go.Binding("fill", "color")),
          $(go.TextBlock,
            new go.Binding("text", "text"))
        )
      );

    var taskTemplate =
      $(go.Node, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, "RoundedRectangle", { strokeWidth: 2, fill: "white" },
            new go.Binding("fill", "color")),
          $(go.TextBlock,
            new go.Binding("text", "text"))
        )
      );

    var achievedBylinkTemplate =
      $(go.Link,
        {
          name: "LINK",
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5, toShortLength: 4,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          adjusting: go.Link.Stretch,
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "standard", name: "LINE", stroke: "black", fill: "gray" }, new go.Binding("value", "value").makeTwoWay()),
        $(go.Panel, "Auto",  // the link label, normally not visible
          { visible: true, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
          new go.Binding("visible", "visible").makeTwoWay(),
          $(go.Shape, "RoundedRectangle",  // the label shape
            { fill: "#F8F8F8", stroke: null }),
          $(go.TextBlock, "Achieved By",  // the label
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#333333",
              editable: false,
              name: "lineText"
            },
            new go.Binding("text", "text").makeTwoWay())
        )
      );

    var associationLinkTmplate =
      $(go.Link,  // the whole link panel
        new go.Binding("routing", "routing"),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        { selectable: true, relinkableFrom: true, relinkableTo: true, reshapable: true },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 2 }),
        $(go.Panel, "Auto",
          new go.Binding("visible", "true").ofObject(),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 2,
              minSize: new go.Size(10, NaN),
              editable: false,
            },
            new go.Binding("text").makeTwoWay())
        )
      );

    var consistOfLinkTamplate =
      $(go.Link,  // the whole link panel
        {
          routing: go.Link.Normal,
          curve: go.Link.None,
          //curviness: 'None',
          selectable: true,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true
          // contextMenu: linkMenu
        },
        new go.Binding("routing", "routing").makeTwoWay(),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 2 },
          new go.Binding("stroke", "color"),  // shape.stroke = data.color
          new go.Binding("strokeWidth", "strokeWidth")  // shape.strokeWidth = data.thick
        ),
        $(go.Shape,  // the arrowhead
          { toArrow: "Standard", stroke: null },
          new go.Binding("stroke", "arrowheadColor"),  // shape.stroke = data.color
          new go.Binding("strokeWidth", "arrowheadStrokeWidth")  // shape.strokeWidth = data.thick
        ),
        $(go.Panel, "Auto",
          new go.Binding("visible", "true").ofObject(),
          $(go.Shape, "RoundedRectangle",  // the link shape
            { fill: "#F8F8F8", stroke: null }),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 2,
              minSize: new go.Size(10, NaN),
              editable: false,
            },
            new go.Binding("text").makeTwoWay())
        )
      );

    var extendByLinkTamplate =
      $(go.Link,  // the whole link panel
        new go.Binding("routing", "routing"),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        { selectable: true, relinkableFrom: true, relinkableTo: true, reshapable: true },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 2 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "Standard", stroke: null }),
        $(go.Panel, "Auto",
          new go.Binding("visible", "true").ofObject(),
          $(go.Shape, "RoundedRectangle",  // the link shape
            { fill: "#F8F8F8", stroke: null }),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 2,
              minSize: new go.Size(10, NaN),
              editable: false,
            },
            new go.Binding("text").makeTwoWay())
        )
      );



    var templmap = new go.Map(); // In TypeScript you could write: new go.Map<string, go.Node>();
    // for each of the node categories, specify which template to use
    templmap.add("Quality", qualityTemplate);
    templmap.add("Task", taskTemplate);
    // templmap.add("detailed", detailtemplate);
    this.myDiagram.nodeTemplateMap = templmap;
    var templmapLinks = new go.Map();
    templmapLinks.add("Association", associationLinkTmplate);
    templmapLinks.add("ConsistsOf", consistOfLinkTamplate);
    templmapLinks.add("AchievedBy", achievedBylinkTemplate);
    this.myDiagram.linkTemplateMap = templmapLinks;


    this.myDiagram.model = go.Model.fromJson(this.currMap.Model)
    // this.myDiagram.model = new go.GraphLinksModel(this.currMap.Model.nodeDataArray,this.currMap.Model.linkDataArray);
  }

}
