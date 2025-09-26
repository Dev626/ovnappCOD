import { Component, AfterViewInit, OnInit} from '@angular/core';
import { Router } from '@angular/router';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODBase } from 'src/app/module/COD/cod.base';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';

@Component({
  templateUrl: './cod.main.html'
})
export class CODMain extends CODBase implements OnInit, AfterViewInit {

    constructor(private router : Router, private ohService : OHService, public override cse : CoreService, public override ccs : CODCoreService){
        super(ohService, cse, ccs);
    }

    ngOnInit(){
        var childrens = this.cse.getTreeChild('/Be/cod').filter(child => child.type == 2);
        if(childrens.length == 1){
            this.router.navigate([childrens[0].urlTree]);
        }
    }

    ngAfterViewInit(){
         this.ohService.getOH().getLoader().close();
    }

}