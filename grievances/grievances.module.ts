import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GrievanceRoutingModule } from './grievances-routing.module';
import { GrievancesComponent } from './grievances/grievances.component';
import { AddGrievanceComponent } from './add-grievance/add-grievance.component';
import { GrievanceDetailsComponent } from './grievance-details/grievance-details.component';
import {ModalModule} from "../../modules/modal/modal.module";
import {InlineSVGModule} from "ng-inline-svg-2";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AssetModule} from "../asset/asset.module";
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchoolsVisitRoutingModule } from '../school-visit/schoolVisits-routing.module';
import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  declarations: [
    GrievancesComponent,
    AddGrievanceComponent,
    GrievanceDetailsComponent
  ],
  exports:[
    GrievancesComponent
  ],
    imports: [
      CommonModule,
      GrievanceRoutingModule,
      ModalModule,
      InlineSVGModule,
      ReactiveFormsModule,
      AssetModule,
      DataTablesModule,
      NgSelectModule,
      NgxDropzoneModule,
      FormsModule     
    ]
})
export class GrievancesModule { }
