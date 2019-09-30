import {
  Component,
  AfterContentInit,
  OnDestroy
} from '@angular/core';

import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js'; // Habilita a opção de modelar

// import * as Viewer from 'bpmn-js/dist/bpmn-viewer.development.js'; // Apenas para visualização
import * as $ from 'jquery';
import * as xml2js from 'xml2js';
import {ModalService} from '../../Service/modal.service';
import {Diagram} from 'src/app/Models/diagram';
import {FormBuilder} from '@angular/forms';
import {Notation} from 'src/app/Models/notation';
import {GenericDataServiceService} from '../../Service/generic-data-service.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
  thisDiagramId: any;
  diagram: any;
  diagramName = '';
  title = 'GO-pn | Criar diagrama';
  modeler = new BpmnJS();
  diagramNot = new Array();
  notationProperties: any;
  mainform: any;


  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private genericDataService: GenericDataServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  // If there is no erros can be removed!
  // onSubmit() {
  //   // TODO: Use EventEmitter with form value
  //   console.warn(this.mainform.value);
  // }

  ngAfterContentInit(): void {
    this.route.params.subscribe(params => {
      this.thisDiagramId = params['id'];
      this.genericDataService.getObjectById('diagrams', this.thisDiagramId).subscribe(
        (diagram) => {
          this.diagram = diagram;
          this.initializeBPMDiagramModeler();
        },
        (err) => {
          alert('An error ocurred! Err: ' + err);
          this.router.navigate(['/menu']);
        }
      );
    });

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

  ngOnDestroy(): void {
    this.modeler.destroy();
  }

  openPropertiesContent(content, notationId) {
    this.notationProperties = this.getNotationInfo(notationId);
    this.initializeForm();

    this.genericDataService.searchByNotationCode(notationId + '_di').subscribe(
      (notation) => {
        const nt = notation[notation.length - 1];
        this.mainform.patchValue(nt);
        this.mainform.get('compound_attributes.name').setValue(nt.compound.name);
        this.mainform.get('can_handle_attributes.quantity').setValue(nt.can_handle.quantity);
        this.mainform.get('can_handle_attributes.time').setValue(nt.can_handle.time);
        this.mainform.get('can_produce_attributes.quantity').setValue(nt.can_produce.quantity);
        this.mainform.get('can_produce_attributes.time').setValue(nt.can_produce.time);
        console.log(this.mainform.value);
      }
    );

    this.modalService.open(content, {size: 'lg'});
  }

  // Probably we're going to use it at otimization
  // changeColorXML(NOTATION_ID) {
  //   const elementRegistry = this.modeler.get('elementRegistry');
  //   const modeling = this.modeler.get('modeling');
  //   const shape = elementRegistry.get(NOTATION_ID);
  //   modeling.setColor(shape, {
  //     stroke: 'red',
  //     fill: 'white'
  //   });
  // }


  deleteMe(variable: any) {
    const elementRegistry = this.modeler.get('elementRegistry');
    const element = elementRegistry.get(variable);
    const modeling = this.modeler.get('modeling');
    modeling.removeShape(element);

    this.genericDataService.searchByNotationCode(variable + '_di').subscribe(
      (data) => {
        this.genericDataService.deleteObject('notations', data[0].id).subscribe(
          () => {
            this.saveXML();
          },
          (err) => {
            console.log('Didn\'t worked! Err: \n');
            console.log(err);
          }
        );
      },
      () => {
        this.saveXML();
      }
    );

    this.getCurrentXML();
  }

  saveNotation(notationId) {
    let dataToSend: any;
    dataToSend = this.mainform.value;
    dataToSend.bpm_notation_code = this.notationProperties.businessObject.di.id;
    dataToSend.resource = this.setNotationName(this.notationProperties.businessObject.$type);
    dataToSend.diagram_id = this.thisDiagramId;

    // console.warn(dataToSend);

    this.genericDataService.searchByNotationCode(notationId.toString()).subscribe(
      () => {
        this.genericDataService.updateObject('notations', dataToSend).subscribe(
          () => {
            this.saveXML();
          },
          (err) => {
            console.log('Didn\'t worked! Err: \n');
            console.log(err);
          }
        );
      },
      () => {
        this.genericDataService.createObject('notations', dataToSend).subscribe(
          () => {
            this.saveXML();
          },
          (err) => {
            console.log('Didn\'t worked! Err: \n');
            console.log(err);
          }
        );
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

    this.genericDataService.updateObject('diagrams', dg).subscribe(
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
    if (notationId.includes('_di')) {
      notationId = notationId.replace('_di', '');
    }
    const elementRegistry = this.modeler.get('elementRegistry');
    const element = elementRegistry.get(notationId);
    return element;
  }


  getCurrentXML() {
    // Avoid duplicated shapes
    this.diagramNot = [];

    this.modeler.saveXML({format: true}, (err, CHANGE_XML) => {
      const stripNS = xml2js.processors.stripPrefix;
      let rdnvar: any;
      xml2js.parseString(CHANGE_XML, {tagNameProcessors: [stripNS]}, (ERR, result) => {
        rdnvar = result;
      });
      // Check if variable contains any shape
      if (rdnvar.definitions.BPMNDiagram[0].BPMNPlane[0].BPMNShape !== undefined) {
        rdnvar.definitions.BPMNDiagram[0].BPMNPlane[0].BPMNShape.forEach(shape => {
          const notation = new Notation();
          notation.bpmNotationCode = shape.$.bpmnElement;
          this.diagramNot.push(notation);
        });
      }
    });
  }

  initializeBPMDiagramModeler(): void {
    this.modeler.attachTo($('#js-canvas'));
    console.log(this.diagram.bpm_diagram_code);
    this.modeler.importXML(this.diagram.bpm_diagram_code);
    $('.bjs-powered-by').css('display', 'none');
  }

  initializeForm() {
    this.mainform = this.formBuilder.group({
      id: [],
      bpm_notation_code: [''],
      resource: [''],
      compound_attributes: this.formBuilder.group({
        name: ['']
      }),
      can_handle_attributes: this.formBuilder.group({
        time: [''],
        quantity: [''] // ,
        // resource: this.formBuilder.group({
        //   name: [''],
        // })
      }),
      can_produce_attributes: this.formBuilder.group({
        time: [''],
        quantity: ['']
      }),
      isConstraint: false,
      diagram_id: []
    });
    // dependencies: Notation;
  }

  setNotationName(value: string) {
    return value.replace('bpmn:', '');
  }
}
