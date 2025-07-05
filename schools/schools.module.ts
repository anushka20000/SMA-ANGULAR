import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchoolsRoutingModule } from './schools-routing.module';
import { SchoolsComponent } from './schools/schools.component';
import { AddSchoolComponent } from './add-school/add-school.component';
import { SchoolDetailsComponent } from './school-details/school-details.component';
import {ModalModule} from "../../modules/modal/modal.module";
import {InlineSVGModule} from "ng-inline-svg-2";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AssetModule} from "../asset/asset.module";
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditSchoolComponent } from './edit-school/edit-school.component';


@NgModule({
  declarations: [
    SchoolsComponent,
    AddSchoolComponent,
    SchoolDetailsComponent,
    EditSchoolComponent
  ],
    imports: [
        CommonModule,
        SchoolsRoutingModule,
        ModalModule,
        InlineSVGModule,
        ReactiveFormsModule,
        AssetModule,
        DataTablesModule,
        NgSelectModule,
      FormsModule     

    ]
})
export class SchoolsModule { }
