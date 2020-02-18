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
  // myDiagram: any;
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

    var myDiagram = $(go.Diagram, "myDiagram",  // create a Diagram for the DIV HTML element
      {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,  // must be true to accept drops from the Palette
        allowLink: false,
        "draggingTool.dragsLink": true,
        "draggingTool.isGridSnapEnabled": false,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 10,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 10,
        "relinkingTool.fromHandleArchetype":
          $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(10, 10), fill: "tomato", stroke: "darkred" }),
        "relinkingTool.toHandleArchetype":
          $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(10, 10), fill: "darkred", stroke: "tomato" }),
        "linkReshapingTool.handleArchetype":
          $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        // rotatingTool: $(TopRotatingTool),  // defined below
        // "InitialLayoutCompleted": loadDiagramProperties,  // this DiagramEvent listener is defined below
        // "LinkDrawn": maybeChangeLinkCategory,     // these two DiagramEvents call a
        // "LinkRelinked": maybeChangeLinkCategory,
        // "undoManager.isEnabled": true,

        // "linkingTool.linkValidation": validLink2,  // defined below
        // "relinkingTool.linkValidation": validLink2,

        "toolManager.mouseWheelBehavior": go.ToolManager.WheelNone,
        "panningTool.isEnabled": false,
        //"isModelReadOnly": true
      });

    var nodeSelectionAdornmentTemplate =
      $(go.Adornment, "Auto",
        $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
        $(go.Placeholder)
      );

    var nodeResizeAdornmentTemplate =
      $(go.Adornment, "Spot",
        { locationSpot: go.Spot.Right },
        $(go.Placeholder),
        $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
      );

    function showSmallPorts(node, show) {
      node.ports.each(function (port) {
        if (port.portId !== "") {  // don't change the default port, which is the big shape
          port.fill = show ? "rgba(0,0,0,.3)" : null;
        }
      });
    }
    function setContributionValue(obj, val) {
      console.log(obj.part);
      var link = obj.part.adornedPart;

      console.log(link);

      setElementText(link, val);
    }

    function setElementText(obj, val) {
      obj.diagram.startTransaction("setElementText");
      console.log("obj: ");

      console.log(obj.diagram);
      console.log(val);

      myDiagram.model.setDataProperty(obj.data, "text", val);
      obj.diagram.commitTransaction("setContributionValue");
    }

    var contributionLinkMenu =
      $(go.Adornment, "Vertical",
        $("ContextMenuButton",
          $(go.TextBlock, "+", { margin: 3 }),
          { click: function (e, obj) { setContributionValue(obj, "+"); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "++", { margin: 3 }),
          { click: function (e, obj) { setContributionValue(obj, "++"); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "-", { margin: 3 }),
          { click: function (e, obj) { setContributionValue(obj, "-"); } }),
        $("ContextMenuButton",
          $(go.TextBlock, "--", { margin: 3 }),
          { click: function (e, obj) { setContributionValue(obj, "--"); } }),
        //  $("ContextMenuButton",
        //      $(go.TextBlock, "Properties", { margin: 3 }),
        //      { click: function (e, obj) { showModal(obj); } })
      );

    var qualityTemplate =
      $(go.Node, "Spot",

        {
          locationSpot: go.Spot.Center,
          locationObjectName: "PANEL",
          selectionObjectName: "PANEL",
          selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
          // contextMenu: nodeMenu
        },

        { locationSpot: go.Spot.Center },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
        { resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
        //{ rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
        new go.Binding("angle").makeTwoWay(),
        // the main object is a Panel that surrounds a TextBlock with a Shape
        $(go.Panel, "Auto",
          { name: "PANEL" },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          $(go.Shape, "Ellipse",  // default figure
            {
              portId: "", // the default port: if no spot on link data, use closest side
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              fill: "white", // default color
              name: "SHAPE"
            },
            new go.Binding("figure", "figure").makeTwoWay(),
            new go.Binding("fill", "fill").makeTwoWay(),
            new go.Binding("stroke", "stroke").makeTwoWay(),
            new go.Binding("strokeWidth", "strokeWidth").makeTwoWay()
          ),
          $(go.TextBlock,
            {
              font: "bold 10pt Helvetica, Arial, sans-serif",
              margin: 4,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              textAlign: "center",
              name: "TEXT",
              editable: true
            },
            new go.Binding("text", "text").makeTwoWay())
        ),
        // four small named ports, one on each side:
        /*
        makePort("T", go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, false),
        */
        { // handle mouse enter/leave events to show/hide the ports
          mouseEnter: function (e, node) { showSmallPorts(node, true); },
          mouseLeave: function (e, node) { showSmallPorts(node, false); }
        }
      );


    var taskTemplate =
      $(go.Node, "Spot",
        {
          locationSpot: go.Spot.Center,
          locationObjectName: "PANEL",
          selectionObjectName: "PANEL",
          selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
          // contextMenu: nodeMenu
        },

        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        { selectable: true },
        { resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
        //{ rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
        new go.Binding("angle").makeTwoWay(),
        // the main object is a Panel that surrounds a TextBlock with a Shape
        $(go.Panel, "Auto",
          { name: "PANEL" },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          $(go.Shape, "Rectangle",  // default figure
            {
              portId: "", // the default port: if no spot on link data, use closest side
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              fromLinkableSelfNode: false,
              toLinkableSelfNode: false,
              fill: "white",  // default color
              name: "SHAPE"
            },
            new go.Binding("figure", "figure").makeTwoWay(),
            new go.Binding("fill", "fill").makeTwoWay(),
            new go.Binding("stroke", "stroke").makeTwoWay(),
            new go.Binding("strokeWidth", "strokeWidth").makeTwoWay()
          ),
          $(go.TextBlock,
            {
              font: "bold 10pt Helvetica, Arial, sans-serif",
              margin: 8,
              //minSize: new go.Size(45, 25),
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true,
              textAlign: "center",
              name: "TEXT"
            },

            new go.Binding("text", "text").makeTwoWay())
        )


      );
    var achievedBylinkTemplate =
      $(go.Link,  // the whole link panel

        {
          routing: go.Link.Normal,
          curve: go.Link.None,
          //curviness: 'None',
          selectable: true,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
          // contextMenu: LinkMenu //linkMenu
        },

        new go.Binding("routing", "routing"),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        {
          selectable: true,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          toEndSegmentLength: 80,
          fromEndSegmentLength: 80
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 1 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "Standard", stroke: null }),
        $(go.Panel, "Auto",
          new go.Binding("visible", "true").ofObject(),
          $(go.Shape, "RoundedRectangle",  // the link shape
            { fill: "white", stroke: null }),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "9pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 1,
              minSize: new go.Size(10, NaN),
              editable: false,
            },
            new go.Binding("text").makeTwoWay())
        )
      );

    var associationLinkTmplate =
      $(go.Link,  // the whole link panel

        {
          routing: go.Link.Normal,
          curve: go.Link.None,
          //curviness: 'None',
          selectable: true,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
          // contextMenu: LinkMenu //linkMenu
        },

        new go.Binding("routing", "routing"),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        { selectable: true, relinkableFrom: true, relinkableTo: true, reshapable: true },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 1 })//,

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
          reshapable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
          // contextMenu: LinkMenu
        },
        new go.Binding("routing", "routing").makeTwoWay(),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 1 },
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
            { fill: "white", stroke: null }),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "9pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 1,
              minSize: new go.Size(10, NaN),
              editable: false,
            },
            new go.Binding("text").makeTwoWay())
        )
      );

    var extendByLinkTamplate =
      $(go.Link,  // the whole link panel

        {
          routing: go.Link.Normal,
          curve: go.Link.None,
          //curviness: 'None',
          selectable: true,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
          // contextMenu: LinkMenu //linkMenu
        },

        new go.Binding("routing", "routing"),
        new go.Binding("curve", "curve"),
        new go.Binding("curviness", "curviness"),
        { selectable: true, relinkableFrom: true, relinkableTo: true, reshapable: true },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 1 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "Standard", stroke: null }),
        $(go.Panel, "Auto",
          new go.Binding("visible", "true").ofObject(),
          $(go.Shape, "RoundedRectangle",  // the link shape
            { fill: "white", stroke: null }), //#F8F8F8
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "9pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 1,
              minSize: new go.Size(10, NaN),
              editable: false
            },
            new go.Binding("text").makeTwoWay())
        )
      );

    var contributionLinkTamplate =
      $(go.Link, // the whole link panel
        {
          routing: go.Link.Normal,
          curve: go.Link.Bezier,
          //adjusting: go.Link.None,
          adjusting: go.Link.Stretch,
          curviness: 60,
          selectable: true,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
          contextMenu: contributionLinkMenu
        },
        new go.Binding("category", "category").makeTwoWay().ofObject(),
        new go.Binding("routing", "routing").makeTwoWay().ofObject(),
        //new go.Binding("curve", "curve", function (v) { if (v) return v; else return go.Link.Bezier; }).makeTwoWay(go.Link.Bezier.stringify),
        new go.Binding("curve", "curve").makeTwoWay().ofObject(),
        new go.Binding("curviness", "curviness").makeTwoWay().ofObject(),
        //new go.Binding("fromNode", "fromNode"),
        new go.Binding("points", "points").makeTwoWay(),

        //new go.Binding("points", "points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          {
            isPanelMain: true,
            strokeWidth: 1,
            //isLayoutPositioned: false
          },
          new go.Binding("stroke", "color"),  // shape.stroke = data.color
          new go.Binding("strokeWidth", "strokeWidth")  // shape.strokeWidth = data.thick
        ),

        $(go.Shape,  // the arrowhead
          { toArrow: "Standard", stroke: null },
          new go.Binding("stroke", "color"),  // shape.stroke = data.color
          new go.Binding("strokeWidth", "thick")  // shape.strokeWidth = data.thick
        ),

        $(go.Panel, "Auto",
          {
            visible: true,
            name: "LABEL",
          },
          new go.Binding("visible", "visible").makeTwoWay(),
          $(go.Shape, "RoundedRectangle",  // the label shape
            { fill: "white", stroke: null }),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "9pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 1,
              minSize: new go.Size(10, NaN),
              editable: false,
            },
            new go.Binding("text", "text").makeTwoWay())
        )
      );

    var linkSelectionAdornmentTemplate =
      $(go.Adornment, "Link",
        $(go.Shape,
          { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })  // use selection object's strokeWidth
      );
    // adding node templates
    myDiagram.nodeTemplateMap.add("Quality", qualityTemplate);
    myDiagram.nodeTemplateMap.add("Task", taskTemplate);

    // adding links templates
    myDiagram.linkTemplateMap.add("Association", associationLinkTmplate);
    myDiagram.linkTemplateMap.add("ConsistsOf", consistOfLinkTamplate);
    myDiagram.linkTemplateMap.add("AchievedBy", achievedBylinkTemplate);
    myDiagram.linkTemplateMap.add("ExtendBy", extendByLinkTamplate);
    myDiagram.linkTemplateMap.add("Contribution", contributionLinkTamplate);



    myDiagram.model = go.Model.fromJson(this.currMap.Model);

    var myPalette =
      $(go.Palette, "myPalette",  // must name or refer to the DIV HTML element
        {
          layout: $(go.GridLayout,
            {
              alignment: go.GridLayout.Location,
              wrappingColumn: 1
            }),
          maxSelectionCount: 1,
          nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
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

            ),
          
        });

        myPalette.model = new go.GraphLinksModel([  // specify the contents of the Palette
          { category: "Task", text: "Task", fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description" },
          { category: "Quality", text: "Quality", fill: "#ffffff", stroke: "#000000", strokeWidth: 1, description: "Add a Description" },
        ], [
            // the Palette also has a disconnected Link, which the user can drag-and-drop
            { category: "AchievedBy", text: "achieved by", routing: go.Link.Normal, description: "Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
            { category: "ConsistsOf", text: "consists of", routing: go.Link.Normal, description: "Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
            { category: "ExtendedBy", text: "extended by", routing: go.Link.Normal, description: "Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
            { category: "Association", text: "association", toArrow: "", routing: go.Link.Normal, description: "Add a Description", points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
            { category: "Contribution", text: "contribution", description: "Add a Description", routing: go.Link.Normal, curve: go.Link.Bezier, curviness: 60, points: new go.List().addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
            //{ category: "Contribution", text: "contribution", points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
          ])

          var myOverview =
            $(go.Overview, "myOverview",
            { observed: myDiagram, maxScale: 0.5, contentAlignment: go.Spot.Center });
        // change color of viewport border in Overview
        // myOverview.box.elt(0).stroke = "dodgerblue";
  }//init
//   saveDiagramProperties() {
//     myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
// }


}
