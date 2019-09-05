import { Injectable } from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal, public activeModal: NgbActiveModal) {}

  open(content) {
    this.modalService.open(content);
  }
}
