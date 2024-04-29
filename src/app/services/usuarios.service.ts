import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../environments/config';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private URL = API_URL;

  constructor(private http:HttpClient) { }

  createUser(user: {email: string, username: string, name: string, lastname: string, token: string}) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: user.token
      })
    }
    return this.http.post<any>(this.URL + '/CredifitUsers/new', user, httpOptions)
  }

  getUsers(token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{id_usuario: number, correo: string, usuario: string, nombre: string, apellido: string, rol: number | string, estatus: number}[]>(this.URL + '/CredifitUsers', httpOptions)
  }

  deleteUser(id_usuario: number, usernameLog: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.delete<any>(this.URL + `/CredifitUsers/delete?id=${id_usuario}&usernameLog=${usernameLog}`, httpOptions)
  }

  updateUser(id_usuario: number, usernameLog: string, rol: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.put<any>(this.URL + `/CredifitUsers/update?id=${id_usuario}&usernameLog=${usernameLog}&rol_id=${rol}`, {}, httpOptions)
  }

  getUsersByUsername(username: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{id_usuario: number, correo: string, usuario: string, nombre: string, apellido: string, rol: number, estatus: number}[]>(this.URL + `/CredifitUsers/getByUsername?username=${username}`, httpOptions)
  }

  blockUser(id_usuario: number, usernameLog: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.put<any>(this.URL + `/CredifitUsers/block?id=${id_usuario}&usernameLog=${usernameLog}`, {}, httpOptions)
  }

  unblockUser(user_id: number, usernameLog: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.put<any>(this.URL + `/CredifitUsers/unblock?id=${user_id}&usernameLog=${usernameLog}`, {}, httpOptions)
  }
}
