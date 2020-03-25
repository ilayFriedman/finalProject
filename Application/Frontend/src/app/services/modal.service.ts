import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: any[] = [];
  currNodeData: any;
  currNodeText: any;
  currNodeDescription: any;
  loadNodeRefs: () => void;
  unloadNodeRefs: () => void;

  runLoadRefs(fn: () => void) {
    this.loadNodeRefs = fn;
    // from now on, call myFunc wherever you want inside this service
  }
  runUnloadRefs(fn: () => void) {
    this.unloadNodeRefs = fn;
    // from now on, call myFunc wherever you want inside this service
  }

  add(modal: any) {
    // add modal to array of active modals
    this.modals.push(modal);
  }

  remove(id: string) {
    // remove modal from array of active modals
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string) {
    // open modal specified by id
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.open();
  }

  openMenu(id: String) {
    console.log("open menu");    
    console.log(this.currNodeData);
    this.currNodeText = this.currNodeData.text;
    this.currNodeDescription = this.currNodeData.description
    this.loadNodeRefs()
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.open();
  }

  closeMenu(id: string) {
    this.unloadNodeRefs();
    this.currNodeData = null;
    this.currNodeText = null;
    this.currNodeDescription = null;
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.close();
  }

  saveChangesInNode() {
    this.currNodeData.text = this.currNodeText
    console.log(this.currNodeData.text);

  }

  close(id: string) {
    // close modal specified by id
    let modal: any = this.modals.filter(x => x.id === id)[0];
    modal.close();
  }

}
