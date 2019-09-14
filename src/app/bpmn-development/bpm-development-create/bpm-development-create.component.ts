import {
  Component,
  AfterContentInit,
  OnDestroy
} from '@angular/core';

import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js'; // Habilita a opção de modelar

// import * as Viewer from 'bpmn-js/dist/bpmn-viewer.development.js'; // Apenas para visualização
import * as $ from 'jquery';
import * as xml2js from 'xml2js';
import {Observable} from 'rxjs';
import {ModalService} from '../../Service/modal.service';
import {Diagram} from 'src/app/Models/diagram';
import {FormBuilder} from '@angular/forms';
import {Notation} from 'src/app/Models/notation';
import {GenericDataServiceService} from '../../Service/generic-data-service.service';
import {Router} from '@angular/router';

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
  selector: 'app-bpm-development-create',
  templateUrl: './bpm-development-create.component.html',
  styleUrls: ['./bpm-development-create.component.css'],
})

export class BpmDevelopmentCreateComponent implements AfterContentInit, OnDestroy {
  thisDiagramId = history.state.diagramId;
  title = 'Angular/BPMN';
  modeler = new BpmnJS();
  diagramNot = new Array();
  notationProperties: any;
  mainform: any;


  constructor(
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private genericDataService: GenericDataServiceService,
    private router: Router,
  ) {
  }


  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.mainform.value);
  }


  ngAfterContentInit(): void {
    if (this.thisDiagramId === undefined) {
      // TODO
      this.genericDataService.getObjects('http://192.168.56.102:3000/diagrams').subscribe(
        (diagrams: any[]) => {
          const diagram = diagrams[diagrams.length - 1];
          this.thisDiagramId = diagrams[diagrams.length - 1].id;
          this.modeler.attachTo($('#js-canvas'));
          this.modeler.importXML(diagram.bpm_diagram_code);
          $('.bjs-powered-by').css('display', 'none');
        },
        () => {
          alert('An error ocurred when initializing XML');
          this.router.navigate(['/menu']);
        }
      );
    } else {
      this.genericDataService.getObjectById('http://192.168.56.102:3000/diagrams', this.thisDiagramId).subscribe(
        (diagram) => {
          this.modeler.attachTo($('#js-canvas'));
          console.log(diagram.bpm_diagram_code);
          this.modeler.importXML(diagram.bpm_diagram_code);
          $('.bjs-powered-by').css('display', 'none');
        },
        (err) => {
          alert('An error ocurred!');
          this.router.navigate(['/menu']);
        }
      );
    }

    const eventBus = this.modeler.get('eventBus');
    eventBus.on('shape.added', (event, payload) => {
      setTimeout(() => {
        this.getCurrentXML();
      }, 1);
    });
    eventBus.on('shape.removed', (event, payload) => {
      setTimeout(() => {
        this.getCurrentXML();
      }, 1);
    });
    eventBus.on('element.click', (event, payload) => {
      if (payload.element.type !== 'bpmn:SequenceFlow') {
        $('.bpmn-icon-trash').hide();
      }
    });
  }

  openPropertiesContent(content, notationId) {
    this.notationProperties = this.getNotationInfo(notationId);
    this.initializeForm();
    this.modalService.open(content);
  }

  ngOnDestroy(): void {
    this.modeler.destroy();
  }


  changeColorXML(NOTATION_ID) {
    const elementRegistry = this.modeler.get('elementRegistry');
    const modeling = this.modeler.get('modeling');
    const shape = elementRegistry.get(NOTATION_ID);
    modeling.setColor(shape, {
      stroke: 'red',
      fill: 'white'
    });
  }


  deleteMe(variable: any) {
    const elementRegistry = this.modeler.get('elementRegistry');
    const element = elementRegistry.get(variable);
    const modeling = this.modeler.get('modeling');
    modeling.removeShape(element);
    this.getCurrentXML();
  }

  saveNotation() {
    const nt = new Notation();
    console.warn(nt);

    this.genericDataService.updateObject('http://192.168.56.102:3000/notations', nt).subscribe(
      (data) => {
        alert('Salvo: ');
      },
      (err) => {
        console.log('Didn\'t worked! Err: ');
        console.log(err);
      }
    );
  }


  saveXML() {
    const dg = new Diagram();
    dg.id = this.thisDiagramId;
    dg.bpm_diagram_code = '';
    this.modeler.saveXML({format: true}, (err, CHANGED_XML) => {
      const stripNS = xml2js.processors.stripPrefix;
      dg.bpm_diagram_code = CHANGED_XML.toString();
    });
    dg.notation = this.diagramNot;
    console.warn(dg);

    this.genericDataService.updateObject('http://192.168.56.102:3000/diagrams', dg).subscribe(
      (data) => {
        alert('Salvo!');
      },
      (err) => {
        console.log('Didn\'t worked! Err: ');
        console.log(err);
      }
    );
  }


  getNotationInfo(notationId: any) {
    const elementRegistry = this.modeler.get('elementRegistry');
    const element = elementRegistry.get(notationId);
    return element;
  }


  getCurrentXML() {
    // Avoid duplicated shapes
    this.diagramNot = [];
    //
    this.modeler.saveXML({format: true}, (err, CHANGE_XML) => {
      const stripNS = xml2js.processors.stripPrefix;
      let rdnvar: any;
      xml2js.parseString(CHANGE_XML, {tagNameProcessors: [stripNS]}, (ERR, result) => {
        rdnvar = result;
      });
      // Check if variable contains any shape
      if (rdnvar.definitions.BPMNDiagram[0].BPMNPlane[0].BPMNShape !== undefined) {
        rdnvar.definitions.BPMNDiagram[0].BPMNPlane[0].BPMNShape.forEach(shape => {
          let notation = new Notation();
          notation.bpmNotationCode = shape.$.bpmnElement;
          this.diagramNot.push(notation);
        });
      }
    });
  }

  initializeForm() {
    this.mainform = this.formBuilder.group({
      resource: [''],
      compound: this.formBuilder.group({
        name: ['']
      }),
      canHandle: this.formBuilder.group({
        time: [''],
        quantity: [''],
        resource: this.formBuilder.group({
          name: [''],
        })
      }),
      canProduce: this.formBuilder.group({
        time: [''],
        quantity: [''],
        resource: this.formBuilder.group({
          name: [''],
        })
      }),
      isConstraint: false,
    });
    // dependencies: Notation;
  }

  setNotationName(value: string) {
    return value.replace('bpmn:', '');
  }
}
