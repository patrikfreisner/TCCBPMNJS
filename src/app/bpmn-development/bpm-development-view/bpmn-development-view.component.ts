import {
  Component,
  AfterContentInit,
  OnDestroy
} from '@angular/core';

import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js'; // Habilita a opção de modelar

import * as Viewer from 'bpmn-js/dist/bpmn-viewer.development.js'; // Apenas para visualização
import * as $ from 'jquery';
import * as xml2js from 'xml2js';
import {ModalService} from '../../Service/modal.service';
import {Diagram} from 'src/app/Models/diagram';
import {FormBuilder} from '@angular/forms';
import {Notation} from 'src/app/Models/notation';
import {GenericDataServiceService} from '../../Service/generic-data-service.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-bpmn-development-view',
  templateUrl: './bpmn-development-view.component.html',
  styleUrls: ['./bpmn-development-view.component.css']
})
export class BpmnDevelopmentViewComponent implements AfterContentInit, OnDestroy {
  thisDiagramId: any;
  diagram: any;
  title = 'GO-pn | Criar diagrama';
  modeler = new BpmnJS();
  // modeler = new Viewer();
  diagramNot = new Array();
  notationProperties: any;
  mainform: any;
  modelerStr = 'viewer';
  editEnable = false;


  constructor(
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private genericDataService: GenericDataServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

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

  changeModeler(): void {
    if (this.editEnable) {
      this.editEnable = false;

    } else {
      this.editEnable = true;
    }
    // if (this.modelerStr === 'viewer') {
    //   this.modeler.destroy();
    //   this.modeler = new BpmnJS();
    //   this.initializeBPMDiagramModeler();
    //   this.modelerStr = 'modeler';
    // } else if (this.modelerStr === 'modeler') {
    //   this.modeler.destroy();
    //   this.modeler = new Viewer();
    //   this.initializeBPMDiagramModeler();
    //   this.modelerStr = 'viewer';
    // }
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
      },
      (err) => {
        console.error(err);
      }
    );

    this.modalService.open(content);
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
    this.getCurrentXML();
  }

  saveNotation() {
    let dataToSend: any = null;
    dataToSend = this.mainform.value;
    dataToSend.bpm_notation_code = this.notationProperties.businessObject.di.id;
    dataToSend.resource = this.setNotationName(this.notationProperties.businessObject.$type);
    dataToSend.diagram_id = this.thisDiagramId;

    console.warn(dataToSend);

    this.genericDataService.createObject('notations', dataToSend).subscribe(
      (data) => {
        this.saveXML();
      },
      (err) => {
        console.log('Didn\'t worked! Err: \n');
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


    if (this.editEnable) {
      this.mainform.enable();
    } else {
      this.mainform.disable();
    }
  }

  setNotationName(value: string) {
    return value.replace('bpmn:', '');
  }
}
