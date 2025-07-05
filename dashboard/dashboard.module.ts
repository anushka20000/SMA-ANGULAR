import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import {
  DropdownMenusModule,
  ModalsModule,
  WidgetsModule,
} from "../../_metronic/partials";
import { InlineSVGModule } from "ng-inline-svg-2";
import { DataTablesModule } from "angular-datatables";
import { FormsModule } from "@angular/forms";
import { ModalModule } from "../../modules/modal/modal.module";
import { AssetAllocationModule } from "../asset-allocation/asset-allocation.module";
import { AssetModule } from "../asset/asset.module";
import { GrievancesModule } from "../grievances/grievances.module";
import { SchoolVisitModule } from "../school-visit/schoolVisits.module";

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: "",
        component: DashboardComponent,
      },
    ]),

    //ModalsModule,
    WidgetsModule,
    DropdownMenusModule,
    InlineSVGModule,
    DataTablesModule,
    FormsModule,
    ModalModule,
    AssetModule,
    GrievancesModule,
    SchoolVisitModule
  ],
})
export class DashboardModule {

}
