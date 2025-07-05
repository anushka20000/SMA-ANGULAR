import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBulkAssetComponent } from './add-bulk-asset.component';

describe('AddBulkAssetComponent', () => {
  let component: AddBulkAssetComponent;
  let fixture: ComponentFixture<AddBulkAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBulkAssetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBulkAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
