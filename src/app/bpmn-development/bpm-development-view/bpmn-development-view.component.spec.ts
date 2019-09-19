import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BpmnDevelopmentViewComponent } from './bpmn-development-view.component';

describe('BpmnDevelopmentViewComponent', () => {
  let component: BpmnDevelopmentViewComponent;
  let fixture: ComponentFixture<BpmnDevelopmentViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BpmnDevelopmentViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BpmnDevelopmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
