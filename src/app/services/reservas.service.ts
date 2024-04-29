import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../environments/config';


@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private URL = API_URL;

  constructor(
    private http:HttpClient
  ) { }

  createReservation(reservation: {fecha: string, horario: number, usernameLog: string}, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.post<any>(this.URL + '/CredifitReserves/new', reservation, httpOptions)
  }

  createUsersReservation(userReservation: {id_usuario: number, id_reserva: number, usernameLog: string}, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.post<any>(this.URL + '/CredifitUsersReserves/newUsersReservation', userReservation, httpOptions)
  }

  getReserves(token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{
      fechaReserva: string,
      horaIni: string,
      horaFin: string,
      turno: string
    }[]>(this.URL + `/CredifitReserves/`, httpOptions)
  }

  getReservesByDateAndSchedule(reservation: {fecha: string, horario: number}, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<any>(this.URL + `/CredifitReserves/reserveByDateAndSchedule?fecha=${reservation.fecha}&horario=${reservation.horario}`, httpOptions)
  }

  getWeeklyReservesByUser(weekReservation: {usuario_id: number, fecha: string, horario: number}, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<any>(this.URL + `/CredifitUsersReserves/weeklyReservesByUser?usuario=${weekReservation.usuario_id}&fecha=${weekReservation.fecha}&horario=${weekReservation.horario}`, httpOptions)
  }

  getUsersByReservation(reservation: {hora: string, fecha: string}, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{
      [usuario: string]: {
        id_reserva: number,
        fecha: string,
        id_horario: number,
        turno: string,
        hora_ini: string,
        hora_fin: string,
        id_usuario: number,
        nombre: string,
        apellido: string
      }[]
    }>(this.URL + `/CredifitUsersReserves/usersByReservation?fecha=${reservation.fecha}&hora=${reservation.hora}`, httpOptions)
  }

  getReservesByUser(user: {usuario_id:number}, token:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.get<{
      [reserva: string]: {
        id_reserva: number,
        fecha: String,
        turno: string,
        hora_ini: string,
        hora_fin: string,
        usuario: string,
        estatus: number,
        rol: number
      }[]
    }>(this.URL + `/CredifitUsersReserves/reservesByUser?usuario_id=${user.usuario_id}`, httpOptions)
  }

  deleteReservationByUser(id_reserva: number, id_usuario: number, usernameLog: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
        })
    }
    return this.http.delete<any>(this.URL + `/CredifitUsersReserves/delete?usuario_id=${id_usuario}&reserva_id=${id_reserva}&usernameLog=${usernameLog}`, httpOptions)
  }
}