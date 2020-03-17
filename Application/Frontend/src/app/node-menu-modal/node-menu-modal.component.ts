import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-node-menu-modal',
  templateUrl: './node-menu-modal.component.html',
  styleUrls: ['./node-menu-modal.component.css']
})
export class NodeMenuModalComponent implements OnInit {


  constructor(private modalService: ModalService) { }

  ngOnInit() {
  }
  
  saveChanges(){
    this.modalService.saveChangesInNode()
  }

}
