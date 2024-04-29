import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Importacion de componentes
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PagesRoutingModule } from './components/pages-routing.module';
import { AuthRoutingModule } from './auth/auth-routing.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    PagesRoutingModule,
    AuthRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
