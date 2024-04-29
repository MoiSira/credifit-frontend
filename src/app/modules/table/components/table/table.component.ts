import { Component, Input, ViewChild, AfterViewInit, OnInit, Output, EventEmitter } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TableColumn } from '../../models/table-column';
import { Sort } from '@angular/material/sort';
import { TableConfig } from '../../models/table.config';
import { MatPaginator } from '@angular/material/paginator';
import { RbacPermissions } from 'src/app/modules/management/models/rbac-permissions';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = [];
  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig | undefined;
  sortDisabled!: boolean;
  permissions!: RbacPermissions;
  currentFilterValue: string = '';

  @Input() set data(data: any) {
    this.dataSource.data = data;
  }

  @Input() set columns(columns: TableColumn[]) {
    this.tableColumns = columns;
    this.displayedColumns = this.tableColumns.map(col => col.def);
  }

  @Input() set config(config: TableConfig) {
    this.setConfig(config)
  }

  @Input() set sortConfig(sortDisabled: boolean) {
    this.sortDisabled = sortDisabled;
  }

  @Input() set userPermissions(permissions: RbacPermissions) {
    this.permissions = permissions;
  }

  @Output() blockedRow: EventEmitter<any> = new EventEmitter()

  @Output() editedRow: EventEmitter<any> = new EventEmitter()

  @Output() deletedRow: EventEmitter<any> = new EventEmitter()

  @ViewChild(MatTable) matTable!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
  ) {}

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  setConfig(config: TableConfig) {
    this.tableConfig = config;
    if (this.tableConfig.isBlockable) {
      this.displayedColumns.push('estatus');
    }

    if (this.tableConfig.showActions) {
      this.displayedColumns.push('actions');
    }
  }
  

  editRow(row: any) {
    this.editedRow.emit(row);
  }

  deleteRow(row: any) {
    this.deletedRow.emit(row);
  }

  onToggleChange(row: any) {
    this.blockedRow.emit(row);
  }

  onSort(event: Sort) {
    let newArray = [...this.dataSource.data].sort((rowA:any, rowB:any) => {
      const column = event.active;
      const valueA = rowA[column];
      const valueB = rowB[column];
      if (valueA < valueB) {
        return -1;
      } else if (valueA > valueB) {
        return 1;
      } else {
        return 0;
      }
    })

    if (event.direction === '') {
      newArray = [...this.dataSource.data];
    } else if (event.direction === 'desc') {
      newArray = newArray.reverse();
    }
    this.matTable.dataSource = newArray;
    this.matTable.renderRows();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.currentFilterValue = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
