import { Component } from '@angular/core';

@Component({
  selector: 'app-school-details',
  templateUrl: './school-details.component.html',
  styleUrls: ['./school-details.component.scss']
})
export class SchoolDetailsComponent {

  public activeTab:number=1;

  public changeTab(tabId: number) {
    this.activeTab = tabId;
  }

}
