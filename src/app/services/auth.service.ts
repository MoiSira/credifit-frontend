import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { API_URL } from '../../environments/config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = API_URL;

  constructor(private http:HttpClient) { }

  login(user: {username: string, password: string}) {
    return this.http.post<{email:string, username:string, name:string, lastname:string, token:string}>(this.URL + '/CredifitLogin/auth', user)
  }

  loggedIn() {
    return !!localStorage.getItem('token'); // Si el token existe devuelve true sino false
  }

  logout(usernameLog: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
      })
    }
    return this.http.post<any>(this.URL + '/CredifitLogin/logout', {usernameLog}, httpOptions)
  }
}
