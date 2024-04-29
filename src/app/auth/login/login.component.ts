import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  user = {
    username: '',
    password: ''
  }

  constructor(
    private authService: AuthService,
    private userService: UsuariosService,
    private toastr: ToastrService,
    private router: Router
    ) {}

  login() {
    this.authService.login(this.user)
      .subscribe(
        res => {
          // Se llama al servicio que crea el usuario
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('name', res.name);
          localStorage.setItem('lastname', res.lastname);
          this.userService.createUser(res).subscribe();
          this.router.navigate(['/dashboard']);
      },
        err => {
          this.showErrorToast(); 
          console.log(err)
        } 
      )
  }
  showErrorToast() {
    this.toastr.error('Usuario o clave incorrectos, intente de nuevo', 'Error al iniciar sesión');
  }

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard'])
    } else {
      this.router.navigate(['/login'])
    }
  }

}
