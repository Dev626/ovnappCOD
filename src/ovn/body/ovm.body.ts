import { Component, OnInit, ViewChild } from '@angular/core';
import { CoreService, OHService } from '@ovenfo/framework';
import { Ad } from '@ovenfo/framework/lib/ohCore/components/ad/oh.ad';
import { Camera } from '@ovenfo/framework/lib/ohCore/components/camera/oh.camera';
import { Loader } from '@ovenfo/framework/lib/ohCore/components/loader/oh.loader';
import { shared } from 'src/environments/environmentShared';
declare var ovenfodata
@Component({
  selector: 'ovm-body',
  templateUrl: './ovm.body.html'
})
export class OVMBody implements OnInit {
    @ViewChild('adId', { static: true }) objAd : Ad;
    @ViewChild('loaderId', { static: true }) objLoader : Loader;
    @ViewChild('cameraId', { static: true }) objCamera : Camera;
    constructor(private ohService : OHService, private cse : CoreService) { 
        this.cse.initCoreService()
    }
    ngOnInit(){
        this.ohService.initialize(this.objLoader, this.objAd, this.objCamera, {
            emailAdm : shared.support.email,
            number : shared.support.number,
            annexed : shared.support.anex,
            title : shared.support.title
        }, this.cse.config, this.cse.ovn_main.logs);
    }
    ngAfterViewInit(){
        ovenfodata.closeLoader()
    }
}