import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BpmDevelopmentCreateComponent } from './bpm-development-create.component';

describe('BpmDevelopmentCreateComponent', () => {
  let component: BpmDevelopmentCreateComponent;
  let fixture: ComponentFixture<BpmDevelopmentCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BpmDevelopmentCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BpmDevelopmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
