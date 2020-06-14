import { Component, OnInit, ViewChildren, ViewChild, QueryList, Output, EventEmitter, Input } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { NodeMenuHendlerService } from '../services/nodeMenu/node-menu-hendler.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import * as go from 'gojs';
import { MapsHandlerService } from '../services/maps-handler.service';
import { v4 as uuid } from 'uuid';
import { Router } from '@angular/router';

export interface ReferenceElement {
  _id: string,
  Title: string,
  CreatorId: string,
  CreationTime: string,
  Authors: string,
  Publication: string,
  Description: string,
  Link: string
}

export interface ContextElement {
  _id: string,
  Title: string,
  CreatorId: string,
  CreationTime: string
}

export interface CommentElement {
  id: string,
  Content: string,
  CreatorId: string,
  CreatorName: string,
  CreationTime: string,
  LastModificationTime: string,
  Likes: number
}

export interface ConnectionElement {
  mapID: string,
  MapName: string,
  nodeId: string,
  nodetext: string,
  nodeKey: string
}



@Component({
  selector: 'app-node-menu-modal',
  templateUrl: './node-menu-modal.component.html',
  styleUrls: ['./node-menu-modal.component.css']
})
export class NodeMenuModalComponent implements OnInit {
  @Output("reInit") reInitMapViewer: EventEmitter<any> = new EventEmitter();
  @Output("canDeactivate") canDeactivate: EventEmitter<any> = new EventEmitter();
  @Input() tabNum: number;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  // ##### refs variables #####
  allRefs: any;
  displayedColumnsRefs: string[] = ['select', 'Title', 'Publication', 'Link', 'CreationTime'];
  doShowAllRefs: boolean = false;

  allRefList: ReferenceElement[] = [];
  nodeRefList: ReferenceElement[] = [];

  allRefSource: MatTableDataSource<ReferenceElement>;
  nodeRefSource: MatTableDataSource<ReferenceElement>;

  allRefSelection = new SelectionModel<ReferenceElement>(true, []);
  nodeRefSelection = new SelectionModel<ReferenceElement>(true, []);

  @ViewChild("nodeRefsPaginator", { static: true }) nodeRefsPaginator: MatPaginator;
  @ViewChild("allRefsPaginator", { static: true }) allRefsPaginator: MatPaginator;

  newRefForm = new FormGroup({
    title: new FormControl(),
    authors: new FormControl(),
    publication: new FormControl(),
    description: new FormControl(),
    link: new FormControl()
  });

  // ##### ctxs variables #####
  allCtxs: any;
  displayedColumnsCtxs: string[] = ['select', 'Title', 'CreationTime'];
  doShowAllCtxs: boolean = false;
  btnShowAllCtxs: string = "Show All >";

  allCtxsList: ContextElement[] = [];
  nodeCtxsList: ContextElement[] = [];
  allCtxsSource: MatTableDataSource<ContextElement>;
  nodeCtxsSource: MatTableDataSource<ContextElement>;

  allCtxsSelection = new SelectionModel<ContextElement>(true, []);
  nodeCtxsSelection = new SelectionModel<ContextElement>(true, []);

  @ViewChild("allCtxsPaginator", { static: true }) allCtxsPaginator: MatPaginator;
  @ViewChild("nodeCtxsPaginator", { static: true }) nodeCtxsPaginator: MatPaginator;

  newCtxForm = new FormGroup({
    title: new FormControl(),
  });

  // #### node styles ####
  shapeColor: string;
  borderColor: string;
  borderThickness: string = "1px";

  // #### Comments ####
  nodeComments: CommentElement[] = []
  nodeCommentsSource: MatTableDataSource<CommentElement>;
  displayedColumnsComments: string[] = ['action', 'Content', 'CreatorName', 'LastModificationTime', 'Likes'];
  newCommentForm = new FormGroup({
    content: new FormControl(),
  });

  editCommentForm = new FormGroup({
    content: new FormControl(),
  });
  editCommentButton: boolean = false;
  @ViewChild("commentsPaginator", { static: true }) commentsPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) commentsSort: MatSort;

  // #### Conncetions ####
  nodeToSearch: string = "";
  // containingMapsList: any[] = [];
  connectedMapsList: ConnectionElement[] = [];
  // mapsSelectedOptions: any;
  connectedMapsSelected: any;
  // selectedMapsOptions: SelectionModel<MatListOption>
  nodeConnectionSource: MatTableDataSource<ConnectionElement>;
  displayedColumnsConnections: string[] = ['action', 'mapName', 'nodeName'];
  @ViewChild("connectedPaginator", { static: true }) connectedPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) connectionsSort: MatSort;

  containingMapsList: MatTableDataSource<ConnectionElement>;
  displayedColumnsConnectionsSearchResults: string[] = ['select', 'mapName'];
  mapsSelectedOptions = new SelectionModel<ConnectionElement>(true, []);
  @ViewChild("addConnectionPaginator", { static: true }) addConnectionPaginator: MatPaginator;




  constructor(public mapHandler: MapsHandlerService, public router: Router, public modalService: ModalService, private formBuilder: FormBuilder, private NodeMenuHendler: NodeMenuHendlerService) {

  }
  ngOnInit() {
    this.newRefForm = this.formBuilder.group({
      title: ['', Validators.required],
      authors: [' '],
      publication: [' '],
      description: [' '],
      link: [' ']
    });
    this.loadRefsFromDB();

    this.newCtxForm = this.formBuilder.group({
      title: ['', Validators.required]
    });
    this.loadCtxsFromDB();

    this.newCommentForm = this.formBuilder.group({
      content: ['', Validators.required]
    });


  }

  tabClick(tabId) {
    switch (tabId.index) {
      case 1: {
        this.unloadNodeRefs();
        this.loadNodeRefs();
        break;
      }
      case 2: {
        this.unloadNodeCtxs();
        this.loadNodeCtxs();
        break;
      }
      case 4: {
        this.unloadNodeComments();
        this.loadNodeComments();
        break;
      }
      case 5: {
        this.unloadConnections();
        this.loadConnections();
      }

      // case constant_expression2: { 
      //    //statements; 
      //    break; 
      // } 
      default: {
        console.log("default");

        break;
      }
    }
  }


  // ######## REFERENCES #########

  loadRefsFromDB() {
    this.allRefList = [];
    // this.allRefSource = null;
    this.NodeMenuHendler.getAllReferences().then(res => {
      this.allRefs = res;
      if (this.allRefs.length > 0) {
        this.allRefs.forEach(element => {
          var tmp: ReferenceElement = {
            _id: element._id,
            Title: element.Title,
            CreatorId: element.CreatorId,
            CreationTime: new Date(element.CreationTime).toLocaleDateString(),
            Authors: element.Authors,
            Publication: element.Publication,
            Description: element.Description,
            Link: element.Link
          }

          this.allRefList.push(tmp);

        });
        this.allRefSource = new MatTableDataSource<ReferenceElement>(this.allRefList);
        this.allRefSource.paginator = this.allRefsPaginator
      } else {
        console.log("no refs in DB");

      }
    }).catch
      (err => {
        console.log("error refs");
        console.log(err)
      })

  }

  showAllRefs() {
    this.doShowAllRefs = !this.doShowAllRefs;
    // if (this.doShowAllRefs) {
    //   this.btnShowAllRefs = "< Hide All"
    // }
    // else this.btnShowAllRefs = "Show All >"
  }

  unloadNodeRefs() {
    this.nodeRefList = [];
    this.nodeRefSource = null;
    // this.tabNum = 0;
  }

  loadNodeRefs() {
    this.modalService.currNodeData.refs.forEach(element => {
      this.nodeRefList.push(element);
    })
    this.nodeRefSource = new MatTableDataSource<ReferenceElement>(this.nodeRefList);
    this.nodeRefSource.paginator = this.nodeRefsPaginator
    // console.log("node refs loaded");
  }

  addRefToNode() {
    this.allRefSelection.selected.forEach(element => {
      if (this.modalService.currNodeData.refs.indexOf(element) == -1) {
        this.modalService.currNodeData.refs.push(element)
      }
      else {
        alert("This reference already referened to this node")
      }
    });
    this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
    this.unloadNodeRefs();
    this.loadNodeRefs();
    this.allRefSelection.clear()
  }

  removeRefToNode() {
    this.nodeRefSelection.selected.forEach(element => {
      let idx = this.modalService.currNodeData.refs.indexOf(element)
      this.modalService.currNodeData.refs.splice(idx, 1);
    });
    this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
    this.unloadNodeRefs();
    this.loadNodeRefs();
    // this.masterToggle('node')
    this.nodeRefSelection.clear()
  }

  openNewRefModal(id: string) {
    // this.loadNodeRefs()
    this.modalService.open(id);
  }

  closeNewRefModal(id: string) {
    // this.unloadNodeRefs();
    this.newRefForm.reset()
    this.modalService.close(id);
  }

  addNewRef() {
    if (this.newRefForm.invalid) {

      return;
    }
    console.log(this.newRefForm.controls);

    this.NodeMenuHendler.createNewRef(this.newRefForm.controls).then(res => {
      this.loadRefsFromDB()
      this.closeNewRefModal('newRefModal');
      alert(res)
    }).catch
      (err => {
        console.log("error new refs");
        console.log(err)
      });
  }

  applyFilterAllRefs(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allRefSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterNodeRefs(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nodeRefSource.filter = filterValue.trim().toLowerCase();
  }

  // ######## CONTEXTS #########
  loadCtxsFromDB() {
    this.allCtxsList = []
    this, this.NodeMenuHendler.getAllContexts().then(res => {
      console.log(res);

      this.allCtxs = res;
      if (this.allCtxs.length > 0) {
        this.allCtxs.forEach(element => {
          var tmp: ContextElement = {
            _id: element._id,
            Title: element.Title,
            CreatorId: element.CreatorId,
            CreationTime: new Date(element.CreationTime).toLocaleDateString()
          }

          this.allCtxsList.push(tmp);

        });
        this.allCtxsSource = new MatTableDataSource<ContextElement>(this.allCtxsList);
        this.allCtxsSource.paginator = this.allCtxsPaginator
      } else {
        console.log("no ctxs in DB");

      }
    }).catch
      (err => {
        console.log("error ctxs");
        console.log(err)
      })
  }


  unloadNodeCtxs() {
    this.nodeCtxsList = [];
    this.nodeCtxsSource = null;
    // this.tabNum = 0;
  }
  loadNodeCtxs() {
    this.modalService.currNodeData.ctxs.forEach(element => {
      this.nodeCtxsList.push(element);
    })
    this.nodeCtxsSource = new MatTableDataSource<ContextElement>(this.nodeCtxsList);
    this.nodeCtxsSource.paginator = this.nodeCtxsPaginator
    // console.log("node Ctxs loaded");
  }
  addCtxsToNode() {
    this.allCtxsSelection.selected.forEach(element => {
      if (this.modalService.currNodeData.ctxs.indexOf(element) == -1) {
        this.modalService.currNodeData.ctxs.push(element)
      }
      else {
        alert("This context already exist in this node")
      }
    });
    this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
    this.unloadNodeCtxs();
    this.loadNodeCtxs();
    this.allCtxsSelection.clear()
  }

  removeCtxsToNode() {
    this.nodeCtxsSelection.selected.forEach(element => {
      let idx = this.modalService.currNodeData.ctxs.indexOf(element)
      this.modalService.currNodeData.ctxs.splice(idx, 1);
    });
    this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
    this.unloadNodeCtxs();
    this.loadNodeCtxs();
    // this.masterToggle('node')
    this.nodeCtxsSelection.clear()
  }

  openNewCtxModal(id: string) {
    // this.loadNodeCtxs()
    this.modalService.open(id);
  }

  closeNewCtxModal(id: string) {
    // this.unloadNodeCtxs();
    this.newCtxForm.reset()
    this.modalService.close(id);
  }

  addNewCtx() {
    console.log("add");

    if (this.newCtxForm.invalid) {
      return;
    }
    this.NodeMenuHendler.createNewCtx(this.newCtxForm.controls).then(res => {
      this.loadCtxsFromDB()
      this.closeNewCtxModal('newCtxModal');
      alert(res)
    }).catch
      (err => {
        console.log("error new Ctxs");
        console.log(err)
      });
  }

  applyFilterAllCtxs(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allCtxsSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterNodeCtxs(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nodeCtxsSource.filter = filterValue.trim().toLowerCase();
  }


  // ######## COMMENTS #########
  loadNodeComments() {
    this.modalService.currNodeData.comment.forEach(element => {
      this.nodeComments.push(element);
    })
    this.nodeCommentsSource = new MatTableDataSource<CommentElement>(this.nodeComments);
    this.nodeCommentsSource.paginator = this.commentsPaginator
    this.nodeCommentsSource.sort = this.commentsSort

    console.log(this.nodeCommentsSource);
  }

  unloadNodeComments() {
    this.nodeComments = [];
    this.nodeCommentsSource = null;
  }

  addNewComment() {
    if (this.newCommentForm.invalid) {
      return;
    }
    let newComment: CommentElement = {
      'id': uuid(),
      'Content': this.newCommentForm.controls.content.value,
      'CreatorId': sessionStorage.userId,
      'CreatorName': sessionStorage.userFullName,
      'CreationTime': new Date().toLocaleString(),
      'LastModificationTime': new Date().toLocaleString(),
      'Likes': 0
    }

    let data = {
      mapId: this.mapHandler.currMap_mapViewer._id,
      nodeId: this.modalService.currNodeData.id,
      comment: newComment
    }

    this.NodeMenuHendler.createNewComment(data).then(res => {
      this.modalService.currNodeData.comment.push(newComment)
      this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
      this.unloadNodeComments()
      this.loadNodeComments()
      this.closeNewCommentModal('newCommentModal')
      console.log(res);
    }).catch
      (err => {
        console.log("error new comment");
        console.log(err)
      });
    // element.comment
  }

  addLikeToComment(element) {

    let data = {
      mapId: this.mapHandler.currMap_mapViewer._id,
      nodeId: this.modalService.currNodeData.id,
      commentId: element.id
    }
    this.NodeMenuHendler.addLikeToComment(data).then(res => {
      element.Likes++;
      this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model);
      this.unloadNodeComments()
      this.loadNodeComments();
      // console.log("add like");
      // console.log(res)
    }).catch
      (err => {
        console.log("error add like");
        console.log(err)
      })
    console.log(element);


  }


  editComment(element) {
    console.log(element);
    let data = {
      mapId: this.mapHandler.currMap_mapViewer._id,
      nodeId: this.modalService.currNodeData.id,
      commentId: element.id,
      newContent: element.Content
    }

    this.NodeMenuHendler.updateComment(data).then(res => {
    }).catch
      (err => {
        console.log("error new comment");
        console.log(err)
      });
  }

  deleteComment(element) {
    console.log(element);
    let data = {
      mapId: this.mapHandler.currMap_mapViewer._id,
      nodeId: this.modalService.currNodeData.id,
      commentId: element.id
    }

    this.NodeMenuHendler.deleteComment(data).then(res => {
      let idx = this.modalService.currNodeData.comment.indexOf(element.id)
      this.modalService.currNodeData.comment.splice(idx, 1);
      this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
      this.unloadNodeComments()
      this.loadNodeComments();
    }).catch
      (err => {
        console.log("error new comment");
        console.log(err)
      });
  }



  closeNewCommentModal(id: string) {
    // this.unloadNodeComments();
    this.newCommentForm.reset()
    this.modalService.close(id);
  }

  closeEditCommentModal(id: string) {
    // this.unloadNodeComments();
    this.editCommentForm.reset()
    this.modalService.close(id);
  }

  applyFilterAComments(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nodeCommentsSource.filter = filterValue.trim().toLowerCase();
  }

  isMyComment(element) {
    return element.CreatorId == sessionStorage.userId
  }

  // ######## STYLES #########
  setNodeStyles() {
    console.log(this.borderThickness);
    // this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.shapeColor)
    this.mapHandler.myDiagram.model.nodeDataArray.forEach(node => {
      if (node.key == this.modalService.currNodeData.key) {
        console.log(node);

        this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.shapeColor)
        this.mapHandler.myDiagram.model.setDataProperty(node, "stroke", this.borderColor)
        this.mapHandler.myDiagram.model.setDataProperty(node, "strokeWidth", parseInt(this.borderThickness))

      }
    });
  }

  // ######## CONNECTIONS  #########

  searchNodes() {
    console.log(this.nodeToSearch);
    let tmpContainingList = []
    if (this.nodeToSearch == '') {
      return;
    }
    this.mapHandler.searchNodes(this.nodeToSearch).then(res => {
      console.log(res);

      let mapResults: any = res;
      if (mapResults) {
        mapResults.forEach(map => {
          if (map.MapName != this.mapHandler.currMap_mapViewer.MapName)
            tmpContainingList.push(map)
        })
        this.containingMapsList = new MatTableDataSource<ConnectionElement>(tmpContainingList);
        this.containingMapsList.paginator = this.addConnectionPaginator;

      }
    }).catch
      (err => {
        console.log("error searching node");
        console.log(err)
      });
    console.log(this.containingMapsList);

  }

  addConnectionToNoda() {
    console.log(this.mapsSelectedOptions);
    this.mapsSelectedOptions.selected.forEach(element => {
      this.connectedMapsList.push(element)
    });
    console.log(this.connectedMapsList);

  }

  moveToConnectedMap(map) {
    this.mapHandler.getMap(map.mapID).then(res => {
      this.unloadConnections();
      this.nodeToSearch = ""
      this.modalService.closeMenu('nodeMenuModal')
      this.reInitMapViewer.emit(res);
    }).catch
      (err => {
        console.log("error with getMap for go to connected map");
        console.log(err)
      })
  }

  unloadConnections() {
    this.containingMapsList = new MatTableDataSource<ConnectionElement>();
    this.connectedMapsList = [];
    this.mapsSelectedOptions.clear()
  }

  loadConnections() {
    if (this.modalService.currNodeData.connections) {
      this.modalService.currNodeData.connections.forEach(element => {
        if (this.connectedMapsList.findIndex(conn => conn.mapID === element.mapID) < 0)
          this.connectedMapsList.push(element);
      })
      this.nodeConnectionSource = new MatTableDataSource<ConnectionElement>(this.connectedMapsList);
      this.nodeConnectionSource.paginator = this.connectedPaginator
      this.nodeConnectionSource.sort = this.connectionsSort
    }
  }

  addNewConnection() {
    let newConnections = [];
    if (this.mapsSelectedOptions) {
      this.mapsSelectedOptions.selected.forEach(element => {
        if (element.mapID != this.mapHandler.currMap_mapViewer._id)
          newConnections.push(element);
      });
    }

    if (newConnections.length == 0) {

      return;
    }
    let data = {
      mapId: this.mapHandler.currMap_mapViewer._id,
      nodeId: this.modalService.currNodeData.id,
      connections: newConnections
    }
    console.log(data);
    this.NodeMenuHendler.createNewConnection(data).then(res => {
      this.mapsSelectedOptions.selected.forEach(element => {
        if (element.mapID != this.mapHandler.currMap_mapViewer._id)
          this.modalService.currNodeData.connections.push(element)
      });
      this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
      console.log(res);
      this.connectedMapsList = [];
      this.loadConnections()
    }).catch
      (err => {
        console.log("error new connection");
        console.log(err)
      });



  }

  deleteConnection(element) {
    console.log(element);
    let data = {
      mapId: this.mapHandler.currMap_mapViewer._id,
      nodeId: this.modalService.currNodeData.id,
      MapName: element.MapName
    }

    this.NodeMenuHendler.deleteConnection(data).then(res => {
      let idx = this.modalService.currNodeData.connections.indexOf(element)

      this.modalService.currNodeData.connections.splice(idx, 1);
      this.mapHandler.myDiagram.model = go.Model.fromJson(this.mapHandler.myDiagram.model.toJson());
      this.connectedMapsList = [];
      this.loadConnections()
    }).catch
      (err => {
        console.log("error delete connection");
        console.log(err)
      });
  }

  applyFilterAConnections(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nodeConnectionSource.filter = filterValue.trim().toLowerCase();
  }

  clearSearches() {
    this.mapsSelectedOptions.clear();
    this.containingMapsList = null;
    this.nodeToSearch = '';

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(type: string) {
    switch (type) {
      case "allRefs": {
        const numSelected = this.allRefSelection.selected.length;
        const numRows = this.allRefSource.data.length;
        return numSelected === numRows;
      }
      case "nodeRefs": {
        const numSelected = this.nodeRefSelection.selected.length;
        const numRows = this.nodeRefSource.data.length;
        return numSelected === numRows;
      }
      case "allCtxs": {
        const numSelected = this.allCtxsSelection.selected.length;
        const numRows = this.allCtxsSource.data.length;
        return numSelected === numRows;
      }
      case "nodeCtxs": {
        const numSelected = this.nodeCtxsSelection.selected.length;
        const numRows = this.nodeCtxsSource.data.length;
        return numSelected === numRows;
      }
      case "addConnection": {
        const numSelected = this.mapsSelectedOptions.selected.length;
        const numRows = this.containingMapsList.data.length;
        return numSelected === numRows;
      }


      default: {
        console.log("default is all");

        break;
      }
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(type: string) {
    switch (type) {
      case "allRefs": {
        this.isAllSelected("allRefs") ?
          this.allRefSelection.clear() :
          this.allRefSource.data.forEach(row => this.allRefSelection.select(row));
        break;
      }
      case "nodeRefs": {
        this.isAllSelected("nodeRefs") ?
          this.nodeRefSelection.clear() :
          this.nodeRefSource.data.forEach(row => this.nodeRefSelection.select(row));
        break;
      }
      case "allCtxs": {
        this.isAllSelected("allCtxs") ?
          this.allCtxsSelection.clear() :
          this.allCtxsSource.data.forEach(row => this.allCtxsSelection.select(row));
        break;
      }
      case "nodeCtxs": {
        this.isAllSelected("nodeCtxs") ?
          this.nodeCtxsSelection.clear() :
          this.nodeCtxsSource.data.forEach(row => this.nodeCtxsSelection.select(row));
        break;
      }
      case "addConnection": {
        this.isAllSelected("addConnection") ?
          this.mapsSelectedOptions.clear() :
          this.containingMapsList.data.forEach(row => this.mapsSelectedOptions.select(row));
        break;
      }

      default: {
        console.log("default master");

        break;
      }
    }


  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }






}