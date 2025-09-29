import { Jpo, JpoError } from "@ovenfo/framework/lib/ohCore/services/jpo/oh.jpo";
import { OHService } from "@ovenfo/framework";

export class pMngdocumentEdit {resp_new_id : number; resp_result : number; resp_message : string};
export interface mngdocumentList_response {total ?: number};
export interface mngdocumentList_documents {document_id ?: number, title ?: string, document_type ?: number, document_type_Desc ?: string, file_path ?: string, comment ?: string, status ?: number, created_by ?: number, created_at ?: Date, updated_by ?: number, updated_at ?: Date};
export class pMngdocumentList {response : mngdocumentList_response; documents : mngdocumentList_documents[]};
export class pMngdocumentRegister {resp_new_id : number; resp_result : number; resp_message : string};

export class MNGDocumentServiceJPO {

    jpo : Jpo;

    constructor(private ohService : OHService){
        this.jpo = ohService.getOH().getJPO("ovnMNG","MNG","module.mng","MNGDocumentServiceImp");
    }

    mngdocumentEdit(fields : {
        document_id ?: number,
        title ?: string,
        document_type ?: number,
        file_path ?: string,
        comment ?: string,
        status ?: number,
        created_by ?: number,
        created_at ?: string,
        updated_by ?: number,
        updated_at ?: string
    }, call ? : { (resp: pMngdocumentEdit) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("mngdocumentEdit",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out = new pMngdocumentEdit();
                        if(rs){
                            out.resp_new_id = rs[0];
                            out.resp_result = rs[1];
                            out.resp_message = rs[2];
                        }
                    call(out);
                }
            },
            showLoader : true
        });
    }

    mngdocumentList(fields : {
        document_id ?: number,
        title ?: string,
        document_type ?: number,
        file_path ?: string,
        comment ?: string,
        status ?: number,
        created_by ?: number,
        created_at_from ?: string,
        created_at_to ?: string,
        updated_by ?: number,
        updated_at_from ?: string,
        updated_at_to ?: string,
        pf_page ?: number,
        pf_size ?: number
    }, call ? : { (resp: pMngdocumentList) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("mngdocumentList",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out = new pMngdocumentList();
                        if(rs[0] && rs[0][0]){
                            out.response = {total : rs[0][0][0]};
                        }
                        if(rs[1]){
                            out.documents = [];
                            for(var i = 0; i < rs[1].length; i++){
                                out.documents.push({document_id : rs[1][i][0], title : rs[1][i][1], document_type : rs[1][i][2], document_type_Desc : rs[1][i][3], file_path : rs[1][i][4], comment : rs[1][i][5], status : rs[1][i][6], created_by : rs[1][i][7], created_at : (rs[1][i][8])?this.ohService.getOH().getUtil().dateStringtoDate(rs[1][i][8]):null, updated_by : rs[1][i][9], updated_at : (rs[1][i][10])?this.ohService.getOH().getUtil().dateStringtoDate(rs[1][i][10]):null});
                            }
                        }
                    call(out);
                }
            },
            showLoader : true
        });
    }

    mngdocumentRegister(fields : {
        title ?: string,
        document_type ?: number,
        file_path ?: string,
        comment ?: string,
        status ?: number,
        created_by ?: number,
        created_at ?: string,
        updated_by ?: number,
        updated_at ?: string
    }, call ? : { (resp: pMngdocumentRegister) }, handlerError ?: { (resp: JpoError) }){
        this.jpo.get("mngdocumentRegister",{
            fields : fields,
            handlerError : handlerError,
            response : (rs) => {
                if(call){
                    var out = new pMngdocumentRegister();
                        if(rs){
                            out.resp_new_id = rs[0];
                            out.resp_result = rs[1];
                            out.resp_message = rs[2];
                        }
                    call(out);
                }
            },
            showLoader : true
        });
    }

}