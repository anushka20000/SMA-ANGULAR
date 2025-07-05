import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModalModule} from "../../modules/modal/modal.module";
import {InlineSVGModule} from "ng-inline-svg-2";
import {ReactiveFormsModule} from "@angular/forms";
import {AssetModule} from "../asset/asset.module";
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { AssetAllocationComponent } from './asset-allocation/asset-allocation.component';
import { NewAssetComponent } from './new-asset/new-asset.component';
import { AssetAllocationDetailsComponent } from './asset-allocation-details/asset-allocation-details.component';
import { AssetAllocationRoutingModule } from './asset-allocation-routing.module';


@NgModule({
  declarations: [
    AssetAllocationComponent,
    NewAssetComponent,
    AssetAllocationDetailsComponent
  ],
    imports: [
        CommonModule,
        AssetAllocationRoutingModule,
        ModalModule,
        InlineSVGModule,
        ReactiveFormsModule,
        AssetModule,
        DataTablesModule,
        NgSelectModule,
    ]
})
export class AssetAllocationModule { }
