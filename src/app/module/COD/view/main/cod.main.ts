import { Component, AfterViewInit, OnInit, Renderer2} from '@angular/core';
import { Router } from '@angular/router';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODBase } from 'src/app/module/COD/cod.base';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';

@Component({
  templateUrl: './cod.main.html'
})
export class CODMain extends CODBase implements OnInit, AfterViewInit {

    constructor(private router : Router, private ohService : OHService, public override cse : CoreService, public override ccs : CODCoreService, private renderer: Renderer2){
        super(ohService, cse, ccs);
    }

    ngOnInit(){
        var childrens = this.cse.getTreeChild('/Be/cod').filter(child => child.type == 2);
        if(childrens.length == 1){
            this.router.navigate([childrens[0].urlTree]);
        }
    }

    ngAfterViewInit(): void {
      const nav = document.querySelector('.navbar-nav');
      if (nav) {
        const observer = new MutationObserver(() => {
          const elementos = nav.querySelectorAll('li, a, button');
            elementos[0].remove();
            elementos[3].remove();
            observer.disconnect(); // corta la observación
        });    
        observer.observe(nav, { childList: true, subtree: true });
      }

      this.ohService.getOH().getLoader().close();
    }

}