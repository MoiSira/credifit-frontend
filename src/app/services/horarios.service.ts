import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../environments/config';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private URL = API_URL;

  constructor(private http:HttpClient) { }

  getSchedules(token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{id_horario:number, turno:string, hora_ini:string, hora_fin:string}[]>(this.URL + '/CredifitSchedules', httpOptions)
  }

  getSchedulesById(horario_id:number, token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<any>(this.URL + `/CredifitSchedules/getScheduleById?horario_id=${horario_id}`, httpOptions)
  }

}
