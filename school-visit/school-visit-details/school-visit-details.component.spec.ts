import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolVisitDetailsComponent } from './school-visit-details.component';

describe('SchoolDetailsComponent', () => {
  let component: SchoolVisitDetailsComponent;
  let fixture: ComponentFixture<SchoolVisitDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolVisitDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolVisitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
