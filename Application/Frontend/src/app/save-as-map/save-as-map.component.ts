import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MapsHandlerService } from '../services/maps-handler.service';

@Component({
  selector: 'app-save-as-map',
  templateUrl: './save-as-map.component.html',
  styleUrls: ['./save-as-map.component.css']
})
export class SaveAsMapComponent implements OnInit {
  saveMapForm = new FormGroup({
    mapName: new FormControl(),
    description: new FormControl()
  });
  localUrl = 'http://localhost:3000';
  submitted = false
  // save: any;
  constructor(private formBuilder: FormBuilder, private http: HttpClient, private mapHandler: MapsHandlerService) {
    // let save = document.getElementById("saveButton");
    // save.addEventListener("click", (e:Event) => this.onSubmit());
   }

  ngOnInit() {
    this.saveMapForm = this.formBuilder.group({
      mapName: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  get f() {
    return this.saveMapForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.saveMapForm.invalid) {
      return;
    }
    // this.mapHandler.myDiagram.model.class = 'go.GraphLinksModel';
    let data = {
      'MapName': this.saveMapForm.controls.mapName.value,
      'Model': this.mapHandler.myDiagram.model.toJson(),
      'Description': this.saveMapForm.controls.description.value
    }
    let result = this.http.post(this.localUrl + '/private/createMap', data, {
      headers: { 'token': sessionStorage.token }
    });

    result.subscribe(response => {
      this.submitted = false;
      console.log("GOOD")
      // alert("Map Saved Successfully")

    }, error => {
      this.submitted = false;
      console.log("SDSSDSD")
      console.log(error.error)
      // alert(error.error)
    }
    );

  }
}
