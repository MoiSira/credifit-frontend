import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../../environments/config';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private URL = API_URL;

  constructor(private http:HttpClient) { }

  getRoles(token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{id_rol: number, nombre_rol: string}[]>(this.URL + '/CredifitRoles', httpOptions)
  }

}
