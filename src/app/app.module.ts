// Angular AND external modules.
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';

// Custom services.
import {ModalService} from './Service/modal.service';

// Angular components.
import {AppComponent} from './app.component';
import {BPMNDevelopmentComponent} from './bpmn-development/bpmn-development.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BPMDevelopmentMenuComponent} from './bpmn-development/bpm-development-menu/bpm-development-menu.component';
import {BpmDevelopmentCreateComponent} from './bpmn-development/bpm-development-create/bpm-development-create.component';
import {BpmnDevelopmentViewComponent} from './bpmn-development/bpm-development-view/bpmn-development-view.component';

const appRoutes: Routes = [
  {path: '', redirectTo: '/menu', pathMatch: 'full'},
  {
    path: 'menu', component: BPMNDevelopmentComponent,
    children: [
      {path: '', component: BPMDevelopmentMenuComponent},
      {path: 'create/:id', component: BpmDevelopmentCreateComponent},
      {path: 'view/:id', component: BpmnDevelopmentViewComponent}
    ],
  }
];

@NgModule({
  declarations: [
    AppComponent,
    BPMNDevelopmentComponent,
    BPMDevelopmentMenuComponent,
    BpmDevelopmentCreateComponent,
    BpmnDevelopmentViewComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),

  ],
  providers: [ModalService, NgbActiveModal],
  bootstrap: [AppComponent],
})

export class AppModule {
}
