import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {MapViewerComponent} from "./map-viewer/map-viewer.component";
import {AppComponent} from "./app.component";
import {MapIndexComponent} from "./map-index/map-index.component";



const routes: Routes = [
  {path: 'logedHome', component: MapIndexComponent },
  {path: 'login', component: LoginComponent},
  {path: 'mapViewer', component: MapViewerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
