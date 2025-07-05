import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetRoutingModule } from './asset-routing.module';
import { AssetsComponent } from './assets/assets.component';
import { AddAssetComponent } from './add-asset/add-asset.component';
import { AddBulkAssetComponent } from './add-bulk-asset/add-bulk-asset.component';
import {ModalModule} from "../../modules/modal/modal.module";
import {InlineSVGModule} from "ng-inline-svg-2";
import {ReactiveFormsModule} from "@angular/forms";
import {NgxDropzoneModule} from "ngx-dropzone";
import { AssetAllocationComponent } from './asset-allocation/asset-allocation.component';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
    declarations: [
        AssetsComponent,
        AddAssetComponent,
        AddBulkAssetComponent,
        AssetAllocationComponent
    ],
    exports: [
        AssetsComponent,
        AssetAllocationComponent,
        AddBulkAssetComponent
    ],
    imports: [
        CommonModule,
        AssetRoutingModule,
        ModalModule,
        InlineSVGModule,
        ReactiveFormsModule,
        NgxDropzoneModule,
        DataTablesModule,
        NgSelectModule,
    ]
})
export class AssetModule { }
