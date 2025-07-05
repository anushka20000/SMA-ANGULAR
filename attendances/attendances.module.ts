import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModalModule} from "../../modules/modal/modal.module";
import {InlineSVGModule} from "ng-inline-svg-2";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AssetModule} from "../asset/asset.module";
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchoolsVisitRoutingModule } from '../school-visit/schoolVisits-routing.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { AttendancesComponent } from './attendances/attendances.component';
import { AttendanceRoutingModule } from './attendances-routing.module';


@NgModule({
  declarations: [
    AttendancesComponent,
  ],
  exports:[
    AttendancesComponent
  ],
    imports: [
      CommonModule,
      AttendanceRoutingModule,
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
export class AttendancesModule { }
