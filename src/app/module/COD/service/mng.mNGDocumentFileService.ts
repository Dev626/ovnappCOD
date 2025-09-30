import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MNGDocumentFileService {
  private baseUrl: string;

  constructor(private http?: HttpClient) {
    this.baseUrl = `${environment.protocol}://${environment.host.ovnMNG}`;
  }

  /**
   * Descarga o previsualiza un documento
   * @param id id del documento
   * @param download true = siempre descarga / false = si es PDF previsualiza
   */
  getFileDocument(document_id: number, download: boolean = false) {
    const url = `${this.baseUrl}ovnMNG/module/mng/MNGDocumentServiceImp/mngdocument/${document_id}/file?download=${download}`;
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response' // 👈 importante para leer headers
    });
  }

}