import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource, PageEvent, } from '@angular/material';
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


  // Title: string;
  // Publication: string;
  // Link: string;
  // CreationTime: Date;
}

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }
// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
//   {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
//   {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
//   {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//   {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
//   {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
//   {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//   {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//   {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//   {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'}
// ];

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
  pageSize = 10;
  pageEvent: PageEvent;
  
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
      // this.selection = new SelectionModel<ReferenceElement>(true, []);
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
}
