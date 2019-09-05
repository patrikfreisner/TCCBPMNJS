import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPMDevelopmentMenuComponent } from './bpm-development-menu.component';

describe('BPMDevelopmentMenuComponent', () => {
  let component: BPMDevelopmentMenuComponent;
  let fixture: ComponentFixture<BPMDevelopmentMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BPMDevelopmentMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BPMDevelopmentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
