import { Component, AfterViewInit, OnInit, OnDestroy, Input } from '@angular/core';

import { CoreService, ohLoadSubModule, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MAIUserServiceJPO, pSeguserManageFindUser, pSeguserManageInitGet, pSeguserManageRegister, seguserManageInitGet_configs, seguserManageInitGet_rol, seguserManageList_users } from '../../../service/ind.mAIUserService';
import { ActivatedRoute, Router } from '@angular/router';

declare var AesUtil: any;

@Component({
	templateUrl: './cod.userNew.html'
})
export class UserNew extends CODBase implements OnInit, AfterViewInit, OnDestroy {
  private mAIUserService: MAIUserServiceJPO;

  @Input() system_prefix: string = 'DOC';
  @Input() company_id: number = 144;

  dataInit?: /* Datainit | pSeguserManageInitGet */ any;

  catalogo: any = {};
  oUser: any = {};
  addresses: any = [];
  contacs: any = [];
  user_id: number;
  index_edition: number;
  oAddress: any = {};
  oPersonContact: any = {};
  anadir_usuario: boolean;
  seguridad: any = {};
  flag_checked: boolean;

	constructor(private ohService: OHService, public override cse: CoreService, public override ccs: CODCoreService, private router: Router, private route: ActivatedRoute){
		super(ohService, cse, ccs);
    this.mAIUserService = new MAIUserServiceJPO(ohService);
    this.seguridad = this.storage.item('OVN_SYSTEM', 'sistema').configuracion; 
    new ohLoadSubModule(cse).mapOnlyCatalogs([
        { id: 41857, nombre: 'person_document_type' },
        { id: 41854, nombre: 'person_contact_type' }
      ])
      .then((it) => {
        this.catalogo = it;
      });
	}

	ngOnInit(){
    this.route.params.subscribe((params) => {
      if (params && params['id']) {
        this.user_id = Number(params['id']);
        Promise.all([
          this.seguserManageInitGet(),
          this.seguserManageGetUser()
        ]).then((values) => {
          console.log('values:', values)
          var _dataint = values[0];
          this.dataInit = _dataint;
          this.dataInit['_configs'] = this.mapConfigs(_dataint['configs']);

          this.flag_checked = true;
          this.mapUser(values[1]);
        });
      } else {
        this.oUser.active = '1';
        this.oUser.key_change = true;
        Promise.all([this.seguserManageInitGet()]).then((values) => {
          console.log('values:', values)
          var _dataint = values[0];
          this.dataInit = _dataint;
          this.dataInit['_configs'] = this.mapConfigs(_dataint['configs']);
        });
      }
    });

	}

	ngAfterViewInit(){

	}

	ngOnDestroy(){

	}

  seguserManageInitGet() {
    return new Promise<pSeguserManageInitGet>((resolve, reject) => {
      this.mAIUserService.seguserManageInitGet(
        {
          system_prefix: this.system_prefix
        },
        (resp) => {
          resolve(resp);
        }
      );
    });
  }

  private mapConfigs(configs : seguserManageInitGet_configs[]) {
    console.log('configs:', configs)
    let _configs = {};
    configs.forEach((it) => {
      _configs[it.alias] = it.config;
    });
    return _configs;
  }

  admpersonSearch = (searchField: string) => {
    // return this.mAIPersonService.admpersonSearch(
    //   {
    //     fullname: searchField,
    //     company_id: this.company_id,
    //     system_prefix: this.system_prefix
    //   },
    //   (resp: pAdmpersonSearch[]) => {
    //     return resp;
    //   }
    // );
  };

  onSelectPerson($event?: any) {
    if ($event) {
      this.oUser.person_fullname = $event.fullname;
      this.oUser.email = $event.email ? $event.email.toUpperCase() : null;
      this.oUser.names = $event.first_name
        ? $event.first_name.toUpperCase()
        : null;
      this.oUser.last_name = $event.last_name
        ? $event.last_name.toUpperCase()
        : null;
      this.oUser.mother_last_name = $event.mother_last_name
        ? $event.mother_last_name.toUpperCase()
        : null;
    } else {
      this.oUser.person_fullname = null;
    }
  }

  seguserManageGetUser() {
    return new Promise<pSeguserManageFindUser>((resolve, reject) => {
      this.mAIUserService.seguserManageFindUser(
        {
          user_id: this.user_id
        },
        (resp: pSeguserManageFindUser) => {
          resolve(resp);
        }
      );
    });
  }

  seguserManageFindUser() {
    this.mAIUserService.seguserManageFindUser(
      {
        id: this.oUser.id
      },
      (resp: pSeguserManageFindUser) => {
        if (resp.user) {
          this.ohService
            .getOH()
            .getUtil()
            .confirm(
              'El usuario ya esta registrado, desea editarlo?',
              () => {
                this.mapUser(resp);
                this.flag_checked = true;
              },
              () => {
                this.oUser.id = null;
              }
            );
        } else {
          this.ohService.getOH().getAd().success('Id disponible a registrar');
          this.flag_checked = true;
        }
      }
    );
  }

  mapUser(resp : pSeguserManageFindUser) {
    this.oUser = resp.user;
    this.dataInit.rol.forEach((it) => {
      it['selected'] = resp.roles.find((et) => et.rol_id == it.rol_id)
        ? true
        : false;
    });
    this.rolSelect();
  }

  rolSelect() {
    let roles = this.dataInit.rol.filter((it) => it['selected'] == true);
    if (roles && roles.length > 0) {
      this.oUser.roles = JSON.stringify(roles);
    } else {
      this.oUser.roles = null;
    }
  }

  save() {
    this.ohService
      .getOH()
      .getUtil()
      .confirm('Confirma grabar el usuario?', () => {
        this.seguserManageRegister();
      });
  }

  close() {
    this.ohService
      .getOH()
      .getUtil()
      .confirm('Confirma cerrar?', () => {
        if (this.oUser.user_id) {
          this.router.navigate(['../../'], { relativeTo: this.route });
        } else {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  seguserManageRegister() {
    this.mAIUserService.seguserManageRegister(
      {
        business_unit_id: this.cse.data.user.profile,
        company_id: this.company_id,
        user_id: this.oUser.user_id,
        id: this.oUser.id,
        system_prefix: this.system_prefix,
        person_id: this.oUser.person_id,
        key: this.oUser.key_change
          ? new AesUtil(this.cse.cseShared.key_send).encrypt(this.oUser.key)
          : null,
        key_change: this.oUser.key_change ? '1' : '0',
        email: this.oUser.email,
        names: this.oUser.names,
        last_name: this.oUser.last_name,
        mother_last_name: this.oUser.mother_last_name,
        active: this.oUser.active,
        roles: this.oUser.roles,
        user_registration_id: this.cse.data.user.data.userid
      },
      (resp: pSeguserManageRegister) => {
        if (resp.resp_result == 1) {
          this.ohService.getOH().getAd().success(resp.resp_message);
          if (this.oUser.user_id) {
            this.router.navigate(['../../'], { relativeTo: this.route });
          } else {
            this.router.navigate(['../'], { relativeTo: this.route });
          }
        } else if (resp.resp_result == 2) {
          this.ohService.getOH().getAd().warning(resp.resp_message);
        } else {
          this.ohService.getOH().getLoader().showError(resp.resp_message);
        }
      }
    );
  }

  segusuarioObtenerId() {}


}
