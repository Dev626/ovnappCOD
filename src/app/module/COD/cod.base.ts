import { CoreService, ohLoadSubModule, OHService, ohStorage } from '@ovenfo/framework'

import { CODCoreService } from './cod.coreService'

export class CODBase {

    public precarga : Promise<any>
    mapLoadObj: ohLoadSubModule
    storage : ohStorage

    constructor(ohService : OHService, public cse : CoreService, public ccs : CODCoreService){

        this.storage = new ohStorage()
        this.mapLoadObj = new ohLoadSubModule(cse, this.ccs, "OVN_COD_DATA")
        this.precarga = this.mapLoadObj.mapLoad([
            { id: 62471, nombre: 'mng_cat_type_file'}
        ], this.instance())

    }

    instance() {
        return new Promise<void>((resolve, reject) => {
            if (!this.mapLoadObj.check()) {
                resolve()
                return
            }
            // Implement rest Service
           resolve()
        })
   }
}
