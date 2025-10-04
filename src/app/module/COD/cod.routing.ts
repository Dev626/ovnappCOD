import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule, Route } from '@angular/router'

import { OVCCanActivateModule } from '@ovenfo/framework'

import { CODMain, Document, User, UserNew, UserDocument } from './view/cod.core'

const routes: Routes = [
	{ path: '', component: CODMain },
	{ path: 'document', component: Document, canActivate: [OVCCanActivateModule] },
	{ path: 'user', component: User, canActivate: [OVCCanActivateModule] },
	{ path: 'user/new', component: UserNew, canActivate: [OVCCanActivateModule] },
	{ path: 'user/edit/:id', component: UserNew, canActivate: [OVCCanActivateModule] },
	{ path: 'user/userDocument/:id', component: UserDocument, canActivate: [OVCCanActivateModule] }
]

export const routing: ModuleWithProviders<Route> = RouterModule.forChild(routes)
