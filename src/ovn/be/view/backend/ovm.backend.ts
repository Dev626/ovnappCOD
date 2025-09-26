import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';;
import { CoreService, FirebaseAuthService, OVCMessaging, OHService, OVMBackendBase } from '@ovenfo/framework';
import { BESNav } from '@ovenfo/framework/lib/bes/view/nav/bes.nav';
import { environment } from 'src/environments/environment';
import { shared } from 'src/environments/environmentShared';

@Component({
  selector: 'ovm-backend',
  templateUrl: './ovm.backend.html'
})
export class OVMBackend extends OVMBackendBase implements OnInit {

    @ViewChild('objNav', { static: true }) objNav: BESNav;

    constructor(public override router: Router, public override ohService: OHService, public override cse: CoreService, public override title: Title, public override messagingService: OVCMessaging, public override fbAuth: FirebaseAuthService, public override translocoService: TranslocoService) {
        super(router, ohService, cse, title, messagingService, fbAuth, translocoService)
        this._environment = environment
        this._shared = shared
        this._constructor()
    }

    ngOnInit() {
        this._objNav = this.objNav
        this.validOnInit()
    }

    ngAfterViewInit() {
        this.validAfterViewInit()
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.renderMenu(event.target.innerWidth);
    }
}