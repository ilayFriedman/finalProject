import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputsModule } from '@progress/kendo-angular-inputs';

import { RegisterComponent } from '../register/register.component';
import { OpenPageComponent } from './open-page.component'




@NgModule({
  declarations: [
    RegisterComponent,
    OpenPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputsModule
  ],
  exports:[
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OpenPageModule { }
