import { Component, AfterViewInit, OnInit, OnDestroy, Input } from '@angular/core';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MAIUserServiceJPO, pSeguserManageInitGet, seguserManageInitGet_configs, seguserManageInitGet_rol, seguserManageList_users } from '../../service/ind.mAIUserService';

@Component({
	templateUrl: './cod.user.html'
})
export class User extends CODBase implements OnInit, AfterViewInit, OnDestroy {
  @Input() system_prefix: string = 'COD';
  @Input() company_id: number = 144;

  private mAIUserService : MAIUserServiceJPO;

  dataInit: any = {};

  // roles: seguserManageInitGet_rol[] = null;
  roles = [
    // {"rol_id":137,"rol_name":"Document Approver","alias":"cod_doc_approver"},
    {"rol_id":138,"rol_name":"Document Submitter","alias":"cod_doc_submitter"}
  ]
  pagin: any;
  filterClient: any;

  rolesfin: any = [];
  lUsers: any[] = [];

	constructor(private ohService: OHService, public override cse: CoreService, public override ccs: CODCoreService){
		super(ohService, cse, ccs);
    
    this.mAIUserService = new MAIUserServiceJPO(ohService);

    this.pagin = {
      page: 1,
      total: 0,
      size_rows: 10
    };

    this.initFilter();
	}

	ngOnInit(){
    this.seguserManageInitGet();
	}

	ngAfterViewInit(){

	}

	ngOnDestroy(){

	}

  initFilter() {
    this.filterClient = {
      startList: false,
      field: {},
      fields: {
        user_id: {
          label: 'Usuario id',
          type: '',
          closeFilter: true
        },
        id: {
          label: 'Alias',
          type: '',
          closeFilter: true
        },
        email: {
          label: 'Correo',
          type: '',
          closeFilter: true
        },
        fullname: {
          label: 'Nombre completo',
          type: '',
          closeFilter: true
        },
        roles: {
          label: 'Roles',
          type: 'list',
          value_id: 'rol_id',
          value_desc: 'rol_name',
          closeFilter: false,
          beforeFilter: (active: any) => {
            if (this.roles && this.roles.length > 0) {
              this.roles.forEach((it) => {
                if (
                  active.value &&
                  active.value.find((at) => at.rol_id == it.rol_id)
                ) {
                  it['selected'] = true;
                } else {
                  it['selected'] = false;
                }
              });
            }
          }
        }
      }
    };
  }

  seguserManageList() {
    this.mAIUserService.seguserManageList(
      {
        companies_id: JSON.stringify([{ company_id: this.company_id }]),
        user_id: this.filterClient.fields.user_id.value,
        id: this.filterClient.fields.id.value,
        email: this.filterClient.fields.email.value,
        fullname: this.filterClient.fields.fullname.value,
        roles: JSON.stringify(this.roles),
        pf_page: this.pagin.page,
        pf_size: this.pagin.size_rows
      },
      (resp) => {
        this.pagin.total = resp.response.total;
        this.lUsers = resp.users;
      }
    );
  }

  rolSelect() {
    let roles = this.roles.filter((it) => it['selected'] == true);
    if (roles && roles.length > 0) {
      this.rolesfin = JSON.stringify(roles);
      this.filterClient.field.roles.value = roles;
    } else {
      this.rolesfin = null;
    }
  }

  mapConfigs(configs: seguserManageInitGet_configs[]) {
    let _configs = {};
    configs.forEach((it) => {
      _configs[it.alias] = it.config;
    });
    return _configs;
  }

  seguserManageInitGet() {
    this.mAIUserService.seguserManageInitGet(
      {
        system_prefix: this.system_prefix
      },
      (resp : pSeguserManageInitGet) => {
        console.log('resp:', resp)
        // this.roles = resp.rol;
        this.dataInit = resp;
        this.dataInit['_configs'] = this.mapConfigs(resp.configs);
      }
    );
  }

}
