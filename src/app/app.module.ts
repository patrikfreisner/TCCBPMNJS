import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {BPMNDevelopmentComponent} from './bpmn-development/bpmn-development.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BPMDevelopmentMenuComponent} from './bpmn-development/bpm-development-menu/bpm-development-menu.component';
import {BpmDevelopmentCreateComponent} from './bpmn-development/bpm-development-create/bpm-development-create.component';
import {NgbModalBackdrop} from '@ng-bootstrap/ng-bootstrap/modal/modal-backdrop';
import {ModalService} from './Service/modal.service';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

const appRoutes: Routes = [
  {path: '', redirectTo: '/menu', pathMatch: 'full'},
  {
    path: 'menu', component: BPMNDevelopmentComponent,
    children: [
      {path: '', component: BPMDevelopmentMenuComponent},
      {path: 'create', component: BpmDevelopmentCreateComponent}
    ],
  }
];

@NgModule({
  declarations: [
    AppComponent,
    BPMNDevelopmentComponent,
    BPMDevelopmentMenuComponent,
    BpmDevelopmentCreateComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [ModalService, NgbActiveModal],
  bootstrap: [AppComponent],
})

export class AppModule {
}
