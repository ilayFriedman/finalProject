import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule} from "@angular/material";
import { LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { GojsAngularModule } from 'gojs-angular';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { MapIndexComponent } from './map-index/map-index.component';
import { Router } from '@angular/router';
import {MapsHandlerService} from "./services/maps-handler.service";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapViewerComponent,
    MapIndexComponent
],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
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
