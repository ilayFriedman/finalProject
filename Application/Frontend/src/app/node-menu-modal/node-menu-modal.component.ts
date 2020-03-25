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
  refList: ReferenceElement[] = [];
  displayedColumns: string[] = ['select', 'Title', 'Publication', 'Link', 'CreationTime'];
  dataSource: MatTableDataSource<ReferenceElement>;
  selection = new SelectionModel<ReferenceElement>(true, []);
  pageSizeOptions: number[] = [1, 10, 25, 100];
  @ViewChild (MatPaginator, {static: true}) paginator: MatPaginator;

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

        this.refList.push(tmp);

      });
      this.dataSource = new MatTableDataSource<ReferenceElement>(this.refList);
      this.dataSource.paginator = this.paginator;
    }).catch
      (err => {
        console.log("error refs");
        console.log(err)
      })

  }

 
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
}
