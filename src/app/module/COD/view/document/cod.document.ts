import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CoreService, ohLoadSubModule, OHService } from '@ovenfo/framework';
import { CODCoreService } from 'src/app/module/COD/cod.coreService';
import { CODBase } from 'src/app/module/COD/cod.base';
import { MNGDocumentServiceJPO, pMngdocumentGet, pMngdocumentList, pMngdocumentRegister } from '../../service/mng.mNGDocumentService';
import { MNGDocumentFileService } from '../../service/mng.mNGDocumentFileService';
import { ADMCatalogoServiceJPO, pGescatalogoListarAll, pGescatalogoObtener } from '@ovenfo/moduleadm';

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
	templateUrl: './cod.document.html',
  styleUrls: ['./cod.document.css']
})
export class Document extends CODBase implements OnInit, AfterViewInit, OnDestroy {

	/* servicio */
	private mNGDocumentService: MNGDocumentServiceJPO
	private mNGDocumentFileService: MNGDocumentFileService
	private aDMCatalogoService: ADMCatalogoServiceJPO

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

document_id: number
	newDocument: any = {}
	selectedFile: File | null = null;
	selectedFileName: string = '';


	previewDocument: DocumentModel | null = null;
	pdfPreviewUrl: SafeResourceUrl | null = null;
	isLoadingPdf: boolean = false;
	// Variable para guardar la URL del blob y poder revocarla
	private currentBlobUrl: string | null = null;


filterModalRef: NgbModalRef | undefined;
newDocumentModalRef: NgbModalRef | undefined;
pdfPreviewModalRef: NgbModalRef | undefined;

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
		this.aDMCatalogoService = new ADMCatalogoServiceJPO(ohService)
		this.mNGDocumentFileService = fileService;
		this.mngdocumentList();


// console.log('Tiene rol?', this.cse.tieneRol([this.ccs.config.rol_kudo.approver]));
// console.log('Roles del usuario:', this.cse.data.user.data.roles);
// console.log('Rol buscado:', this.ccs.config.rol_kudo.submitter);
// console.log(cse.tieneRol(['cod_doc_approver']))
//console.log(cse.data.user.data.userid)

		this.pagin = {
			page: 1,
			total: 0,
			size_rows: 10,
		}
		/* catalogo */
    this.gescatalogoObtener();
		// new ohLoadSubModule(cse).mapOnlyCatalogs([
		// 	{ id: 62471, nombre: 'mng_cat_type_file' }
		// ]).then((it) => {
		// 	console.log('it:', it)
		// 	this.catalogo = it;
		// 	console.log('this.catalogo:', this.catalogo)
		// })
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

	gescatalogoObtener() {
		console.log('gescatalogoObtener:')
		this.aDMCatalogoService.gescatalogoListarAll({
      catalogos_id: '[62471,62472,62473]'
		}, (resp: pGescatalogoListarAll[]) => {
		  console.log('resp:', resp)
      this.catalogo = this.convertirCatalogos(resp);
		});
	}

  convertirCatalogos(data: any[]) {
    return data
      .filter(item => item.catalogo_padre_id !== null) // ignorar los padres raíz
      .map(item => ({
        catalog_parent_alias: item.catalog_parent_alias,
        catalogo_id: item.catalogo_id,
        alias: item.alias,
        descripcion: item.descripcion,
        catalogo_padre_id: item.catalogo_padre_id,
        descricion_larga: item.descricion_larga,
        estado: item.estado,
        id: String(item.catalogo_id)
      }));
  }  

  saveFile(document_id: number): void {
    this.fileService.downloadFileDirect(document_id);
  }

	/* servicio - Listar documentos */
	mngdocumentList() {
    // Determinar si es approver o submitter
    const isApprover = this.cse.tieneRol([this.ccs.config.rol_kudo.approver]);
    const isSubmitter = this.cse.tieneRol([this.ccs.config.rol_kudo.submitter]);

    // Crear el objeto de parámetros base
    let params: any = {
        // pf_page : 0, // Optional
        // pf_size : 0 // Optional
    };

    // Si es SUBMITTER (o tiene ambos roles), filtrar por su userid
    if (isSubmitter) {
        params.created_by = this.cse.data.user.data.userid;
        console.log('Filtrando como SUBMITTER - UserID:', params.created_by);
    }

    // Si es APPROVER solo (sin submitter), no enviar created_by para traer todos
    if (isApprover && !isSubmitter) {
        console.log('Cargando todos los documentos (APPROVER)');
        // No agregar created_by para traer todos los registros
    }

    // Si no tiene ningún rol válido, igual filtrar por su userid para no mostrar nada
    if (!isApprover && !isSubmitter) {
        params.created_by = -1; // ID inexistente para no traer nada
        console.log('Usuario sin rol válido');
    }

    // Llamar al servicio con los parámetros
    this.mNGDocumentService.mngdocumentList(params, (resp: pMngdocumentList) => {
        this.pagin.total = resp.response;
        this.ldocuments = resp.documents;
        console.log('Documentos cargados:', this.ldocuments.length);
        console.log('Respuesta completa:', resp);
    });
}




//    /**
//  * Obtiene los datos completos de un documento por su ID
//  */
// mngdocumentGet(documentId: number): void {
//     console.log('=== Llamando mngdocumentGet con ID:', documentId);

//     this.mNGDocumentService.mngdocumentGet({
//         document_id: documentId
//     }, (resp: pMngdocumentGet) => {
//         console.log('=== Respuesta completa:', resp);
//         console.log('=== Tipo de resp:', typeof resp);
//         console.log('=== Keys de resp:', Object.keys(resp));

//         // Intenta acceder de diferentes formas
//         if (resp) {
//             this.loadDocumentForEdit(resp); // Prueba pasando resp directamente
//         } else {
//             alert('No se pudo cargar el documento');
//         }
//     })
// }

/**
 * Abre el modal de edición y carga los datos del documento
 */
/**
 * Abre el modal de edición con los datos del item del listado
 */
openEditDocumentModal(item: any): void {
    console.log('=== Item recibido para editar:', item);

    // Cargar los datos directamente desde el item del listado
    this.newDocument = {
        document_id: item.document_id,
        title: item.title,
        type: item.document_type?.toString(),
        comment: item.comment || '',
        file_name: item.file_name,
        file_path: item.file_path,
        status: item.status,
        created_by: item.created_by,
        created_at: item.created_at
    };

    this.selectedFileName = item.file_name || '';
    this.selectedFile = null; // Limpiar archivo seleccionado

    console.log('=== newDocument cargado:', this.newDocument);

    // Abrir el modal de edición
    this.newDocumentModalRef = this.modalService.open(this.modalNewDocument, {
        size: 'lg',
        backdrop: 'static'
    });

    this.newDocumentModalRef.result.then((result: string) => {
        if (result === 'update') {
            console.log('Modal cerrado con update');
        }
    }).catch(() => {
        this.resetNewDocumentForm();
    });
}



/**
 * Actualiza un documento existente
 */
updateDocument(): void {
    if (!this.newDocument.title || !this.newDocument.type) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    // Formatear fecha actual
    const now = new Date();
    const updated_at = this.formatDateToDDMMYYYY(now);

    // Formatear created_at
    let created_at = this.newDocument.created_at;
    if (created_at) {
        const createdDate = new Date(created_at);
        created_at = this.formatDateToDDMMYYYY(createdDate);
    }

    // Preparar campos para actualizar
    const fields: any = {
        document_id: this.newDocument.document_id,
        title: this.newDocument.title,
        document_type: parseInt(this.newDocument.type),
        status: this.newDocument.status,
        updated_by: this.cse.data.user.data.userid,
        updated_at: updated_at
    };

    // Solo agregar campos si tienen valor
    if (this.newDocument.file_name) fields.file_name = this.newDocument.file_name;
    if (this.newDocument.file_path) fields.file_path = this.newDocument.file_path;
    if (this.newDocument.comment) fields.comment = this.newDocument.comment;
    if (this.newDocument.created_by) fields.created_by = this.newDocument.created_by;
    if (created_at) fields.created_at = created_at;

    // Preparar archivos (si se seleccionó uno nuevo)
    const files: any = {};
    if (this.selectedFile) {
        files.document_file = this.selectedFile;
    }

    const loading = { value: false };

    console.log('Actualizando documento...', fields);

    // Llamar al servicio de edición
    this.mNGDocumentService.mngdocumentEdit(
        fields,
        files,
        loading,
        (resp) => {
            console.log('Respuesta del servidor:', resp);

            if (resp.resp_result === 1 || resp.resp_result === '1' as any) {
                alert(resp.resp_message || 'Documento actualizado exitosamente');

                // Limpiar formulario y cerrar modal
                this.resetNewDocumentForm();
                if (this.newDocumentModalRef) {
                    this.newDocumentModalRef.close('update');
                }

                // Recargar lista
                this.mngdocumentList();
            } else {
                alert(resp.resp_message || 'Error al actualizar el documento');
            }
        },
        (error) => {
            console.error('Error en el servicio:', error);
            alert('Ocurrió un error al actualizar el documento.');
        }
    );
}

/**
 * Formatea una fecha al formato dd/MM/yyyy
 */
private formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  previewPDF(document: DocumentModel): void {
    if (document.fileExtension.toLowerCase() !== 'pdf') {
      alert('Solo se pueden previsualizar archivos PDF');
      return;
    }

    this.previewDocument = document;
    this.isLoadingPdf = true;

    const fileUrl = this.mNGDocumentFileService.getFileDocumentUrl(document.id, false);

    if (this.isMobile()) {
      // En móvil → abrir directo al backend
      window.open(fileUrl, '_blank');
      this.isLoadingPdf = false;
      return;
    }

    // En desktop → usar modal con iframe
    this.pdfPreviewModalRef = this.modalService.open(this.modalPDFPreview, {
      size: 'xl',
      backdrop: 'static',
      keyboard: true
    });

    this.pdfPreviewModalRef.result.then(
      () => this.cleanupPdfPreview(),
      () => this.cleanupPdfPreview()
    );

    // Asignar la URL directamente al iframe (sin blob)
    this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    this.isLoadingPdf = false;
  }

	/**
	 * Previsualiza un documento PDF en un modal
	 * Solo permite PDFs y descarga el archivo del servidor usando el servicio
	 */
	previewPDF2(document: DocumentModel): void {
		// Validar que sea un PDF
		if (document.fileExtension.toLowerCase() !== 'pdf') {
			console.warn('Solo se pueden previsualizar archivos PDF');
			alert('Solo se pueden previsualizar archivos PDF');
			return;
		}

		this.previewDocument = document;
		this.isLoadingPdf = true;

    if (!this.isMobile()) {
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
    }


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
				// this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentBlobUrl);
				this.isLoadingPdf = false;

				console.log('PDF cargado correctamente:', document.fileName);

        if (this.isMobile()) {
          window.open(this.currentBlobUrl, '_blank');
        } else {
          this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentBlobUrl);
        }
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

/**
 * Cambia el estado de un documento con un solo click
 * Solo disponible para usuarios con rol de approver
 * Estados: 0=Enviado, 1=Aprobado, 2=Removido
 */
// changeDocumentStatus(item: any, event: Event): void {
//     event.stopPropagation();



//     // No permitir cambios si el estado es 2 (Removido - estado final)
//     if (item.status === 2) {
//         alert('No se puede modificar un documento removido');
//         return;
//     }

//     // Determinar el nuevo estado (ciclo: 0 → 1 → 2)
//     let newStatus: number;
//     let newStatusDesc: string;

//     if (item.status === 0) {
//         // De Enviado (0) a Aprobado (1)
//         newStatus = 1;
//         newStatusDesc = 'Aprobado';
//     } else if (item.status === 1) {
//         // De Aprobado (1) a Removido (2)
//         newStatus = 2;
//         newStatusDesc = 'Removido';
//     } else {
//         // Por si acaso
//         newStatus = 0;
//         newStatusDesc = 'Enviado';
//     }

//     // Confirmar el cambio
//     if (!confirm(`¿Está seguro de cambiar el estado a "${newStatusDesc}"?`)) {
//         return;
//     }

//     // Preparar campos para actualizar
//     const fields: any = {
//         document_id: item.document_id,
//         title: item.title,
//         document_type: item.document_type,
//         status: newStatus,
//         updated_by: this.cse.data.user.data.userid,
//         updated_at: this.formatDateToDDMMYYYY(new Date())
//     };

//     // Agregar campos obligatorios
//     if (item.file_name) fields.file_name = item.file_name;
//     if (item.file_path) fields.file_path = item.file_path;
//     if (item.comment) fields.comment = item.comment;
//     if (item.created_by) fields.created_by = item.created_by;
//     if (item.created_at) {
//         const createdDate = new Date(item.created_at);
//         fields.created_at = this.formatDateToDDMMYYYY(createdDate);
//     }

//     const loading = { value: false };

//     console.log('Cambiando estado del documento...', fields);

//     this.mNGDocumentService.mngdocumentEdit(
//         fields,
//         {},
//         loading,
//         (resp) => {
//             if (resp.resp_result === 1 || resp.resp_result === '1' as any) {
//                 // Actualizar item local
//                 item.status = newStatus;
//                 item.status_desc = newStatusDesc;

//                 // Recargar lista
//                 this.mngdocumentList();
//             } else {
//                 alert(resp.resp_message || 'Error al actualizar el estado');
//             }
//         },
//         (error) => {
//             console.error('Error al cambiar estado:', error);
//             alert('Ocurrió un error al cambiar el estado del documento.');
//         }
//     );
// }
  /**
 * Retorna el tooltip apropiado según el rol y estado del documento
 */
getStatusTooltip(item: any): string {
    if (item.status === 2) {
        return 'Estado final - No se puede modificar';
    }

    if (!this.cse.tieneRol([this.ccs.config.rol_kudo.approver])) {
        return 'Solo usuarios con rol Approver pueden cambiar el estado';
    }

    // Mostrar el siguiente estado
    if (item.status === 0) {
        return 'Click para cambiar a: Aprobado';
    } else if (item.status === 1) {
        return 'Click para cambiar a: Removido';
    }

    return 'Click para cambiar estado';
}


private updateDocumentStatus(item: any, newStatus: number, newStatusDesc: string): void {

    // Preparar campos para actualizar (similar a tu código original)
    const fields: any = {
        document_id: item.document_id,
        title: item.title,
        document_type: item.document_type,
        status: newStatus,
        updated_by: this.cse.data.user.data.userid,
        updated_at: this.formatDateToDDMMYYYY(new Date())
    };

    // Agregar campos obligatorios
    if (item.file_name) fields.file_name = item.file_name;
    if (item.file_path) fields.file_path = item.file_path;
    if (item.comment) fields.comment = item.comment;
    if (item.created_by) fields.created_by = item.created_by;
    if (item.created_at) {
        const createdDate = new Date(item.created_at);
        fields.created_at = this.formatDateToDDMMYYYY(createdDate);
    }

    const loading = { value: false };

    console.log(`Actualizando estado a ${newStatusDesc}...`, fields);

    this.mNGDocumentService.mngdocumentEdit(
        fields,
        {},
        loading,
        (resp) => {
            if (resp.resp_result === 1 || resp.resp_result === '1' as any) {
                // Actualizar item local
                item.status = newStatus;
                item.status_desc = newStatusDesc;

                // Recargar lista
                this.mngdocumentList();
            } else {
                alert(resp.resp_message || 'Error al actualizar el estado');
            }
        },
        (error) => {
            console.error('Error al cambiar estado:', error);
            alert('Ocurrió un error al cambiar el estado del documento.');
        }
    );
}

approveDocument(item: any, event: Event): void {
    event.stopPropagation();

    // SOLO permitir si el estado actual es 0 (Enviado)
    if (item.status !== 0) {
        alert('Solo se pueden aprobar documentos en estado "Enviado".');
        return;
    }

    const newStatus = 1;
    const newStatusDesc = 'Aprobado';

    // Confirmar el cambio
    if (!confirm(`¿Está seguro de cambiar el estado a "${newStatusDesc}"?`)) {
        return;
    }

    // Llama a la función auxiliar para realizar la actualización en el servidor
    this.updateDocumentStatus(item, newStatus, newStatusDesc);
}

removeDocument(item: any, event: Event): void {
    event.stopPropagation();

    // No permitir cambios si el estado ya es 2 (Removido)
    if (item.status === 2) {
        alert('El documento ya está removido.');
        return;
    }

    // Opcional: Si solo quieres permitir la remoción desde ciertos estados
    if (item.status !== 0 && item.status !== 1) {
        alert('Solo se pueden remover documentos en estado "Enviado" o "Aprobado".');
        return;
    }

    const newStatus = 2;
    const newStatusDesc = 'Removido';

    // Confirmar el cambio
    if (!confirm(`¿Está seguro de cambiar el estado a "${newStatusDesc}"? Este es un cambio final.`)) {
        return;
    }

    // Llama a la función auxiliar para realizar la actualización en el servidor
    this.updateDocumentStatus(item, newStatus, newStatusDesc);
}
}
