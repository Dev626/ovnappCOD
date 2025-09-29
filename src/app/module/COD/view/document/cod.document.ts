import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CoreService, ohLoadSubModule, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MNGDocumentServiceJPO, pMngdocumentList, pMngdocumentRegister } from '../../service/mng.mNGDocumentService';


export interface DocumentModel {
	id: number;
	title: string;
	type: string;
	typeDesc?: string;
	fileName: string;
	fileExtension: string;
	fileSize: string;
	uploadDate: Date;
	createdBy: string;
	filePath?: string;
	fileUrl?: string;
  user_registration_id?: number;
  user_registration_name?: string;
  user_registration_lastname?: string;
}


export interface DocumentFilter {
	title?: string;
	type?: string;
	extension?: string;
	dateFrom?: Date;
	dateTo?: Date;
}


export interface NewDocument {
	title: string;
	type: string;
}

@Component({
	templateUrl: './cod.document.html'
})
export class Document extends CODBase implements OnInit, AfterViewInit, OnDestroy {

	/* servicio */
	private mNGDocumentService: MNGDocumentServiceJPO
	/* catalogo */
	catalogo: any = {}
	pagin: any = {}
	// ViewChild para los modales
	@ViewChild('modalDocumentFilter') modalDocumentFilter!: TemplateRef<any>;
	@ViewChild('modalNewDocument') modalNewDocument!: TemplateRef<any>;
	@ViewChild('modalPDFPreview') modalPDFPreview!: TemplateRef<any>;


	documents: DocumentModel[] = [];

  ldocuments: any = []
	filteredDocuments: DocumentModel[] = [];
	searchTerm: string = '';


	filterData: DocumentFilter = {};


	newDocument: any = {}
	selectedFile: File | null = null;
	selectedFileName: string = '';


	previewDocument: DocumentModel | null = null;
	pdfPreviewUrl: SafeResourceUrl | null = null;


	private filterModalRef: NgbModalRef | undefined;
	private newDocumentModalRef: NgbModalRef | undefined;
	private pdfPreviewModalRef: NgbModalRef | undefined;

	constructor(
		private ohService: OHService,
		public override cse: CoreService,
		public override ccs: CODCoreService,
		private sanitizer: DomSanitizer,
		private modalService: NgbModal
	) {
		super(ohService, cse, ccs);

		/* servicio */
		this.mNGDocumentService = new MNGDocumentServiceJPO(ohService)
this.mngdocumentList();

this.pagin = {
			page: 1,
			total: 0,
			size_rows: 10,
		}
		/* catalogo */
		new ohLoadSubModule(cse).mapOnlyCatalogs([
			{ id: 62471, nombre: 'mng_cat_type_file' },
			{ id: 41854, nombre: 'person_contact_type' }
		])
			.then((it) => {
				this.catalogo = it;
				console.log('this.catalogo:', this.catalogo)
			})
	}

	ngOnInit() {
		/* Cargar documentos desde el servicio */

	}

	ngAfterViewInit() {

	}

	ngOnDestroy() {
		this.closeAllModals();
	}

	/* servicio - Listar documentos */
	mngdocumentList(){
    this.mNGDocumentService.mngdocumentList({
        // document_id : 0, // Optional
        // title : "", // Optional
        // document_type : 0, // Optional
        // file_path : "", // Optional
        // comment : "", // Optional
        // status : 0, // Optional
        // created_by : 0, // Optional
        // created_at_from : "", // Optional
        // created_at_to : "", // Optional
        // updated_by : 0, // Optional
        // updated_at_from : "", // Optional
        // updated_at_to : "", // Optional
        // pf_page : 0, // Optional
        // pf_size : 0 // Optional
    }, (resp : pMngdocumentList) => {
      this.pagin.total = resp.response
      this.ldocuments =resp.documents
      console.log('resp:', resp)

      })
  }


	loadDocuments(): void {
		// Este método ya no es necesario porque cargamos desde el servicio
		// Puedes eliminarlo o dejarlo como respaldo en caso de que el servicio falle
	}

	filterDocuments(): void {
		if (!this.searchTerm.trim()) {
			this.filteredDocuments = [...this.documents];
			return;
		}

		const term = this.searchTerm.toLowerCase();
		this.filteredDocuments = this.documents.filter(doc =>
			doc.title.toLowerCase().includes(term) ||
			doc.type.toLowerCase().includes(term) ||
			(doc.typeDesc && doc.typeDesc.toLowerCase().includes(term)) ||
			doc.fileExtension.toLowerCase().includes(term) ||
			doc.createdBy.toLowerCase().includes(term)
		);
	}


	applyAdvancedFilters(): void {
		this.filteredDocuments = this.documents.filter(doc => {
			let matches = true;

			if (this.filterData.title) {
				matches = matches && doc.title.toLowerCase().includes(this.filterData.title.toLowerCase());
			}

			if (this.filterData.type) {
				matches = matches && doc.type === this.filterData.type;
			}

			if (this.filterData.extension) {
				matches = matches && doc.fileExtension.toLowerCase() === this.filterData.extension.toLowerCase();
			}

			if (this.filterData.dateFrom) {
				matches = matches && doc.uploadDate >= this.filterData.dateFrom;
			}

			if (this.filterData.dateTo) {
				matches = matches && doc.uploadDate <= this.filterData.dateTo;
			}

			return matches;
		});
	}


	clearFilters(): void {
		this.filterData = {};
		this.searchTerm = '';
		this.filteredDocuments = [...this.documents];
	}


	trackByDocumentId(index: number, doc: DocumentModel): number {
		return doc.id;
	}

	openFilterModal(): void {
		this.filterModalRef = this.modalService.open(this.modalDocumentFilter, {
			size: 'lg',
			backdrop: 'static'
		});

		this.filterModalRef.result.then((result: string) => {
			if (result === 'doFilter') {
				this.applyAdvancedFilters();
			} else if (result === 'clearFilter') {
				this.clearFilters();
			}
		}).catch(() => {

		});
	}


	openNewDocumentModal(): void {
		this.resetNewDocumentForm();

		this.newDocumentModalRef = this.modalService.open(this.modalNewDocument, {
			size: 'lg',
			backdrop: 'static'
		});

		this.newDocumentModalRef.result.then((result: string) => {
			if (result === 'save') {
				// El guardado se maneja en saveDocument()
			}
		}).catch(() => {
			this.resetNewDocumentForm();
		});
	}


	private resetNewDocumentForm(): void {
		this.newDocument = {
			title: '',
			type: ''
		};
		this.selectedFile = null;
		this.selectedFileName = '';
	}


	onFileSelected(event: any): void {
		const file = event.target.files[0];
		if (file) {
			// Validar tamaño del archivo (10MB)
			if (file.size > 10 * 1024 * 1024) {
				console.error('El archivo no puede ser mayor a 10MB');
				alert('El archivo no puede ser mayor a 10MB');
				// Limpiar el input
				event.target.value = '';
				return;
			}

			this.selectedFile = file;
			this.selectedFileName = file.name;
		}
	}

	saveDocument(): void {
		if (!this.newDocument.title || !this.newDocument.type || !this.selectedFile) {
			console.warn('Complete todos los campos obligatorios');
			alert('Por favor complete todos los campos obligatorios');
			return;
		}

		// Preparar los campos para el servicio
		const fields = {
			title: this.newDocument.title,
			document_type: parseInt(this.newDocument.type),
			status: 1, // Estado activo por defecto
			created_by: this.cse.data.user.data.userid // ID del usuario actual desde CoreService
		};

		// Preparar el archivo para envío
		const files = {
			document_file: this.selectedFile // El nombre debe coincidir con lo que espera el backend
		};

		// Variable para controlar el loading
		const loading = { value: false };

		console.log('Guardando documento...', fields);

		// Llamar al servicio de registro
		this.mNGDocumentService.mngdocumentRegister(
			fields,
			files,
			loading,
			(resp: pMngdocumentRegister) => {
				console.log('Respuesta del servidor:', resp);

				// Verificar si el registro fue exitoso
				if (resp.resp_result === 1 || resp.resp_result === '1' as any) {
					console.log('Documento guardado correctamente');

					// Mostrar mensaje de éxito
					alert(resp.resp_message || 'Documento registrado exitosamente');

					// Limpiar el formulario
					this.resetNewDocumentForm();

					// Cerrar el modal
					if (this.newDocumentModalRef) {
						this.newDocumentModalRef.close('save');
					}

					// Recargar la lista de documentos desde el servidor
					this.mngdocumentList();

				} else {
					// Mostrar mensaje de error
					console.error('Error al guardar:', resp.resp_message);
					alert(resp.resp_message || 'Error al guardar el documento');
				}
			},
			(error) => {
				// Callback de error
				console.error('Error en el servicio:', error);
				alert('Ocurrió un error al guardar el documento. Por favor intente nuevamente.');
			}
		);
	}


	previewPDF(document: DocumentModel): void {
		if (document.fileExtension.toLowerCase() !== 'pdf') {
			console.warn('Solo se pueden previsualizar archivos PDF');
			alert('Solo se pueden previsualizar archivos PDF');
			return;
		}

		this.previewDocument = document;

		// Construir URL del documento
		const pdfUrl = document.filePath || `/api/documents/${document.id}/preview`;
		this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);

		this.pdfPreviewModalRef = this.modalService.open(this.modalPDFPreview, {
			size: 'xl',
			backdrop: 'static'
		});

		this.pdfPreviewModalRef.result.then(() => {
			this.pdfPreviewUrl = null;
			this.previewDocument = null;
		}).catch(() => {
			this.pdfPreviewUrl = null;
			this.previewDocument = null;
		});
	}


	downloadDocument(document: DocumentModel): void {
		// Construir URL de descarga
		const downloadUrl = document.filePath || `/api/documents/${document.id}/download`;

		// Crear elemento temporal para descargar
		const link = window.document.createElement('a');
		link.href = downloadUrl;
		link.download = document.fileName;
		window.document.body.appendChild(link);
		link.click();
		window.document.body.removeChild(link);

		console.log('Iniciando descarga del documento:', document.fileName);
	}


	private getFileExtension(filename: string): string {
		if (!filename) return '';
		return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
	}

	private getFileNameFromPath(filepath: string): string {
		if (!filepath) return '';
		return filepath.split('/').pop() || filepath;
	}


	private formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}


	private closeAllModals(): void {
		if (this.filterModalRef) {
			this.filterModalRef.dismiss();
		}
		if (this.newDocumentModalRef) {
			this.newDocumentModalRef.dismiss();
		}
		if (this.pdfPreviewModalRef) {
			this.pdfPreviewModalRef.dismiss();
		}
	}
}
