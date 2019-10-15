import {
  Component,
  AfterContentInit,
  OnDestroy, OnInit
} from '@angular/core';

import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js'; // Habilita a opção de modelar

// import * as Viewer from 'bpmn-js/dist/bpmn-viewer.development.js'; // Apenas para visualização
import * as $ from 'jquery';
import * as xml2js from 'xml2js';
import {Diagram} from 'src/app/Models/diagram';
import {FormBuilder} from '@angular/forms';
import {Notation} from 'src/app/Models/notation';
import {GenericDataServiceService} from '../../Service/generic-data-service.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {of} from 'rxjs';

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
  dropdownList = [];
  selectedList = [];
  dropdownSettings = {};
  relQuantityForWhoDependsOnMeRelated = 0;

  constructor(
    private modalService: NgbModal,
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
    this.dropdownList = [];
    this.selectedList = [];

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      disable: this.editEnable
    };

    this.notationProperties = this.getNotationInfo(notationId);
    this.initializeForm();

    this.genericDataService.searchByNotationCode(notationId + '_di').subscribe(
      (notation) => {
        const nt = notation[notation.length - 1];
        this.mainform.patchValue(nt);
        this.mainform.get('id').setValue(nt.id);
        this.mainform.get('compound_attributes.name').setValue(nt.compound.name);
        this.mainform.get('can_handle_attributes.quantity').setValue(nt.can_handle.quantity);
        this.mainform.get('can_handle_attributes.time').setValue(nt.can_handle.time);
        this.mainform.get('can_produce_attributes.quantity').setValue(nt.can_produce.quantity);
        this.mainform.get('can_produce_attributes.time').setValue(nt.can_produce.time);
        for (const notate of notation[notation.length - 1].related_notation) {
          const genericData1: any = {};
          genericData1.id = notate.id;
          if (this.getNotationInfo(notate.bpm_notation_code).businessObject.name === undefined) {
            genericData1.name = this.setNotationName(this.getNotationInfo(notate.bpm_notation_code).businessObject.$type);
          } else {
            genericData1.name = this.getNotationInfo(notate.bpm_notation_code).businessObject.name.toString();
          }
          this.selectedList.push(genericData1);
        }

        this.genericDataService.getObjectById('diagrams', this.thisDiagramId).subscribe(
          (data) => {
            for (const note of data.notation) {
              if (note.id !== notation[notation.length - 1].id) {
                const genericData1: any = {};
                genericData1.id = note.id;
                if (this.getNotationInfo(note.bpm_notation_code).businessObject.name === undefined) {
                  genericData1.name = this.setNotationName(this.getNotationInfo(note.bpm_notation_code).businessObject.$type);
                } else {
                  genericData1.name = this.getNotationInfo(note.bpm_notation_code).businessObject.name.toString();
                }
                this.dropdownList.push(genericData1);
              }
            }
          }
        );
      },
      () => {
        this.genericDataService.getObjectById('diagrams', this.thisDiagramId).subscribe(
          (data) => {
            for (const note of data.notation) {
              const genericData1: any = {};
              genericData1.id = note.id;
              genericData1.name = this.getNotationInfo(note.bpm_notation_code).businessObject.name.toString();
              this.dropdownList.push(genericData1);
            }
          }
        );
      }
    );
    setTimeout(() => {
      this.modalService.open(content, {size: 'lg'});
    }, 350);
  }

  changeColorXML(NOTATION_ID, color) {
    const elementRegistry = this.modeler.get('elementRegistry');
    const modeling = this.modeler.get('modeling');
    const shape = elementRegistry.get(NOTATION_ID);
    modeling.setColor(shape, {
      stroke: color,
      fill: 'white'
    });
  }

  optimizingProcess(): void {
    const notationsID = new Array();
    this.genericDataService.getObjectById('diagrams', this.thisDiagramId).subscribe(
      (diagram) => {
        for (const notation of diagram.notation) {
          notationsID.push(notation.id);
        }
        // Para cada notation pega dados do DB
        for (const id of notationsID) {
          this.genericDataService.getObjectById('notations', id).subscribe(
            (notation) => {
              const thisAllItems = notation.can_produce.quantity / notation.can_produce.time;
              const thisMaxItems = notation.can_handle.quantity / notation.can_handle.time;

              ///////////////////// INICIO /////////////////
              // Mais de uma notation depende dele?
              if (notation.inverse_related_notation.length > 1) {
                const allRelatedNotation = notation.inverse_related_notation;
                let allNeededItems = 0;
                let allNonNeededItems = 0;

                for (const whoDependsOnMe of allRelatedNotation) {
                  // Aqui já deve sair as peças por minuto
                  if (whoDependsOnMe.related_notation.length === 1 && whoDependsOnMe.related_notation.length !== 0) {
                    allNeededItems += whoDependsOnMe.can_produce.quantity / whoDependsOnMe.can_produce.time;
                  } else if (whoDependsOnMe.related_notation.length !== 0) {
                    for (const rel of whoDependsOnMe.related_notation) {
                      if (rel.id !== notation.id) {
                        allNonNeededItems += rel.can_produce.quantity / rel.can_produce.time;
                      } else {
                        allNonNeededItems += 0;
                      }
                    }
                    allNeededItems = whoDependsOnMe.can_produce.quantity / whoDependsOnMe.can_produce.time;
                    allNeededItems = allNeededItems - allNonNeededItems;
                  }
                  // Ja considera caso a dependencia e dependencia de mais alguem.
                }

                if (thisAllItems.toFixed(2) >= allNeededItems.toFixed(2)) {
                  this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), 'black');
                } else {
                  if (thisMaxItems.toFixed(2) >= allNeededItems.toFixed(2)) {
                    this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), '#ff9900');
                  } else {
                    this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), 'red');
                  }
                }
                // Apenas uma notation depende dele!
              } else if (notation.inverse_related_notation.length === 1) {

                const whoDependsOnMe = notation.inverse_related_notation[0];

                const thisOneItems = notation.can_produce.quantity / notation.can_produce.time;
                const thisOneMaxItems = notation.can_handle.quantity / notation.can_handle.time;
                let allNeededItems = 0;

                if (whoDependsOnMe.related_notation.length === 1 && whoDependsOnMe.related_notation.length !== 0) {
                  allNeededItems += whoDependsOnMe.can_produce.quantity / whoDependsOnMe.can_produce.time;
                } else if (whoDependsOnMe.related_notation.length !== 0) {
                  let allNonNeededItems = 0;
                  for (const rel of whoDependsOnMe.related_notation) {
                    if (rel.id !== notation.id) {
                      allNonNeededItems += rel.can_produce.quantity / rel.can_produce.time;
                    } else {
                      allNonNeededItems += 0;
                    }
                  }
                  allNeededItems = whoDependsOnMe.can_produce.quantity / whoDependsOnMe.can_produce.time;
                  allNeededItems = allNeededItems - allNonNeededItems;
                }
                if (thisOneItems.toFixed(2) >= allNeededItems.toFixed(2)) {
                  this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), 'black');
                } else {
                  if (thisOneMaxItems.toFixed(2) >= allNeededItems.toFixed(2)) {
                    this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), '#ff9900');
                  } else {
                    this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), 'red');
                  }
                }
              } else if (notation.inverse_related_notation.length === 0 && notation.bpm_notation_code.search('/EndEvent/gi')
                || notation.bpm_notation_code.search('/StartEvent/gi')) {
                this.changeColorXML(notation.bpm_notation_code.replace('_di', ''), 'black');
              }
              ////////////////////////////////// FIM ////////////////
            }
          );
        }
      }
    );
  }

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
    dataToSend.related_notation = this.selectedList;

    this.genericDataService.searchByNotationCode(notationId.toString()).subscribe(
      (data) => {
        dataToSend.can_handle_attributes.id = data[0].can_handle.id;
        dataToSend.can_produce_attributes.id = data[0].can_produce.id;
        dataToSend.compound_attributes.id = data[0].compound.id;
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
    this.modeler.importXML(this.diagram.bpm_diagram_code);
    $('.bjs-powered-by').css('display', 'none');
  }

  initializeForm() {
    this.mainform = this.formBuilder.group({
      id: [''],
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
      dependencies: [],
      diagram_id: [],
    });


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
