import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import {
  CoreService,
  FirebaseAuthService,
  OVCMessaging,
  OHService,
  OVMBackendBase,
} from '@ovenfo/framework';
import { BESNav } from '@ovenfo/framework/lib/bes/view/nav/bes.nav';
import { environment } from 'src/environments/environment';
import { shared } from 'src/environments/environmentShared';

@Component({
  selector: 'ovm-backend',
  templateUrl: './ovm.backend.html',
})
export class OVMBackend extends OVMBackendBase implements OnInit {
  @ViewChild('objNav', { static: true }) objNav: BESNav;

  constructor(
    public override router: Router,
    public override ohService: OHService,
    public override cse: CoreService, // cse: CoreService contiene cse.data.uo
    public override title: Title,
    public override messagingService: OVCMessaging,
    public override fbAuth: FirebaseAuthService,
    public override translocoService: TranslocoService,
    private cd: ChangeDetectorRef // Inyectado para forzar la detección de cambios
  ) {
    super(
      router,
      ohService,
      cse,
      title,
      messagingService,
      fbAuth,
      translocoService
    );
    this._environment = environment;
    this._shared = shared;
    this._constructor();
  }

  ngOnInit() {
    this.validOnInit();
  }

  // ngAfterViewInit se ejecuta una vez que la vista y sus hijos (incluido objNav) están inicializados.
  ngAfterViewInit() {
    // Usamos setTimeout para asegurar que la llamada asíncrona de CoreService (si la hay) 
    // ha tenido una oportunidad para terminar de cargar los datos antes de la manipulación.
    // Prueba con 0ms inicialmente, y si sigue sin funcionar, aumenta a 50ms o 100ms.
    setTimeout(() => {
      // 1. Verificar que el array exista y tenga elementos suficientes.
      if (
        this.objNav &&
        this.objNav.cse.data.uo &&
        this.objNav.cse.data.uo.length >= 3
      ) {
        // 2. Ejecutar la eliminación: Borra 2 elementos, comenzando desde el índice 1.
        this.objNav.cse.data.uo.splice(2, 2);

        // 3. Forzar la actualización de la vista.
        // Esto es crucial para que el menú (BESNav) refleje inmediatamente el cambio en el array 'uo'.
        this.cd.detectChanges();

        console.log(
          `Menú actualizado. Nuevo tamaño del array uo: ${this.objNav.cse.data.uo.length}`
        );
      } else {
        console.warn(
          'Advertencia: No se pudo realizar el splice. El array uo es nulo, indefinido o no tiene suficientes elementos.'
        );
      }

      // Asignación de la referencia (solo si la necesitas en _objNav).
      this._objNav = this.objNav;
    }, 0); // Un setTimeout con 0ms a menudo funciona para mover la lógica al final del ciclo de vida actual.

    this.validAfterViewInit();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.renderMenu(event.target.innerWidth);
  }
}
