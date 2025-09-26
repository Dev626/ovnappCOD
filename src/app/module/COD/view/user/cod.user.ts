import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';

@Component({
	templateUrl: './cod.user.html'
})
export class User extends CODBase implements OnInit, AfterViewInit, OnDestroy {

	constructor(private ohService : OHService, public override cse : CoreService, public override ccs : CODCoreService){
		super(ohService, cse, ccs);
	}

	ngOnInit(){

	}

	ngAfterViewInit(){

	}

	ngOnDestroy(){

	}

}
