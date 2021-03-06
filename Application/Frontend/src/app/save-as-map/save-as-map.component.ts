import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';
import { ModalService } from '../services/modal.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-save-as-map',
  templateUrl: './save-as-map.component.html',
  styleUrls: ['./save-as-map.component.css']
})
export class SaveAsMapComponent implements OnInit {
  saveMapForm = new FormGroup({
    mapName: new FormControl(),
    description: new FormControl(),
    savedFolder: new FormControl()
  });
  localUrl = environment.backendUrl;
  submitted = false
  @Output("successSaved") successSaved: EventEmitter<any> = new EventEmitter();


  // save: any;
  constructor(private modalService: ModalService, private formBuilder: FormBuilder, private http: HttpClient, public mapHandler: MapsHandlerService) {
    // let save = document.getElementById("saveButton");
    // save.addEventListener("click", (e:Event) => this.onSubmit());
  }

  ngOnInit() {
    this.saveMapForm = this.formBuilder.group({
      mapName: ['', Validators.required],
      description: ['', Validators.required],
      savedFolder: ['', Validators.required]
    });
  }

  get f() {
    return this.saveMapForm.controls;
  }

  onSubmit(id: string) {
    this.submitted = true;
    // stop here if form is invalid
    if (this.saveMapForm.invalid) {
      console.log("map invalid");

      return;
    }
    // this.mapHandler.myDiagram.model.class = 'go.GraphLinksModel';
    console.log(this.saveMapForm.controls);
    this.modalService.close(id);

    let data = {
      'MapName': this.saveMapForm.controls.mapName.value,
      // 'Model': this.mapHandler.myDiagram.model.toJson(),
      'Model': this.mapHandler.myDiagram.model,
      'Description': this.saveMapForm.controls.description.value,
      'folderID': this.saveMapForm.controls.savedFolder.value
    }
    this.saveMapForm.reset()
    let result = this.http.post(this.localUrl + '/private/createMap', data, {
      headers: { 'token': sessionStorage.token }, responseType: 'text'
    });

    result.subscribe(response => {
      this.submitted = false;
      this.mapHandler.currMap_mapViewer.inUse = true;
      // alert("Map Added Succsessfully!")
      this.successSaved.emit();

    }, error => {
      this.submitted = false;
      console.log(error.error)
      alert(error.error)
    }
    );

  }
}
