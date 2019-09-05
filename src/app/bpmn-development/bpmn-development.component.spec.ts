import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPMNDevelopmentComponent } from './bpmn-development.component';

describe('BPMNDevelopmentComponent', () => {
  let component: BPMNDevelopmentComponent;
  let fixture: ComponentFixture<BPMNDevelopmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BPMNDevelopmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BPMNDevelopmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
