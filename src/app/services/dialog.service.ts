import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCustomComponent } from '../components/dialog-custom/dialog-custom.component';
import { DialogCustomData } from '../modules/dialog/models/dialog-custom-data';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public matDialog: MatDialog) { }

  openDialog(data: DialogCustomData, width?: string, disableClose?: boolean) {
    return this.matDialog.open(DialogCustomComponent, {data, width: width, disableClose: disableClose})
  }
}
