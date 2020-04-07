import { Component, OnInit, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource, MatPaginator, } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from "@angular/common/http";
import { RefCtxHendlerService } from '../services/referenceContext/reference-context-hendler.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import * as go from 'gojs';
import { MapsHandlerService } from '../services/maps-handler.service';

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



@Component({
  selector: 'app-node-menu-modal',
  templateUrl: './node-menu-modal.component.html',
  styleUrls: ['./node-menu-modal.component.css']
})
export class NodeMenuModalComponent implements OnInit {
  pageSizeOptions: number[] = [1, 10, 25, 100];

  // ##### refs variables #####
  allRefs: any;
  displayedColumnsRefs: string[] = ['select', 'Title', 'Publication', 'Link', 'CreationTime'];
  doShowAllRefs: boolean = false;
  btnShowAllRefs: string = "Show All >";

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

  shapeColor: string;
  borderColor: string;


  constructor(private mapHandler: MapsHandlerService, private modalService: ModalService, private formBuilder: FormBuilder, private refCtxService: RefCtxHendlerService) {

  }
  ngOnInit() {
    this.newRefForm = this.formBuilder.group({
      title: ['', Validators.required],
      authors: ['', Validators.required],
      publication: ['', Validators.required],
      description: ['', Validators.required],
      link: ['', Validators.required]
    });
    this.loadRefsFromDB();

    this.newCtxForm = this.formBuilder.group({
      title: ['', Validators.required]
    });
    this.loadCtxsFromDB();
  }


  tabClick(tabId) {
    console.log(tabId.index);

    switch (tabId.index) {
      case 1: {
        console.log("ref tab");
        this.loadNodeRefs();
        break;
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

  loadCtxsFromDB() {
    this.allCtxsList = []
    this, this.refCtxService.getAllContexts().then(res => {
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

  loadRefsFromDB() {
    this.allRefList = [];
    // this.allRefSource = null;
    this.refCtxService.getAllReferences().then(res => {
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
    if (this.doShowAllRefs) {
      this.btnShowAllRefs = "< Hide All"
    }
    else this.btnShowAllRefs = "Show All >"
  }

  showAllCtxs() {
    this.doShowAllCtxs = !this.doShowAllCtxs;
    if (this.doShowAllCtxs) {
      this.btnShowAllCtxs = "< Hide All"
    }
    else this.btnShowAllCtxs = "Show All >"
  }

  unloadNodeRefs() {
    this.nodeRefList = [];
    this.nodeRefSource = null;
  }

  unloadNodeCtxs() {
    this.nodeCtxsList = [];
    this.nodeCtxsSource = null;
  }

  loadNodeRefs() {
    this.modalService.currNodeData.refs.forEach(element => {
      this.nodeRefList.push(element);
    })
    this.nodeRefSource = new MatTableDataSource<ReferenceElement>(this.nodeRefList);
    this.nodeRefSource.paginator = this.nodeRefsPaginator
    console.log("node refs loaded");
  }

  loadNodeCtxs() {
    this.modalService.currNodeData.ctxs.forEach(element => {
      this.nodeCtxsList.push(element);
    })
    this.nodeCtxsSource = new MatTableDataSource<ContextElement>(this.nodeCtxsList);
    this.nodeCtxsSource.paginator = this.nodeCtxsPaginator
    console.log("node Ctxs loaded");
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
    this.unloadNodeRefs();
    this.loadNodeRefs();
    this.allRefSelection.clear()
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
    this.unloadNodeCtxs();
    this.loadNodeCtxs();
    this.allCtxsSelection.clear()
  }

  removeRefToNode() {
    this.nodeRefSelection.selected.forEach(element => {
      let idx = this.modalService.currNodeData.refs.indexOf(element)
      this.modalService.currNodeData.refs.splice(idx, 1);
    });
    this.unloadNodeRefs();
    this.loadNodeRefs();
    // this.masterToggle('node')
    this.nodeRefSelection.clear()
  }

  removeCtxsToNode() {
    this.nodeCtxsSelection.selected.forEach(element => {
      let idx = this.modalService.currNodeData.ctxs.indexOf(element)
      this.modalService.currNodeData.ctxs.splice(idx, 1);
    });
    this.unloadNodeCtxs();
    this.loadNodeCtxs();
    // this.masterToggle('node')
    this.nodeCtxsSelection.clear()
  }

  openNewRefModal(id: string) {
    this.loadNodeRefs()
    this.modalService.open(id);
  }

  openNewCtxModal(id: string) {
    this.loadNodeCtxs()
    this.modalService.open(id);
  }

  closeNewRefModal(id: string) {
    this.unloadNodeRefs();
    this.newRefForm.reset()
    this.modalService.close(id);
  }

  closeNewCtxModal(id: string) {
    this.unloadNodeCtxs();
    this.newCtxForm.reset()
    this.modalService.close(id);
  }

  addNewRef() {
    if (this.newRefForm.invalid) {
      return;
    }
    this.refCtxService.createNewRef(this.newRefForm.controls).then(res => {
      this.loadRefsFromDB()
      this.closeNewRefModal('newRefModal');
      alert(res)
    }).catch
      (err => {
        console.log("error new refs");
        console.log(err)
      });
  }

  addNewCtx() {
    console.log("add");

    if (this.newCtxForm.invalid) {
      return;
    }
    this.refCtxService.createNewCtx(this.newCtxForm.controls).then(res => {
      this.loadCtxsFromDB()
      this.closeNewCtxModal('newCtxModal');
      alert(res)
    }).catch
      (err => {
        console.log("error new Ctxs");
        console.log(err)
      });
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
        const numSelected = this.nodeRefSelection.selected.length;
        const numRows = this.nodeCtxsSource.data.length;
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

  applyFilterAllRefs(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allRefSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterNodeRefs(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nodeRefSource.filter = filterValue.trim().toLowerCase();
  }

  setNodeStyles() {
    console.log("styles");
    this.mapHandler.myDiagram.model.setDataProperty(node, "fill", this.shapeColor)

  }

}