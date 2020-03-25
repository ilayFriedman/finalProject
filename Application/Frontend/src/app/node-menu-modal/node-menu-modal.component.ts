import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource, MatPaginator, } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from "@angular/common/http";

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
  allRefs: any;
  localUrl = 'http://localhost:3000';
  displayedColumns: string[] = ['select', 'Title', 'Publication', 'Link', 'CreationTime'];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  doShowAll: boolean = false;
  btnShowAll: string = "Show All >";

  allRefList: ReferenceElement[] = [];
  nodeRefList: ReferenceElement[] = [];

  allRefSource: MatTableDataSource<ReferenceElement>;
  nodeRefSource: MatTableDataSource<ReferenceElement>;

  allRefSelection = new SelectionModel<ReferenceElement>(true, []);
  nodeRefSelection = new SelectionModel<ReferenceElement>(true, []);

  @ViewChild(MatPaginator, { static: true }) allPaginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) nodePaginator: MatPaginator;

  constructor(private modalService: ModalService, private http: HttpClient) {

  }

  ngOnInit() {
    this.http.get(this.localUrl + '/private/getAllReferences', {
      headers: { 'token': sessionStorage.token }
    }).toPromise().then(res => {
      this.allRefs = res;
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
      // this.nodeRefSource = new MatTableDataSource<ReferenceElement>(this.modalService.currNodeData.refs);
      this.allRefSource.paginator = this.allPaginator;
    }).catch
      (err => {
        console.log("error refs");
        console.log(err)
      })

    this.modalService.runLoadRefs(this.loadNodeRefs.bind(this));
    this.modalService.runUnloadRefs(this.unloadNodeRefs.bind(this));

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
    console.log("load refs");

    this.modalService.currNodeData.refs.forEach(element => {
      this.nodeRefList.push(element);
    })
    this.nodeRefSource = new MatTableDataSource<ReferenceElement>(this.nodeRefList);
    this.nodeRefSource.paginator = this.nodePaginator;
  }

  addRefToNode() {
    console.log(this.allRefSelection.selected[0]);
    this.allRefSelection.selected.forEach(element => {
      if (this.modalService.currNodeData.refs.indexOf(element) == -1){
        this.modalService.currNodeData.refs.push(element)
      }
      else{
        alert("This reference already referened to this node")
      }
    });
    console.log("new refs: ");
    console.log(this.modalService.currNodeData.refs);
    this.unloadNodeRefs();
    this.loadNodeRefs();
    // this.masterToggle('all')
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
}
