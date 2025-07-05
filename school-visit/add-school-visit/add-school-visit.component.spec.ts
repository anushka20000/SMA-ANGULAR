import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchoolVisitComponent } from './add-school-visit.component';

describe('AddSchoolComponent', () => {
  let component: AddSchoolVisitComponent;
  let fixture: ComponentFixture<AddSchoolVisitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSchoolVisitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSchoolVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
