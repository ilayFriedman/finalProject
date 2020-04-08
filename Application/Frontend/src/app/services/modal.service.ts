import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: any[] = [];
  currNodeData: any = {};

  // basic use
  open(id: string) {
    // open modal specified by id

    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.open();
  }

  close(id: string) {
    // close modal specified by id
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.close();
  }


  // inside component use (dont need to implement)
  add(modal: any) {
    // add modal to array of active modals
    this.modals.push(modal);
  }

  remove(id: string) {
    // remove modal from array of active modals
    this.modals = this.modals.filter(x => x.id !== id);
  }


  // functionality for mapMenu (in map-viwewer component)
  openMenu(id: String, currNode) {
    this.currNodeData = currNode
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.open();
  }

  closeMenu(id: string) {
    this.currNodeData = {};
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.close();
  }

}
