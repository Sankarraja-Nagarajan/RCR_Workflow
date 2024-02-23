import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingDialogComponent } from './tracking-dialog.component';

describe('TrackingDialogComponent', () => {
  let component: TrackingDialogComponent;
  let fixture: ComponentFixture<TrackingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
