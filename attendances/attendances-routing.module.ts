import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendancesComponent } from './attendances/attendances.component';



const routes: Routes = [{
  path: 'manage',
  children: [
    {path:'',component: AttendancesComponent},

    { path: '', redirectTo: 'attendance', pathMatch: 'full' },
    { path: '**', redirectTo: 'attendance', pathMatch: 'full' },
  ],

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
