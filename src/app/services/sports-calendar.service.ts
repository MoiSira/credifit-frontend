import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../../environments/config';

@Injectable({
  providedIn: 'root'
})
export class SportsCalendarService {
  private URL = API_URL;

  constructor(
    private http: HttpClient,
  ) { }

  createSportsActivity(activity: {nombre: string, fecha: string, hora_ini: string, hora_fin: string, lugar: string, usernameLog: string}, token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.post<any>(this.URL + '/CredifitSportsActivities/new', activity, httpOptions)
  }

  getSportsActivities(token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{id_actividad: number, nombre: string, fecha: string, hora_ini: string, hora_fin: string, lugar: string}[]>(this.URL + `/CredifitSportsActivities/`, httpOptions)
  }

  getSportsActivityById(id_actividad: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{id_actividad: number, nombre: string, fecha: string, hora_ini: string, hora_fin: string, lugar: string}[]>(this.URL + `/CredifitSportsActivities/getActivityById?id_actividad=${id_actividad}`, httpOptions)
  }
}
