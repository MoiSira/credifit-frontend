import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RbacPermissions } from 'src/app/modules/management/models/rbac-permissions';
import { AuthService } from 'src/app/services/auth.service';
import { RbacControlService } from 'src/app/services/rbac-control.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  constructor(
    private userService: UsuariosService,
    private rbacControl: RbacControlService,
    private authService: AuthService,
    private router: Router
  ) {}

  name:string = localStorage.getItem('name') ?? '';
  token:string = localStorage.getItem('token') ?? '';
  username:string = localStorage.getItem('username') ?? '';
  lastname:string = localStorage.getItem('lastname') ?? '';

  permissions!: RbacPermissions;

  ngOnInit(): void {
    this.setUserPermissions()
  }

  setUserPermissions() {
    this.userService.getUsersByUsername(this.username, this.token)
    .subscribe(
      res => {
        this.permissions = this.rbacControl.getPermissions(res[0].rol);
      },
      err => {
        console.log(err);
      }
    )
  }

  logout(): void {
    const username = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    this.authService.logout(username, token)
    .subscribe(
      res => {
        console.log(res);
        localStorage.clear(); // Eliminar el token del localStorage al cerrar sesión
        this.router.navigate(['/login']);
      },
      err => {
        console.log(err);
      }
    )
  }

}
