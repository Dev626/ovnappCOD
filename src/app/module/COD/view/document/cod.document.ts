import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MNGDocumentServiceJPO, pMngdocumentList } from '../../service/mng.mNGDocumentService';

@Component({
	templateUrl: './cod.document.html'
})
export class Document extends CODBase implements OnInit, AfterViewInit, OnDestroy {

  private mNGDocumentService : MNGDocumentServiceJPO

	constructor(private ohService : OHService, public override cse : CoreService, public override ccs : CODCoreService){
		super(ohService, cse, ccs);
    this.mNGDocumentService = new MNGDocumentServiceJPO(ohService)
	}

	ngOnInit(){
    this.mngdocumentList();
	}

	ngAfterViewInit(){

	}

	ngOnDestroy(){

	}
  mngdocumentList(){
    this.mNGDocumentService.mngdocumentList({}, (resp : pMngdocumentList) => {
      console.log('resp:', resp)
    })
  }

}
