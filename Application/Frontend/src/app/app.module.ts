import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule, MatMenuModule} from "@angular/material";
import { LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { GojsAngularModule } from 'gojs-angular';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { MapIndexComponent } from './map-index/map-index.component';
import { Router } from '@angular/router';
import {MapsHandlerService} from "./services/maps-handler.service";
import { TextMapConverterComponent } from './text-map-converter/text-map-converter.component';
import { SaveAsMapComponent } from './save-as-map/save-as-map.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapViewerComponent,
    MapIndexComponent,
    TextMapConverterComponent,
    SaveAsMapComponent
],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    FormsModule,
    GojsAngularModule
  ],
  providers: [
    MapsHandlerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
