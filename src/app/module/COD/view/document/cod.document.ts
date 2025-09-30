import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CoreService, ohLoadSubModule, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MNGDocumentServiceJPO, pMngdocumentGet, pMngdocumentList, pMngdocumentRegister } from '../../service/mng.mNGDocumentService';
import { MNGDocumentFileService } from '../../service/mng.mNGDocumentFileService';


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
	private mNGDocumentFileService: MNGDocumentFileService
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
	isLoadingPdf: boolean = false;
	// Variable para guardar la URL del blob y poder revocarla
	private currentBlobUrl: string | null = null;


	private filterModalRef: NgbModalRef | undefined;
	private newDocumentModalRef: NgbModalRef | undefined;
	private pdfPreviewModalRef: NgbModalRef | undefined;

	constructor(
		private ohService: OHService,
		public override cse: CoreService,
		public override ccs: CODCoreService,
		private sanitizer: DomSanitizer,
		private modalService: NgbModal,
		private fileService: MNGDocumentFileService
	) {
		super(ohService, cse, ccs);

		/* servicio */
		this.mNGDocumentService = new MNGDocumentServiceJPO(ohService)
		this.mNGDocumentFileService = fileService;
		this.mngdocumentList();

		this.pagin = {
			page: 1,
			total: 0,
			size_rows: 10,
		}
		/* catalogo */
		new ohLoadSubModule(cse).mapOnlyCatalogs([
			{ id: 62471, nombre: 'mng_cat_type_file' }
		]).then((it) => {
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
		// Limpiar recursos de blob si existen
		this.cleanupPdfPreview();
	}

	openPdf(document_id) {
		this.fileService.getFileDocument(document_id, false).subscribe(response => {
			const blob = response.body as Blob;
			const fileURL = URL.createObjectURL(blob);
			window.open(fileURL); // previsualiza si es PDF
		});
	}

	saveFile(document_id) {
		this.fileService.getFileDocument(document_id, true).subscribe(response => {
			const blob = response.body as Blob;

			// 👇 recuperar filename desde los headers
			let filename = 'documento.pdf';
			const contentDisposition = response.headers.get('Content-Disposition');
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="?([^"]+)"?/);
				if (match && match[1]) {
					filename = match[1];
				}
			}

			const a = document.createElement('a');
			const fileURL = URL.createObjectURL(blob);
			a.href = fileURL;
			a.download = filename; // 👈 ahora usa el nombre real
			a.click();
			URL.revokeObjectURL(fileURL);
		});
	}

	/* servicio - Listar documentos */
	mngdocumentList() {
		this.mNGDocumentService.mngdocumentList({
			// document_id : 6, // Optional
			// title : "", // Optional
			// document_type : 0, // Optional
			// file_name : "", // Optional
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
		}, (resp: pMngdocumentList) => {
			this.pagin.total = resp.response
			this.ldocuments = resp.documents
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
		console.log('files:', files)
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

	/**
	 * Previsualiza un documento PDF en un modal
	 * Solo permite PDFs y descarga el archivo del servidor usando el servicio
	 */
	previewPDF(document: DocumentModel): void {
		// Validar que sea un PDF
		if (document.fileExtension.toLowerCase() !== 'pdf') {
			console.warn('Solo se pueden previsualizar archivos PDF');
			alert('Solo se pueden previsualizar archivos PDF');
			return;
		}

		this.previewDocument = document;
		this.isLoadingPdf = true;

		// Abrir el modal inmediatamente (mostrará loading)
		this.pdfPreviewModalRef = this.modalService.open(this.modalPDFPreview, {
			size: 'xl',
			backdrop: 'static',
			keyboard: true
		});

		// Configurar limpieza al cerrar el modal
		this.pdfPreviewModalRef.result.then(
			() => this.cleanupPdfPreview(),
			() => this.cleanupPdfPreview()
		);

		// Llamar al servicio para obtener el PDF
		this.mNGDocumentFileService.getFileDocument(document.id, false).subscribe({
			next: (response) => {
				const blob = response.body;

				// Validar que el blob exista
				if (!blob) {
					console.error('No se recibió el archivo del servidor');
					alert('Error: No se pudo cargar el documento');
					this.closePdfPreview();
					return;
				}

				// Validar que sea un PDF válido
				if (blob.type !== 'application/pdf') {
					console.error('El archivo no es un PDF válido. Tipo:', blob.type);
					alert('El archivo descargado no es un PDF válido');
					this.closePdfPreview();
					return;
				}

				// Crear URL del blob
				this.currentBlobUrl = URL.createObjectURL(blob);
				this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentBlobUrl);
				this.isLoadingPdf = false;

				console.log('PDF cargado correctamente:', document.fileName);
			},
			error: (error) => {
				console.error('Error al cargar el PDF:', error);
				this.isLoadingPdf = false;

				// Mensaje de error más específico
				let errorMessage = 'Error al cargar el documento. ';
				if (error.status === 404) {
					errorMessage += 'El archivo no fue encontrado.';
				} else if (error.status === 403) {
					errorMessage += 'No tiene permisos para acceder a este archivo.';
				} else if (error.status === 0) {
					errorMessage += 'No se pudo conectar con el servidor.';
				} else {
					errorMessage += 'Por favor, intente nuevamente.';
				}

				alert(errorMessage);
				this.closePdfPreview();
			}
		});
	}

	/**
	 * Cierra el modal de previsualización de PDF
	 */
	closePdfPreview(): void {
		if (this.pdfPreviewModalRef) {
			this.pdfPreviewModalRef.close();
		}
	}

	/**
	 * Limpia los recursos del PDF (blob URL) para evitar memory leaks
	 */
	private cleanupPdfPreview(): void {
		// Liberar la URL del blob si existe
		if (this.currentBlobUrl) {
			URL.revokeObjectURL(this.currentBlobUrl);
			this.currentBlobUrl = null;
		}

		// Limpiar variables
		this.pdfPreviewUrl = null;
		this.previewDocument = null;
		this.isLoadingPdf = false;
	}

	downloadDocument(doc: DocumentModel): void {
		console.log('Iniciando descarga del documento:', doc.fileName);

		// Usar el servicio para descargar
		this.mNGDocumentFileService.getFileDocument(doc.id, true).subscribe({
			next: (response) => {
				const blob = response.body;

				if (!blob) {
					console.error('No se recibió el archivo del servidor');
					alert('Error al descargar el documento');
					return;
				}

				// Obtener el nombre del archivo desde los headers
				let filename = doc.fileName;
				const contentDisposition = response.headers.get('Content-Disposition');
				if (contentDisposition) {
					const match = contentDisposition.match(/filename="?([^"]+)"?/);
					if (match && match[1]) {
						filename = match[1];
					}
				}

				// Crear enlace temporal para descargar
				const a = window.document.createElement('a');
				const fileURL = URL.createObjectURL(blob);
				a.href = fileURL;
				a.download = filename;
				window.document.body.appendChild(a);
				a.click();
				window.document.body.removeChild(a);

				// Liberar el blob URL después de un momento
				setTimeout(() => URL.revokeObjectURL(fileURL), 100);

				console.log('Descarga iniciada:', filename);
			},
			error: (error) => {
				console.error('Error al descargar el documento:', error);
				alert('Error al descargar el documento. Por favor, intente nuevamente.');
			}
		});
	}


	/**
	 * Mapea un item de la lista a DocumentModel para usar en preview/download
	 */
	mapToDocumentModel(item: any): DocumentModel {
		return {
			id: item.document_id,
			title: item.title || '',
			type: item.document_type?.toString() || '',
			typeDesc: item.document_type_desc || '',
			fileName: item.file_name || '',
			fileExtension: this.getFileExtension(item.file_name),
			fileSize: item.file_size || '0',
			uploadDate: item.created_at ? new Date(item.created_at) : new Date(),
			createdBy: item.created_by_desc || '',
			filePath: item.file_path || '',
			user_registration_id: item.created_by,
			user_registration_name: item.user_registration_name || '',
			user_registration_lastname: item.user_registration_lastname || ''
		};
	}

	getFileExtension(filename: string): string {
		if (!filename) return '';
		const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
		return ext.toLowerCase();
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
