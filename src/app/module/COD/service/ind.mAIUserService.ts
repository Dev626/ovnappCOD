import { Jpo, JpoError, OHService } from "@ovenfo/framework";


export interface seguserManageInitGet_configs {alias ?: string, config ?: string};
export interface seguserManageInitGet_rol {rol_id ?: number, rol_name ?: string, alias ?: string};
export class pSeguserManageInitGet {configs : seguserManageInitGet_configs[]; rol : seguserManageInitGet_rol[]};
export interface seguserManageList_response {total ?: number};
export interface seguserManageList_users {user_id ?: number, id ?: string, person_id ?: number, email ?: string, date_change_key ?: number, names ?: string, last_name ?: string, mother_last_name ?: string, active ?: string, roles ?: any, companies ?: any, user_registration_id ?: number, user_registration_name ?: string, user_registration_lastname ?: string, registration_date ?: Date, user_modification_id ?: number, user_modification_name ?: string, user_modification_lastname ?: string, modification_date ?: Date};
export class pSeguserManageList {response : seguserManageList_response; users : seguserManageList_users[]};
export class pSeguserManageRegister {resp_result : number; resp_message : string};
export interface seguserManageFindUser_user {user_id ?: number, id ?: string, names ?: string, last_name ?: string, mother_last_name ?: string, company_id ?: number, email ?: string, active ?: string, gmail_uid ?: string, person_id ?: number, person_fullname ?: string};
export interface seguserManageFindUser_roles {rol_id ?: number};
export class pSeguserManageFindUser {user : seguserManageFindUser_user; roles : seguserManageFindUser_roles[]};

export class MAIUserServiceJPO {

    jpo : Jpo;

    constructor(private ohService : OHService){
        this.jpo = ohService.getOH().getJPO("ovnMain","MAI","module.mai","MAIUserServiceImp");
    }

    seguserManageInitGet(fields : {
        system_prefix ?: string
    }, call ? : { (resp: pSeguserManageInitGet) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("seguserManageInitGet",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out = new pSeguserManageInitGet();
                        if(rs[0]){
                            out.configs = [];
                            for(var i = 0; i < rs[0].length; i++){
                                out.configs.push({alias : rs[0][i][0], config : rs[0][i][1]});
                            }
                        }
                        if(rs[1]){
                            out.rol = [];
                            for(var i = 0; i < rs[1].length; i++){
                                out.rol.push({rol_id : rs[1][i][0], rol_name : rs[1][i][1], alias : rs[1][i][2]});
                            }
                        }
                    call(out);
                }
            }
        });
    }

    seguserManageList(fields : {
        companies_id ?: string,
        user_id ?: number,
        id ?: string,
        email ?: string,
        fullname ?: string,
        active ?: string,
        roles ?: string,
        pf_page ?: number,
        pf_size ?: number
    }, call ? : { (resp: pSeguserManageList) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("seguserManageList",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out = new pSeguserManageList();
                        if(rs[0] && rs[0][0]){
                            out.response = {total : rs[0][0][0]};
                        }
                        if(rs[1]){
                            out.users = [];
                            for(var i = 0; i < rs[1].length; i++){
                                out.users.push({user_id : rs[1][i][0], id : rs[1][i][1], person_id : rs[1][i][2], email : rs[1][i][3], date_change_key : rs[1][i][4], names : rs[1][i][5], last_name : rs[1][i][6], mother_last_name : rs[1][i][7], active : rs[1][i][8], roles : (rs[1][i][9])?JSON.parse(rs[1][i][9]):null, companies : (rs[1][i][10])?JSON.parse(rs[1][i][10]):null, user_registration_id : rs[1][i][11], user_registration_name : rs[1][i][12], user_registration_lastname : rs[1][i][13], registration_date : (rs[1][i][14])?new Date(rs[1][i][14]):null, user_modification_id : rs[1][i][15], user_modification_name : rs[1][i][16], user_modification_lastname : rs[1][i][17], modification_date : (rs[1][i][18])?new Date(rs[1][i][18]):null});
                            }
                        }
                    call(out);
                }
            },
            showLoader : true
        });
    }

    seguserManageRegister(fields : {
        business_unit_id ?: number,
        company_id ?: number,
        user_id ?: number,
        id ?: string,
        system_prefix ?: string,
        person_id ?: number,
        key ?: string,
        key_real ?: string,
        key_change ?: string,
        email ?: string,
        names ?: string,
        last_name ?: string,
        mother_last_name ?: string,
        active ?: string,
        roles ?: string,
        user_registration_id ?: number
    }, call ? : { (resp: pSeguserManageRegister) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("seguserManageRegister",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out;
                        if(rs && rs[0]){
                            out = {resp_result : rs[0][0], resp_message : rs[0][1]};
                        }
                    call(out);
                }
            },
            showLoader : true
        });
    }

    seguserManageFindUser(fields : {
        user_id ?: number,
        id ?: string
    }, call ? : { (resp: pSeguserManageFindUser) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("seguserManageFindUser",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out = new pSeguserManageFindUser();
                        if(rs[0] && rs[0][0]){
                            out.user = {user_id : rs[0][0][0], id : rs[0][0][1], names : rs[0][0][2], last_name : rs[0][0][3], mother_last_name : rs[0][0][4], company_id : rs[0][0][5], email : rs[0][0][6], active : rs[0][0][7], gmail_uid : rs[0][0][8], person_id : rs[0][0][9], person_fullname : rs[0][0][10]};
                        }
                        if(rs[1]){
                            out.roles = [];
                            for(var i = 0; i < rs[1].length; i++){
                                out.roles.push({rol_id : rs[1][i][0]});
                            }
                        }
                    call(out);
                }
            },
            showLoader : true
        });
    }

}
