import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'

import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { NgxTinymceModule } from 'ngx-tinymce'
import { CustomFormsModule } from 'ng2-validation'
import { NgxCurrencyModule } from 'ngx-currency'
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco'

import { OHCore, OVCCanActivateModule, SHISharedCore } from '@ovenfo/framework'
import { CODMain, Document, User } from './view/cod.core';
import { routing } from './cod.routing'

import { CODCoreService } from './cod.coreService'

@NgModule({
    imports: [
        routing,
        NgxTinymceModule.forRoot({
            baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/5.7.1/'
        }),
        NgbModule,
        CommonModule, HttpClientModule, FormsModule, CustomFormsModule, OHCore, ReactiveFormsModule,
        NgxCurrencyModule,
        TranslocoModule,
        SHISharedCore
    ],
    declarations: [
		CODMain, Document, User
    ],
    providers: [CODCoreService, OVCCanActivateModule, { provide: TRANSLOCO_SCOPE, useValue: 'cod' }]
})
export class CODModule {}
