import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule, MatMenuModule,
  MatTabsModule, MatTableModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatExpansionModule, MatSortModule,
} from "@angular/material";
import { MatPaginatorModule } from '@angular/material/paginator';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { GojsAngularModule } from 'gojs-angular';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { Router } from '@angular/router';
import { MapsHandlerService } from "./services/maps-handler.service";
import { TextMapConverterComponent } from './text-map-converter/text-map-converter.component';
import { SaveAsMapComponent } from './save-as-map/save-as-map.component';
import { RegisterComponent } from './register/register.component';
import { ModalComponent } from './modal/modal.component';
import { ModalService } from './services/modal.service';
import { ChangeUserInfoComponent } from './change-user-info/change-user-info.component';
import { NodeMenuModalComponent } from './node-menu-modal/node-menu-modal.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { MapsfoldersViewerComponent } from './mapsfolders-viewer/mapsfolders-viewer.component';
import { LogedHomeComponent } from './loged-home/loged-home.component';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { GroupsComponent } from './groups/groups.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { OpenPageComponent } from './open-page/open-page.component';







// import { TreeViewModule } from '@progress/kendo-angular-treeview';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapViewerComponent,
    TextMapConverterComponent,
    SaveAsMapComponent,
    RegisterComponent,
    ModalComponent,
    ChangeUserInfoComponent,
    NodeMenuModalComponent,
    MapsfoldersViewerComponent,
    LogedHomeComponent,
    GroupsComponent,
    OpenPageComponent
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
    MatTabsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    FormsModule,
    GojsAngularModule,
    MatCheckboxModule,
    MatTableModule,
    AngularDraggableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    TreeViewModule,
    PopupModule,
    TooltipModule,
    DialogsModule,
    ButtonsModule,
    MatSelectModule,
    MatExpansionModule,
    GridModule,
    MatSortModule,
    InputsModule,
    MatSortModule,
    DropDownsModule
    // TreeViewModule
  ],
  providers: [
    MapsHandlerService,
    ModalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
