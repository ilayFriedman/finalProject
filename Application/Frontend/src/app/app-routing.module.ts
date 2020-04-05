import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {MapViewerComponent} from "./map-viewer/map-viewer.component";
import {AppComponent} from "./app.component";
import { LogedHomeComponent } from './loged-home/loged-home.component';
import { RegisterComponent } from "./register/register.component";
import { ChangeUserInfoComponent } from './change-user-info/change-user-info.component';
import { GroupsComponent} from "./groups/groups.component";



const routes: Routes = [
  {path: 'logedHome', component: LogedHomeComponent },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'changeUserInfo', component: ChangeUserInfoComponent},
  {path: 'mapViewer', component: MapViewerComponent},
  {path: 'groups', component: GroupsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
