import { Component, OnInit, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource, MatPaginator, } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from "@angular/common/http";
import { ReferenceHendlerService } from '../services/reference-hendler.service';
import { FormGroup, FormControl } from '@angular/forms';
import * as go from 'gojs';

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


@Component({
  selector: 'app-node-menu-modal',
  templateUrl: './node-menu-modal.component.html',
  styleUrls: ['./node-menu-modal.component.css']
})
export class NodeMenuModalComponent implements OnInit {
  // [x: string]: any;
  allRefs: any;

  displayedColumns: string[] = ['select', 'Title', 'Publication', 'Link', 'CreationTime'];
  pageSizeOptions: number[] = [1, 10, 25, 100];
  doShowAll: boolean = false;
  btnShowAll: string = "Show All >";

  allRefList: ReferenceElement[] = [];
  nodeRefList: ReferenceElement[] = [];

  allRefSource: MatTableDataSource<ReferenceElement>;
  nodeRefSource: MatTableDataSource<ReferenceElement>;

  allRefSelection = new SelectionModel<ReferenceElement>(true, []);
  nodeRefSelection = new SelectionModel<ReferenceElement>(true, []);

  @ViewChild("nodePaginator", { static: true }) nodePaginator: MatPaginator;
  @ViewChild("allPaginator", { static: true }) allPaginator: MatPaginator;
  // @ViewChildren(MatPaginator) Paginator = new QueryList<MatPaginator>();


  constructor(private modalService: ModalService, private refService: ReferenceHendlerService) {

  }
  ngOnInit() { }

  ngAfterViewInit() {
    this.loadRefsFromDB();
    this.modalService.runLoadNodeRefs(this.loadNodeRefs.bind(this));
    this.modalService.runUnloadNodeRefs(this.unloadNodeRefs.bind(this));
    this.modalService.runLoadRefsFromDB(this.loadRefsFromDB.bind(this));

  }

  loadRefsFromDB() {
    this.allRefList = [];
    // this.allRefSource = null;
    this.refService.getAllReferences().then(res => {
      this.allRefs = res;
      if (this.allRefs.length > 0) {
        console.log("all refs: ");
        console.log(this.allRefs);

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
        this.allRefSource.paginator = this.allPaginator
      } else {
        console.log("no refs");

      }
    }).catch
      (err => {
        console.log("error refs");
        console.log(err)
      })

  }

  showAllRefs() {
    this.doShowAll = !this.doShowAll;
    if (this.doShowAll) {
      this.btnShowAll = "< Hide All"
    }
    else this.btnShowAll = "Show All >"
  }

  unloadNodeRefs() {
    console.log("unload");

    this.nodeRefList = [];
    this.nodeRefSource = null;
  }

  loadNodeRefs() {
    this.modalService.currNodeData.refs.forEach(element => {
      this.nodeRefList.push(element);
    })
    this.nodeRefSource = new MatTableDataSource<ReferenceElement>(this.nodeRefList);
    this.nodeRefSource.paginator = this.nodePaginator
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

  removeRefToNode() {
    this.nodeRefSelection.selected.forEach(element => {
      console.log(element);
      // let match = this.modalService.currNodeData.refs.filter(ref => ref._id == element._id);
      // console.log("match");
      // console.log(match);
      let idx = this.modalService.currNodeData.refs.indexOf(element)
      console.log("idx");
      console.log(idx);

      this.modalService.currNodeData.refs.splice(idx, 1);
    });
    console.log("new refs: ");
    console.log(this.modalService.currNodeData.refs);
    this.unloadNodeRefs();
    this.loadNodeRefs();
    // this.masterToggle('node')
    this.nodeRefSelection.clear()

  }

  createNewReference() {
    console.log("unchecked");

  }

  openNewRefModal(id: string) {
    console.log(id);
    this.modalService.open(id);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(type: string) {
    if (type == "all") {
      const numSelected = this.allRefSelection.selected.length;
      const numRows = this.allRefSource.data.length;
      return numSelected === numRows;
    }
    else if (type == "node") {
      const numSelected = this.nodeRefSelection.selected.length;
      const numRows = this.nodeRefSource.data.length;
      return numSelected === numRows;
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(type: string) {
    if (type == "all") {
      this.isAllSelected("all") ?
        this.allRefSelection.clear() :
        this.allRefSource.data.forEach(row => this.allRefSelection.select(row));
    }
    else if (type == "node") {
      this.isAllSelected("node") ?
        this.nodeRefSelection.clear() :
        this.nodeRefSource.data.forEach(row => this.nodeRefSelection.select(row));
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

}
