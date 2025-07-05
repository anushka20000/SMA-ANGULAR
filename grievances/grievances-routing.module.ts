import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GrievancesComponent} from "./grievances/grievances.component";
import {AddGrievanceComponent} from "./add-grievance/add-grievance.component";
import {GrievanceDetailsComponent} from "./grievance-details/grievance-details.component";


const routes: Routes = [{
  path: 'manage',
  children: [
    {path:'',component: GrievancesComponent},
    {path:'add',component: AddGrievanceComponent},
    {path:'details/:id',component: GrievanceDetailsComponent},

    { path: '', redirectTo: 'asset', pathMatch: 'full' },
    { path: '**', redirectTo: 'asset', pathMatch: 'full' },
  ],

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrievanceRoutingModule { }
