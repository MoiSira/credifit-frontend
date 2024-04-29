import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { MyReservesComponent } from './my-reserves/my-reserves.component';
import { ReportsComponent } from './reports/reports.component';
import { authGuard } from '../auth/auth.guard';
import { SportsCalendarComponent } from './sports-calendar/sports-calendar.component';


const routes: Routes = [
  {
    path: 'dashboard',
    component: PagesComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'users',
        component: UsuariosComponent
      },
      {
        path: 'myReserves',
        component: MyReservesComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'sportsCalendar',
        component: SportsCalendarComponent
      },
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
