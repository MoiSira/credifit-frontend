import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { ReportsService } from 'src/app/services/reports.service';
import { TableColumn } from 'src/app/modules/table/models/table-column';
import * as XLSX from 'xlsx';
import { TableConfig } from 'src/app/modules/table/models/table.config';


export interface ReservesReports {
  Nombre: string;
  Apellido: string;
  Fecha: string;
  Hora_Inicio: string;
  Hora_Fin: string;
  Nombre_Turno: string
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit{
  constructor(
    private reportsService: ReportsService,
    private router: Router
  ) {}

  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    isBlockable: false,
    isPaginator: false
  }
  REPORTS_DATA: ReservesReports[] = [];
  sortDisabled: boolean = false;

  reportDateControl: FormControl = new FormControl(new Date())
  reportReceived!: boolean;
  reportMessage!: string;

  ngOnInit(): void {
    this.reportMessage = 'Selecciona una fecha para buscar reservas';
  }

  findReserves() {
    this.setTableColumns()
    this.setDataTable()
  }

  setTableColumns() {
    this.tableColumns = [
      {label: 'Nombre', def: 'Nombre', dataKey: 'Nombre'},
      {label: 'Apellido', def: 'Apellido', dataKey: 'Apellido'},
      {label: 'Fecha', def: 'Fecha', dataKey: 'Fecha', dataType: 'date', formatt: 'dd-MM-YYYY'},
      {label: 'Hora de inicio', def: 'Hora_Inicio', dataKey: 'Hora_Inicio'},
      {label: 'Hora de finalización', def: 'Hora_Fin', dataKey: 'Hora_Fin'},
      {label: 'Turno', def: 'Nombre_Turno', dataKey: 'Nombre_Turno'}
    ]
  }

  setDataTable() {
    const token = localStorage.getItem('token') ?? '';
    this.reportsService.getReportsDay(this.reportDateControl.value.toISOString().slice(0, 10), token)
    .subscribe(
      res => {
        this.REPORTS_DATA = res;
        if (this.REPORTS_DATA.length != 0) {
          this.reportReceived = true;
        } else {
          this.reportReceived = false;
          this.reportMessage = 'No hay reservas para esta fecha';
        }
      },
      err => {
        console.log(err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    )
  }

  exportToExcel(): void {
    let sheetColumns: string[] = [];
    let data: string[][] = [];
    this.tableColumns.forEach(column => {
      sheetColumns.push(column.label)
    })
    data.push(sheetColumns)
    this.REPORTS_DATA.forEach(report => {
      data.push([report.Nombre, report.Apellido, report.Fecha.slice(0, 10), report.Hora_Inicio, report.Hora_Fin, report.Nombre_Turno])
    })
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');

    XLSX.writeFile(wb, 'ReporteCredifit.xlsx');
  }
}
