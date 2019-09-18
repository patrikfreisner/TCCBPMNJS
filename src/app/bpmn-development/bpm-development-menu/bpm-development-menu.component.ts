import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Diagram} from '../../Models/diagram';
import {GenericDataServiceService} from '../../Service/generic-data-service.service';

const INIT_XML = `<?xml version="1.0" encoding="UTF-8"?>
  <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
    <bpmn2:process id="Process_1" isExecutable="false">
    </bpmn2:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn2:definitions>`;

@Component({
  selector: 'app-bpm-development-menu',
  templateUrl: './bpm-development-menu.component.html',
  styleUrls: ['./bpm-development-menu.component.css']
})

export class BPMDevelopmentMenuComponent implements OnInit {

  constructor(
    private router: Router,
    private genericDataService: GenericDataServiceService) {
  }

  ngOnInit() {
  }

  createNewDiagram(): void {
    const dg = new Diagram();
    dg.bpm_diagram_code = INIT_XML;

    this.genericDataService.createObject('diagrams', dg).subscribe(
      (data) => {
        console.log('Consegui criar!');
        this.router.navigate(['/menu/create'], {state: {diagramId: data.id}});
      },
      () => {
        console.warn('Deu treta!!!');
      }
    );


  }

}
