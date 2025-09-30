import { Injectable } from '@angular/core'

@Injectable()
export class CODCoreService {

    public data : any = {}
    public config : any = {
      rol_kudo: {
            approver: 'cod_doc_approver',
            submitter: 'cod_doc_submitter',
        },
    }

}
