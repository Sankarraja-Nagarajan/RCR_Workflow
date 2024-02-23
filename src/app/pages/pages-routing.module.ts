import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
     path : 'authentication',
     loadChildren: () => import('./authentication/authentication.module').then(a =>a.AuthenticationModule)
    },
    {
      path : 'warrantypages',
      loadChildren : () => import('./warranty-pages/warranty-pages.module').then(m => m.WarrantyPagesModule)
    },
    {
      path : '',
      redirectTo : 'authentication',
      pathMatch : 'full'
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
