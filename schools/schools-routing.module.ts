import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SchoolsComponent} from "./schools/schools.component";
import {AddSchoolComponent} from "./add-school/add-school.component";
import {SchoolDetailsComponent} from "./school-details/school-details.component";
import { NewAssetComponent } from '../asset-allocation/new-asset/new-asset.component';
import { AssetAllocationDetailsComponent } from '../asset-allocation/asset-allocation-details/asset-allocation-details.component';
import { EditSchoolComponent } from './edit-school/edit-school.component';



const routes: Routes = [{
  path: '',
  children: [
    {path:'',component:SchoolsComponent},
    {path:'add',component:AddSchoolComponent},
    {path:'details',component:SchoolDetailsComponent},
    {path:'details/:id',component:AssetAllocationDetailsComponent},
    {path:'new-asset/:id',component:NewAssetComponent},
    {path:'edit/:id',component:EditSchoolComponent},


    { path: '', redirectTo: 'asset', pathMatch: 'full' },
    { path: '**', redirectTo: 'asset', pathMatch: 'full' },
  ],

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsRoutingModule { }
