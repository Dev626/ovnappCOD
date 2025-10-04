import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { ActivatedRoute } from '@angular/router';

@Component({
	templateUrl: './cod.userDocument.html'
})
export class UserDocument extends CODBase implements OnInit, AfterViewInit, OnDestroy {

  userid!: number;

	constructor(private ohService : OHService, public override cse : CoreService, public override ccs : CODCoreService, private route: ActivatedRoute){
		super(ohService, cse, ccs);
	}

	ngOnInit(){
    this.route.params.subscribe((params) => {
      if (params && params['id']) {
        this.userid = Number(params['id']);
      }
    });

	}

	ngAfterViewInit(){

	}

	ngOnDestroy(){

	}

}
