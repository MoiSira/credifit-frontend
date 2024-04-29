import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TableColumn } from 'src/app/modules/table/models/table-column';
import { TableConfig } from 'src/app/modules/table/models/table.config';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { DialogService } from 'src/app/services/dialog.service';
import { RolesService } from 'src/app/services/roles.service';
import { RbacControlService } from 'src/app/services/rbac-control.service';
import { RbacPermissions } from 'src/app/modules/management/models/rbac-permissions';
import { ToastrService } from 'ngx-toastr';
import { DialogCustomComponent } from '../dialog-custom/dialog-custom.component';

export interface UsersData {
  id_usuario: number,
  correo: string,
  usuario: string,
  nombre: string,
  apellido: string,
  rol: number | string,
  estatus: number
}

interface Rol {
  id_rol: number;
  nombre_rol: string;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit{
  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    isBlockable: true,
    isPaginator: true,
    showActions: true,
    showFilter: true
  }
  USERS_DATA: UsersData[] = [];
  sortDisabled: boolean = true;
  userToEdit!: {id_usuario: number, usuario: string, nombre: string, apellido: string};
  userToDelete!: {id_usuario: number, usuario:string, nombre: string, apellido: string};
  permissions!: RbacPermissions;
  dialogRef!: MatDialogRef<DialogCustomComponent>;

  roles: Rol[] = [];
  rolControl = new FormControl(null, Validators.required);

  constructor(
    public dialogService: DialogService,
    private userService: UsuariosService,
    private rolesService: RolesService,
    private toastr: ToastrService,
    private rbacControl: RbacControlService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setUserPermissions()
    this.setRolesSelection()
    this.setTableColumns()
    this.setDataTable()
  }

  setUserPermissions() {
    const token = localStorage.getItem('token') ?? '';
    const username = localStorage.getItem('username') ?? '';
    this.userService.getUsersByUsername(username, token)
    .subscribe(
      res => {
        this.permissions = this.rbacControl.getPermissions(res[0].rol);
      },
      err => {
        console.log(err);
      }
    )
  }

  setRolesSelection() {
    const token = localStorage.getItem('token') ?? '';
    this.rolesService.getRoles(token)
    .subscribe(
      res => {
        this.roles = res;
      },
      err => {
        console.log(err);
      }
    )
  }

  setTableColumns() {
    this.tableColumns = [
      {label: 'id', def: 'id', dataKey: 'id_usuario'},
      {label: 'Usuario', def: 'usuario', dataKey: 'usuario'},
      {label: 'Nombre', def: 'nombre', dataKey: 'nombre'},
      {label: 'Apellido', def: 'apellido', dataKey: 'apellido'},
      {label: 'Correo', def: 'correo', dataKey: 'correo'},
      {label: 'Rol', def: 'rol', dataKey: 'rol'}
    ]
  }

  setDataTable() {
    const token = localStorage.getItem('token') ?? '';
    this.userService.getUsers(token)
    .subscribe(
      res => {
        res.forEach(users => {
          let rolObject = this.roles.find(rol => rol.id_rol === users.rol)
          users.rol = rolObject?.nombre_rol ?? '';
        })
        this.USERS_DATA = res;
      },
      err => {
        console.log(err);
        // Continuar aqui de que cuando regres
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    )
  }

  modalEditUserAction(data: any, template: TemplateRef<any>) {
    this.userToEdit = data;
    this.dialogRef = this.dialogService.openDialog({template}, '400px', true)
    this.dialogRef.afterClosed().subscribe(res => {console.log(res);})
  }

  modalDeleteUserAction(data: any, template: TemplateRef<any>) {
    this.userToDelete = data;
    this.dialogRef = this.dialogService.openDialog({template}, '500px', true)
    this.dialogRef.afterClosed().subscribe(res => {console.log(res);})
  }

  editUser() {
    const token = localStorage.getItem('token') ?? '';
    const usernameLog = localStorage.getItem('username') ?? '';
    if (this.rolControl.valid) {
      const selectedRolValue = this.rolControl.value;
      if (selectedRolValue) {
        this.userService.updateUser(this.userToEdit.id_usuario, usernameLog, selectedRolValue, token)
        .subscribe(
          res => {
            this.dialogRef.close(res)
            this.toastr.success(`El usuario ${this.userToEdit.usuario} ha sido editado`, 'Usuario Editado');
            setTimeout(() => {
              location.reload();
            }, 1500);
          },
          err => {
            console.log(err);
          }
        )
      }
    }
  }

  deleteUser() {
    const id_usuario = this.userToDelete.id_usuario;
    const usernameLog = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    this.userService.deleteUser(id_usuario, usernameLog, token)
    .subscribe(
      res => {
        this.dialogRef.close(res)
        this.toastr.success(`El usuario ${this.userToDelete.usuario} ha sido elimiminado`, 'Usuario Eliminado');
        setTimeout(() => {
          location.reload();
        }, 1500);
      },
      err => {
        console.log(err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    )
  }

  blockUser(data: any) {
    const token = localStorage.getItem('token') ?? '';
    const usernameLog = localStorage.getItem('username') ?? '';
    if (data.estatus == 0) {
      this.userService.blockUser(data.id_usuario, usernameLog, token)
      .subscribe(
        res => {
          this.toastr.success(`El usuario ${data.usuario} ha sido bloqueado`, 'Usuario Desbloqueado');
          setTimeout(() => {
            location.reload();
          }, 1500);
        },
        err => {
          console.log(err);
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      )
    }
    if (data.estatus == 1) {
      this.userService.unblockUser(data.id_usuario, usernameLog, token)
      .subscribe(
        res => {
          this.toastr.success(`El usuario ${data.usuario} ha sido desbloqueado`, 'Usuario Desbloqueado');
          setTimeout(() => {
            location.reload();
          }, 1500);
        },
        err => {
          console.log(err);
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      )
    }
  }

}
