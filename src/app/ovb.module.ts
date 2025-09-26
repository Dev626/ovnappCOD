import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskModule } from 'ngx-mask';
import { BESModule, OVCCanActivate } from '@ovenfo/framework';

import { ovbRouting } from './ovb.routing';
import { OVMBackend } from '../ovn/be/view/backend/ovm.backend';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';

@NgModule({
  declarations: [
    OVMBackend
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    TranslocoModule,
    RouterModule,
    ovbRouting, BESModule, CommonModule, NgbModule, NgxMaskModule
  ],
  providers: [OVCCanActivate, , { provide: TRANSLOCO_SCOPE, useValue: 'backend' }]
})
export class OVBModule {}