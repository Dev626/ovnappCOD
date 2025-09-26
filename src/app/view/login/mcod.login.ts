import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Storage } from '@angular/fire/storage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslocoService } from '@ngneat/transloco';

import { environment } from 'src/environments/environment';
import { shared } from 'src/environments/environmentShared';
import { CoreService, frameworkConfig, OHService, OVCBase, pSegusuarioClaveRestaurar } from '@ovenfo/framework';

@Component({
    selector: 'mcod-login',
    templateUrl: './mcod.login.html'
})
export class MCODLogin extends OVCBase {

    user: any;
    sizeW: number;
    sizeWidthImg: string;
    sistema_id: number;
    restaurar : any;

    @Output() onLogin: EventEmitter<any>;

    @Input() config : any

    @Output() onClose: EventEmitter<any>;

    constructor(private router: Router, public override ohService: OHService, private title: Title, private route: ActivatedRoute, private modalService: NgbModal, public override cse: CoreService, public override fireStorage: Storage, private translocoService: TranslocoService) {

        super(ohService, cse, fireStorage)

        this.onLogin = new EventEmitter<any>();
        this.onClose = new EventEmitter<any>();

        this.user = {};
        this.sistema_id = environment.systemId || shared.systemId;

        this.restaurar = {
            emailRestore : '',
            alertMsj : ''
        };

        this.cse.onUpdate();
        this.precarga.then(() => {
            this.title.setTitle(this.cse.data.system.sistema.descripcion + ' - Login v' + environment.version);
        })

        translocoService.setActiveLang(environment.default_languaje)

    }

    ngOnInit() {

        this.ohService.getOH().getLoader().close();

        var regId = '';

            regId = 'ovn_CONFIRM_SUCCESS'
            if (this.storage.has(regId)) {
                this.ohService.getOH().getAd().success(this.storage.get(regId));
                this.storage.remove(regId);
            }

            regId = 'ovn_CONFIRM_ALERT'
            if (this.storage.has(regId)) {
                this.ohService.getOH().getAd().warning(this.storage.get(regId));
                this.storage.remove(regId);
            }

            regId = 'ovn_RESTORE_SUCCESS'
            if (this.storage.has(regId)) {
                this.ohService.getOH().getAd().success(this.storage.get(regId));
                this.storage.remove(regId);
            }

    }

    ngAfterViewInit() {
        this.afterInit_pr();
    }

    login() {
        this.doLogin(this.user.user, this.user.password, () => {
            this.ohService.getOH().getLoader().close();
            this.onLogin.emit();
            this.router.navigate(['/' + frameworkConfig.baseBackEnd], { relativeTo: this.route });
        })
    }

}