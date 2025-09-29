import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CoreService, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MNGDocumentServiceJPO, pMngdocumentList } from '../../service/mng.mNGDocumentService';


export interface DocumentModel {
	id: number;
	title: string;
	type: string;
	fileName: string;
	fileExtension: string;
	fileSize: string;
	uploadDate: Date;
	createdBy: string;
	filePath?: string;
	fileUrl?: string;
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


export interface DocumentModel {
	id: number;
	title: string;
	type: string;
	fileName: string;
	fileExtension: string;
	fileSize: string;
	uploadDate: Date;
	createdBy: string;
	filePath?: string;
	fileUrl?: string;
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  private mNGDocumentService : MNGDocumentServiceJPO

	constructor(private ohService : OHService, public override cse : CoreService, public override ccs : CODCoreService){
tashed changes

	@ViewChild('modalDocumentFilter') modalDocumentFilter!: TemplateRef<any>;
	@ViewChild('modalNewDocument') modalNewDocument!: TemplateRef<any>;
	@ViewChild('modalPDFPreview') modalPDFPreview!: TemplateRef<any>;


	documents: DocumentModel[] = [];
	filteredDocuments: DocumentModel[] = [];
	searchTerm: string = '';


	filterData: DocumentFilter = {};


	newDocument: NewDocument = {
		title: '',
		type: ''
	};
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
		super(ohService, cse, ccs);
    this.mNGDocumentService = new MNGDocumentServiceJPO(ohService)
	}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
	ngOnInit(){
    this.mngdocumentList();
=======
=======
>>>>>>> Stashed changes
	ngOnInit() {
		this.loadDocuments();
	}

	ngAfterViewInit() {
<<<<<<< Updated upstream

>>>>>>> Stashed changes
	}

	ngOnDestroy() {

		this.closeAllModals();
	}


	loadDocuments(): void {

		this.documents = [
			{
				id: 1,
				title: 'Contrato de Servicios 2024',
				type: 'contrato',
				fileName: 'contrato_servicios_2024.pdf',
				fileExtension: 'pdf',
				fileSize: '2.5 MB',
				uploadDate: new Date('2025-09-15'),
				createdBy: 'Juan Pérez',
				filePath: '/documents/contrato_servicios_2024.pdf'
			},
			{
				id: 2,
				title: 'Acta de Reunión - Septiembre',
				type: 'acta',
				fileName: 'acta_reunion_septiembre.pdf',
				fileExtension: 'pdf',
				fileSize: '1.8 MB',
				uploadDate: new Date('2025-09-20'),
				createdBy: 'María García',
				filePath: '/documents/acta_reunion_septiembre.pdf'
			},
			{
				id: 3,
				title: 'Imagen de Logo Corporativo',
				type: 'otro',
				fileName: 'logo_corporativo.png',
				fileExtension: 'png',
				fileSize: '500 KB',
				uploadDate: new Date('2025-09-18'),
				createdBy: 'Carlos López',
				filePath: '/documents/logo_corporativo.png'
			},
			{
				id: 4,
				title: 'Carta Comercial Q3-2024',
				type: 'carta',
				fileName: 'carta_comercial_q3.pdf',
				fileExtension: 'pdf',
				fileSize: '1.2 MB',
				uploadDate: new Date('2025-09-22'),
				createdBy: 'Ana Martínez',
				filePath: '/documents/carta_comercial_q3.pdf'
			},
			{
				id: 5,
				title: 'Informe Mensual Agosto 2025',
				type: 'informe',
				fileName: 'informe_agosto_2025.docx',
				fileExtension: 'docx',
				fileSize: '3.2 MB',
				uploadDate: new Date('2025-08-25'),
				createdBy: 'Roberto Silva',
				filePath: '/documents/informe_agosto_2025.docx'
			}
		];

		this.filteredDocuments = [...this.documents];
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
			if (file.size > 10 * 1024 * 1024) {
				console.error('El archivo no puede ser mayor a 10MB');
				return;
			}

			this.selectedFile = file;
			this.selectedFileName = file.name;
		}
	}


	saveDocument(): void {
		if (!this.newDocument.title || !this.newDocument.type || !this.selectedFile) {
			console.warn('Complete todos los campos obligatorios');
			return;
		}

		const newDoc: DocumentModel = {
			id: this.documents.length + 1,
			title: this.newDocument.title,
			type: this.newDocument.type,
			fileName: this.selectedFile.name,
			fileExtension: this.getFileExtension(this.selectedFile.name),
			fileSize: this.formatFileSize(this.selectedFile.size),
			uploadDate: new Date(),
			createdBy: 'Usuario Actual',
			filePath: `/documents/${this.selectedFile.name}`
		};

		this.documents.unshift(newDoc);
		this.filterDocuments();

		console.log('Documento guardado correctamente');

	}

	previewPDF(document: DocumentModel): void {
		if (document.fileExtension.toLowerCase() !== 'pdf') {
			console.warn('Solo se pueden previsualizar archivos PDF');

			return;
		}

		this.previewDocument = document;


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
=======

	}

	ngOnDestroy() {

		this.closeAllModals();
	}


	loadDocuments(): void {

		this.documents = [
			{
				id: 1,
				title: 'Contrato de Servicios 2024',
				type: 'contrato',
				fileName: 'contrato_servicios_2024.pdf',
				fileExtension: 'pdf',
				fileSize: '2.5 MB',
				uploadDate: new Date('2025-09-15'),
				createdBy: 'Juan Pérez',
				filePath: '/documents/contrato_servicios_2024.pdf'
			},
			{
				id: 2,
				title: 'Acta de Reunión - Septiembre',
				type: 'acta',
				fileName: 'acta_reunion_septiembre.pdf',
				fileExtension: 'pdf',
				fileSize: '1.8 MB',
				uploadDate: new Date('2025-09-20'),
				createdBy: 'María García',
				filePath: '/documents/acta_reunion_septiembre.pdf'
			},
			{
				id: 3,
				title: 'Imagen de Logo Corporativo',
				type: 'otro',
				fileName: 'logo_corporativo.png',
				fileExtension: 'png',
				fileSize: '500 KB',
				uploadDate: new Date('2025-09-18'),
				createdBy: 'Carlos López',
				filePath: '/documents/logo_corporativo.png'
			},
			{
				id: 4,
				title: 'Carta Comercial Q3-2024',
				type: 'carta',
				fileName: 'carta_comercial_q3.pdf',
				fileExtension: 'pdf',
				fileSize: '1.2 MB',
				uploadDate: new Date('2025-09-22'),
				createdBy: 'Ana Martínez',
				filePath: '/documents/carta_comercial_q3.pdf'
			},
			{
				id: 5,
				title: 'Informe Mensual Agosto 2025',
				type: 'informe',
				fileName: 'informe_agosto_2025.docx',
				fileExtension: 'docx',
				fileSize: '3.2 MB',
				uploadDate: new Date('2025-08-25'),
				createdBy: 'Roberto Silva',
				filePath: '/documents/informe_agosto_2025.docx'
			}
		];

		this.filteredDocuments = [...this.documents];
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

>>>>>>> Stashed changes
		});
	}


<<<<<<< Updated upstream
	downloadDocument(document: DocumentModel): void {

		const downloadUrl = document.filePath || `/api/documents/${document.id}/download`;

		// Crear enlace temporal para descarga
		const link = window.document.createElement('a');
		link.href = downloadUrl;
		link.download = document.fileName;
		window.document.body.appendChild(link);
		link.click();
		window.document.body.removeChild(link);

		console.log('Iniciando descarga del documento');

	}
  mngdocumentList(){
    this.mNGDocumentService.mngdocumentList({}, (resp : pMngdocumentList) => {
      console.log('resp:', resp)
    })
  }


	deleteDocument(document: DocumentModel): void {

		if (window.confirm(`¿Está seguro de eliminar el documento "${document.title}"?`)) {

			this.documents = this.documents.filter(doc => doc.id !== document.id);
			this.filterDocuments();

			console.log('Documento eliminado correctamente');

		}


	}


	editDocument(documentId: number): void {

		console.log(`Editando documento ID: ${documentId}`);
=======
	openNewDocumentModal(): void {
		this.resetNewDocumentForm();

		this.newDocumentModalRef = this.modalService.open(this.modalNewDocument, {
			size: 'lg',
			backdrop: 'static'
		});

		this.newDocumentModalRef.result.then((result: string) => {
			if (result === 'save') {
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
			if (file.size > 10 * 1024 * 1024) {
				console.error('El archivo no puede ser mayor a 10MB');
				return;
			}

			this.selectedFile = file;
			this.selectedFileName = file.name;
		}
	}


	saveDocument(): void {
		if (!this.newDocument.title || !this.newDocument.type || !this.selectedFile) {
			console.warn('Complete todos los campos obligatorios');
			return;
		}

		const newDoc: DocumentModel = {
			id: this.documents.length + 1,
			title: this.newDocument.title,
			type: this.newDocument.type,
			fileName: this.selectedFile.name,
			fileExtension: this.getFileExtension(this.selectedFile.name),
			fileSize: this.formatFileSize(this.selectedFile.size),
			uploadDate: new Date(),
			createdBy: 'Usuario Actual',
			filePath: `/documents/${this.selectedFile.name}`
		};

		this.documents.unshift(newDoc);
		this.filterDocuments();

		console.log('Documento guardado correctamente');

	}

	previewPDF(document: DocumentModel): void {
		if (document.fileExtension.toLowerCase() !== 'pdf') {
			console.warn('Solo se pueden previsualizar archivos PDF');

			return;
		}

		this.previewDocument = document;


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

		const downloadUrl = document.filePath || `/api/documents/${document.id}/download`;

		// Crear enlace temporal para descarga
		const link = window.document.createElement('a');
		link.href = downloadUrl;
		link.download = document.fileName;
		window.document.body.appendChild(link);
		link.click();
		window.document.body.removeChild(link);

		console.log('Iniciando descarga del documento');
>>>>>>> Stashed changes

	}


<<<<<<< Updated upstream
=======
	deleteDocument(document: DocumentModel): void {

		if (window.confirm(`¿Está seguro de eliminar el documento "${document.title}"?`)) {

			this.documents = this.documents.filter(doc => doc.id !== document.id);
			this.filterDocuments();

			console.log('Documento eliminado correctamente');

		}


	}


	editDocument(documentId: number): void {

		console.log(`Editando documento ID: ${documentId}`);

	}


>>>>>>> Stashed changes
	private getFileExtension(filename: string): string {
		return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
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
