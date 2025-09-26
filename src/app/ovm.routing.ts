import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import { MCODLogin } from 'src/app/view/login/mcod.login';

const ovmRoutes: Routes = [
    { path: '', component: MCODLogin },
    { path: 'Be', loadChildren: () => import('./ovb.module').then(m => m.OVBModule) }
];

export const ovmRouting: ModuleWithProviders<Route> = RouterModule.forRoot(ovmRoutes, { useHash: true });