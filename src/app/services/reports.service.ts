import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/environments/config';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private URL = API_URL;

  constructor(
    private http:HttpClient
  ) { }

  getReportsDay(fecha:string, token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<any>(this.URL + `/CredifitReports/getReportsDay?fecha=${fecha}`, httpOptions)
  }

}
