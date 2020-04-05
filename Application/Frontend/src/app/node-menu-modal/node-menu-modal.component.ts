import { Component, OnInit, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource, MatPaginator, } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from "@angular/common/http";
import { ReferenceHendlerService } from '../services/reference-hendler.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
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
  // [x: string]: any;
  allRefs: any;
  // currNodeData = {};

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

  newRefForm = new FormGroup({
    title: new FormControl(),
    authors: new FormControl(),
    publication: new FormControl(),
    description: new FormControl(),
    link: new FormControl()
  });
  constructor(private modalService: ModalService, private formBuilder: FormBuilder, private refService: ReferenceHendlerService) {

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

  loadRefsFromDB() {
    this.allRefList = [];
    // this.allRefSource = null;
    this.refService.getAllReferences().then(res => {
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
        this.allRefSource.paginator = this.allPaginator
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
    this.doShowAll = !this.doShowAll;
    if (this.doShowAll) {
      this.btnShowAll = "< Hide All"
    }
    else this.btnShowAll = "Show All >"
  }

  unloadNodeRefs() {
    this.nodeRefList = [];
    this.nodeRefSource = null;
  }

  loadNodeRefs() {
    this.modalService.currNodeData.refs.forEach(element => {
      this.nodeRefList.push(element);
    })
    this.nodeRefSource = new MatTableDataSource<ReferenceElement>(this.nodeRefList);
    this.nodeRefSource.paginator = this.nodePaginator
    console.log("node refs loaded");
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
      let idx = this.modalService.currNodeData.refs.indexOf(element)
      this.modalService.currNodeData.refs.splice(idx, 1);
    });
    this.unloadNodeRefs();
    this.loadNodeRefs();
    // this.masterToggle('node')
    this.nodeRefSelection.clear()

  }

  openNewRefModal(id: string) {
    this.loadNodeRefs()
    this.modalService.open(id);
  }

  closeNewRefModal(id: string) {
    this.unloadNodeRefs();
    this.newRefForm.reset()
    this.modalService.close(id);
  }

  addNewRef() {
    if (this.newRefForm.invalid) {
      return;
    }

    this.refService.createNewRef(this.newRefForm.controls).then(res => {
      this.loadRefsFromDB()
      this.closeNewRefModal('newRefModal');
      alert(res)
    }).catch
      (err => {
        console.log("error new refs");
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

      default: {
        console.log("default");

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

      default: {
        console.log("default");

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

}