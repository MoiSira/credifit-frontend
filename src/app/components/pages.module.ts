import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PagesComponent } from './pages.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatTabsModule } from '@angular/material/tabs';
import { MyReservesComponent } from './my-reserves/my-reserves.component';
import { ReportsComponent } from './reports/reports.component';
import { TableModule } from '../modules/table/table.module';
import { DialogCustomComponent } from './dialog-custom/dialog-custom.component';
import { SportsCalendarComponent } from './sports-calendar/sports-calendar.component';
import { MatIconModule } from '@angular/material/icon';


// Define el formato personalizado
const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY', // Formato para analizar la fecha desde el input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // Formato para mostrar la fecha en el input
    monthYearLabel: 'MMMM YYYY', // Formato para el label del mes y año
    dateA11yLabel: 'LL', // Formato accesible para la fecha
    monthYearA11yLabel: 'MMMM YYYY', // Formato accesible para el mes y año
  },
};


@NgModule({
  providers: [
    // Usa MomentDateAdapter con el idioma adecuado
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  declarations: [
    DashboardComponent,
    UsuariosComponent,
    PagesComponent,
    MyReservesComponent,
    ReportsComponent,
    DialogCustomComponent,
    SportsCalendarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FullCalendarModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTabsModule,
    MatChipsModule,
    MatAutocompleteModule,
    AsyncPipe
  ],
  exports: [
    DashboardComponent,
    UsuariosComponent,
    MyReservesComponent,
    ReportsComponent
  ]
})
export class PagesModule { }
