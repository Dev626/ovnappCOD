import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import { OVCCanActivate } from '@ovenfo/framework';
import { OVMBackend } from 'src/ovn/be/view/backend/ovm.backend';

const ovbRoutes: Routes = [
    { path: '', component: OVMBackend, canActivate: [OVCCanActivate], children : [
        { path: '', canActivate: [OVCCanActivate], loadChildren: () => import('@ovenfo/framework').then(m => m.BEEModule) },
        { path: 'adm', canActivate: [OVCCanActivate], loadChildren: () => import('@ovenfo/moduleadm').then(m => m.ADMModule) },
		{ path: 'cod', canActivate: [OVCCanActivate], loadChildren: () => import('./module/COD/cod.module').then(m => m.CODModule) }
      ]
    }
];

export const ovbRouting: ModuleWithProviders<Route> = RouterModule.forChild(ovbRoutes);