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
  title = 'Angular/BPMN';
  modeler = new BpmnJS();
  diagramNot: any;
  notationProperties: any;

  constructor(
    private modalService: ModalService,
  ) {
  }

  ngAfterContentInit(): void {
    this.modeler.attachTo($('#js-canvas'));
    this.modeler.importXML(INIT_XML);
    $('.bjs-powered-by').css('display', 'none');

    const eventBus = this.modeler.get('eventBus');
    // Listen to shape added and removed ---------------------------------------------------------------------------
    // https://github.com/bpmn-io/diagram-js/blob/master/lib/features/overlays/Overlays.js - Add something as overlay
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

  open(content) {
    this.modalService.open(content);
  }
  openPropertiesContent(content, notationId) {
    this.notationProperties = this.getNotationInfo(notationId);
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
    // this.modeler.get('canvas').removeShape(element);
    this.getCurrentXML();
  }

  saveXML() {
    this.modeler.saveXML({format: true}, (err, CHANGED_XML) => {
      const stripNS = xml2js.processors.stripPrefix;
      let rdnvar: any;
      xml2js.parseString(CHANGED_XML, {tagNameProcessors: [stripNS]}, (ERR, result) => {
        rdnvar = result;
      });
      this.diagramNot = rdnvar.definitions.BPMNDiagram[0].BPMNPlane[0].BPMNShape;
      console.log(rdnvar);
    });
  }

  getNotationInfo(notationId: any) {
    const elementRegistry = this.modeler.get('elementRegistry');
    const element = elementRegistry.get(notationId);
    return element;
  }

  getCurrentXML() {
    this.modeler.saveXML({format: true}, (err, CHANGE_XML) => {
      const stripNS = xml2js.processors.stripPrefix;
      let rdnvar: any;
      xml2js.parseString(CHANGE_XML, {tagNameProcessors: [stripNS]}, (ERR, result) => {
        console.log(result);
        rdnvar = result;
      });
      this.diagramNot = rdnvar.definitions.BPMNDiagram[0].BPMNPlane[0].BPMNShape;
      console.log(rdnvar);
    });
  }

  setNotationName(value: string) {
    return value.replace('bpmn:', '');
  }
}
