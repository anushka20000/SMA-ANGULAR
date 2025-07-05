import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AssetsComponent} from "./assets/assets.component";
import {AddAssetComponent} from "./add-asset/add-asset.component";
import {AssetAllocationComponent} from "./asset-allocation/asset-allocation.component";


const routes: Routes = [{
  path: 'manage',
  children: [
    {path:'',component:AssetsComponent},
    {path:'add',component:AddAssetComponent},
    {path:'asset-allocations',component:AssetAllocationComponent},

    // { path: '', redirectTo: 'asset', pathMatch: 'full' },
    // { path: '**', redirectTo: 'asset', pathMatch: 'full' },
  ],

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetRoutingModule { }
