import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AssetAllocationComponent} from "./asset-allocation/asset-allocation.component";
import {AssetAllocationDetailsComponent} from "./asset-allocation-details/asset-allocation-details.component";
import { NewAssetComponent } from './new-asset/new-asset.component';


const routes: Routes = [{
  path: '',
  children: [
    {path:'',component:AssetAllocationComponent},
    {path:'details/:id',component:AssetAllocationDetailsComponent},
    {path:'new-asset/:id',component:NewAssetComponent},

    

    { path: '', redirectTo: 'asset', pathMatch: 'full' },
    { path: '**', redirectTo: 'asset', pathMatch: 'full' },
  ],

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetAllocationRoutingModule { }
