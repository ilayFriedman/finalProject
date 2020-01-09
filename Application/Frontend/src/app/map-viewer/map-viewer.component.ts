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
        
        "undoManager.isEnabled": true,
        initialContentAlignment: go.Spot.Center,  // enable undo & redo
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

  //   var qualityTemplate =
  //   $(go.Node, "Spot",

  //   {
  //       locationSpot: go.Spot.Center,
  //       locationObjectName: "PANEL",
  //       selectionObjectName: "PANEL",
  //       selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
  //       contextMenu: nodeMenu
  //   },

  //   { locationSpot: go.Spot.Center },
  //   new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
  //   { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
  //   { resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
  //   //{ rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
  //   new go.Binding("angle").makeTwoWay(),
  //   // the main object is a Panel that surrounds a TextBlock with a Shape
  //   $(go.Panel, "Auto",
  //     { name: "PANEL" },
  //     new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
  //     $(go.Shape, "Ellipse",  // default figure
  //       {
  //           portId: "", // the default port: if no spot on link data, use closest side
  //           fromLinkable: true, toLinkable: true, cursor: "pointer",
  //           fill: "white"  // default color
  //       },
  //       new go.Binding("figure", "figure").makeTwoWay(),
  //       new go.Binding("fill", "fill").makeTwoWay(),
  //       new go.Binding("stroke", "stroke").makeTwoWay(),
  //       new go.Binding("strokeWidth", "strokeWidth").makeTwoWay()
  //       ),
  //     $(go.TextBlock,
  //       {
  //           font: "bold 10pt Helvetica, Arial, sans-serif",
  //           margin: 4,
  //           maxSize: new go.Size(160, NaN),
  //           wrap: go.TextBlock.WrapFit,
  //           textAlign: "center",
  //           name: "TEXT",
  //           editable: true
  //       },
  //       new go.Binding("text", "text").makeTwoWay())
  //   ),
  //   // four small named ports, one on each side:
  //   /*
  //   makePort("T", go.Spot.Top, false, true),
  //   makePort("L", go.Spot.Left, true, true),
  //   makePort("R", go.Spot.Right, true, true),
  //   makePort("B", go.Spot.Bottom, true, false),
  //   */
  //   { // handle mouse enter/leave events to show/hide the ports
  //       mouseEnter: function (e, node) { showSmallPorts(node, true); },
  //       mouseLeave: function (e, node) { showSmallPorts(node, false); }
  //   }
  // ));

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
  
    var myPalette =
          $(go.Palette, "myPalette",  // must name or refer to the DIV HTML element
            {
                layout: $(go.GridLayout,
                    {
                        alignment: go.GridLayout.Location,
                        wrappingColumn: 1
                    }),
                maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
                linkTemplate: // simplify the link template, just in this Palette
                  $(go.Link,
                    {
                        locationSpot: go.Spot.Center,
                        selectionAdornmentTemplate:
                          $(go.Adornment, "Link",
                            { locationSpot: go.Spot.Center },
                            $(go.Shape,
                              {
                                  isPanelMain: true,
                                  fill: null,
                                  stroke: "deepskyblue",
                                  strokeWidth: 0
                              }),
                            $(go.Shape,  // the arrowhead
                              { toArrow: "Standard", stroke: null })
                          )
                    },
                    new go.Binding("routing", "routing"),
                    new go.Binding("curve", "curve"),
                    new go.Binding("curviness", "curviness"),
                    new go.Binding("adjusting", "adjusting"),
                    {
                        corner: 5,
                        //toShortLength: 4
                    },
                    new go.Binding("points"),
                    $(go.Shape,  // the link path shape
                      { isPanelMain: true, strokeWidth: 1 }),
                    $(go.Shape,  // the arrowhead
                      { toArrow: "Standard", stroke: null },
                      new go.Binding("toArrow", "toArrow")),
                      $(go.TextBlock,
                        new go.Binding("text", "text"))
                    //  $(go.Panel, "Auto",
                    //    $(go.Shape, "RoundedRectangle",
                    //    { fill: "#f2f2f2", stroke: null }),
                    //      $(go.TextBlock,
                    //{
                    //    margin: 0
                    //},
                    //          new go.Binding("text", "text")))
                  ),
                model: new go.GraphLinksModel([  // specify the contents of the Palette
                  { category: "Task", text: "Task", fill: "#ffffff", stroke: "#000000", strokeWidth: 1,description:"Add a Description" },
                  { category: "Quality", text: "Quality", fill: "#ffffff", stroke: "#000000", strokeWidth: 1,description:"Add a Description" },
                ], [
                  // the Palette also has a disconnected Link, which the user can drag-and-drop
                  { category: "AchievedBy", text: "achieved by", routing: go.Link.Normal,description:"Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
                  { category: "ConsistsOf", text: "consists of", routing: go.Link.Normal,description:"Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
                  { category: "ExtendedBy", text: "extended by", routing: go.Link.Normal,description:"Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
                  { category: "Association", text: "association", toArrow: "", routing: go.Link.Normal,description:"Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
                  { category: "Contribution", text: "contribution",description:"Add a Description", routing: go.Link.Normal, curve: go.Link.Bezier, curviness: 60, points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
                  //{ category: "Contribution", text: "contribution", points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
                ])
            });
}

}
