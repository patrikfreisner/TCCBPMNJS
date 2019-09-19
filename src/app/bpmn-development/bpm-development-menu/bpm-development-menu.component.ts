import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Diagram} from '../../Models/diagram';
import {GenericDataServiceService} from '../../Service/generic-data-service.service';
import {FormBuilder} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {moment} from 'ngx-bootstrap/chronos/test/chain';

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

  mainform: any;
  diagramList: any;
  selectIdModel: number;

  constructor(
    private router: Router,
    private genericDataService: GenericDataServiceService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
  }

  createNewDiagram(): void {

    const dg = new Diagram();
    dg.bpm_diagram_code = INIT_XML;
    dg.name = this.mainform.get('name').value;

    this.genericDataService.createObject('diagrams', dg).subscribe(
      (data) => {
        console.log('Consegui criar!');
        this.router.navigate(['/menu/create/' + data.id]);
      },
      () => {
        console.warn('Deu treta!!!');
      }
    );
  }

  viewDiagram(id: number): void {
    this.router.navigate(['/menu/view/' + id]);
  }

  openCreateDiagram(content): void {
    this.initializeForm();
    this.modalService.open(content, {size: 'sm'});
  }

  openViewDiagram(content): void {
    this.modalService.open(content, {size: 'lg'});

    this.genericDataService.getObjects('diagrams').subscribe(
      (diagrams: any[]) => {
        this.diagramList = diagrams;
      },
      (err) => {
        alert('An error ocurred when initializing XML. Err: ' + err);
        this.router.navigate(['/menu']);
      }
    );

  }

  deleteDiagram(id): void {
    this.genericDataService.deleteObject('diagrams', id).subscribe(
      (data) => {
        alert('Deleted!');
      },
      (err) => {
        alert(err);
      }
    );
  }

  dateParser(data: string) {
    const dt = new Date(Date.parse(data));
    return dt.getDate() + '/' + dt.getMonth() + '/' + dt.getFullYear() + ' ' + dt.getHours() + ':' + dt.getMinutes();
  }

  initializeForm() {
    this.mainform = this.formBuilder.group({
      name: ['']
    });
    // dependencies: Notation;
  }

}
