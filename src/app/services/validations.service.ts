import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TimeFormatVenService } from './time-format-ven.service';
import { ReservasService } from './reservas.service';
import { Observable } from 'rxjs';
import { HorariosService } from './horarios.service';
import { UsuariosService } from './usuarios.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ValidationsService {

  constructor(
    private timeFormatVenService: TimeFormatVenService,
    private reservasService: ReservasService,
    private horariosService: HorariosService,
    private usuariosService: UsuariosService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  maximumWeeklyReservations(usuario_id: number, fecha: string, horario_id: number, token: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.reservasService.getWeeklyReservesByUser({usuario_id: usuario_id, fecha: fecha, horario: horario_id}, token)
      .subscribe(
        res => {
          if (res.cantidadReservaSemana >= 3) {
            console.log("No puede tener más de 3 reservas a la semana");
            this.toastr.error('Ya tiene el máximo de reservas semanales', 'Reserva cancelada');
            observer.next(false);
          } else {
            observer.next(true);
          }
          observer.complete();
        },
        err => {
          // Manejo de errores si es necesario
          observer.error(err);
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      );
    });
  }

  // Validacion para que una reserva no pueda tener mas de 12 personas
  maximumUsersReservations(horario_id: number, reserveDate: string, token: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.horariosService.getSchedulesById(horario_id, token)
      .subscribe(
        res => {
          const hora_inicio = res[0].hora_ini;
          this.reservasService.getUsersByReservation({hora: hora_inicio, fecha: reserveDate}, token)
          .subscribe(
            res => {
              if (res['usuarios'].length >= 12) {
                console.log('Ya no hay reservas disponibles');
                this.toastr.error('Ya no hay reservas disponibles en este horario', 'Reserva cancelada');
                observer.next(false);
              } else {
                observer.next(true);
              }
              observer.complete();
            },
            err => {
              // Manejo de errores si es necesario
              observer.error(err);
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          )
        },
        err => {
          observer.error(err);
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      )
    }) 
  }

  alreadyReservationDay(usuario_id: number | string[], reserveDate: string | string[], token: string): Observable<boolean> {
    // Validacion para que no se pueda reservar si ya reservaste ese dia
    return new Observable<boolean>(observer => {
      if (typeof usuario_id == 'number' && typeof reserveDate == 'string') {
        this.reservasService.getReservesByUser({usuario_id: usuario_id}, token)
        .subscribe(
          res => {
            let reserva = res['reservas'].filter(reservation => {
              return reservation.fecha.includes(reserveDate)
            });
            if (reserva.length > 0) {
              console.log('Ya tiene reserva para el dia de hoy');
              this.toastr.error('Ya tiene reserva para este día', 'Reserva cancelada');
              observer.next(false);
            } else {
              observer.next(true);
            }
            observer.complete();
          },
          err => {
            // Manejo de errores si es necesario
            observer.error(err);
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        )
      } else if (Array.isArray(usuario_id) && Array.isArray(reserveDate)) {
        let allUsersDayValid: boolean[] = [];
        const datesByUsers = usuario_id.length * reserveDate.length;
        reserveDate.forEach(date => {
          usuario_id.forEach(user => {
            this.usuariosService.getUsersByUsername(user, token)
            .subscribe(
              res => {
                this.reservasService.getReservesByUser({usuario_id: res[0].id_usuario}, token)
                .subscribe(
                  res => {
                    let reserva = res['reservas'].filter(reservation => {
                      return reservation.fecha.includes(date)
                    });
                    if (reserva.length > 0) {
                      console.log(`${user} tiene reserva para el día ${date}`);
                      this.toastr.error(`${user} tiene reserva para el día ${date}`, 'Reserva cancelada');
                      allUsersDayValid.push(false);
                    } else {
                      allUsersDayValid.push(true);
                    }
                    const allUsersDayValidSuccess = allUsersDayValid.every(element => element === true);
                    if (allUsersDayValid.length == datesByUsers) {
                      if (allUsersDayValidSuccess) {
                        observer.next(true);
                      } else {
                        observer.next(false);
                      }
                      observer.complete();
                    }
                  },
                  err => {
                    // Manejo de errores si es necesario
                    observer.error(err);
                    localStorage.clear();
                    this.router.navigate(['/login']);
                  }
                )
              },
              err => {
                observer.error(err);
                localStorage.clear();
                this.router.navigate(['/login']);
              }
            )
          })
        })
      }
    })
  }

  reservesFieldsRequireds(fecha: boolean, users: boolean, turno: boolean, hora: boolean): Observable<boolean> {
    return new Observable<boolean>(observer => {
      if (fecha && users && turno && hora) {
        observer.next(true);
      } else {
        console.log('Debe llenar todos los campos');
        this.toastr.error('Debe llenar todos los campos', 'Actividad Cancelada')
        observer.next(false);
      }
      observer.complete();
    })
  }

  activitiesFieldsRequireds(nombre: boolean, fecha: boolean, horaIni: boolean, horaFin: boolean, lugar: boolean): boolean {
    if (nombre && fecha && horaIni && horaFin && lugar) {
      return true;
    } else {
      console.log('Debe llenar todos los campos');
      this.toastr.error('Debe llenar todos los campos', 'Actividad Cancelada')
      return false;
    }
  }

  pastDaysValidator(date: string, time: string, invalidTitle: string, invalidMessage: string, token?: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      if (typeof time === 'number' && token) {
        this.horariosService.getSchedulesById(time, token)
          .subscribe(
            res => {
              time = res[0].hora_ini;
              if (this.timeFormatVenService.formatTime(date, time) < new Date()) {
                console.log(invalidMessage);
                this.toastr.error(invalidMessage, invalidTitle);
                observer.next(false);
              } else {
                observer.next(true);
              }
              observer.complete();
            },
            err => {
              observer.error(err);
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          );
      } else {
        if (this.timeFormatVenService.formatTime(date, time) < new Date()) {
          console.log(invalidMessage);
          this.toastr.error(invalidMessage, invalidTitle);
          observer.next(false);
        } else {
          observer.next(true);
        }
        observer.complete();
      }
    });
  }

  futureDaysValidator(date: string, time: string, token: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const today = new Date();
      // Establecer la hora a las 00:00:00 para comparar solo las fechas
      today.setHours(0, 0, 0, 0);

      // Obtener la fecha límite como hoy + 1 mes
      const maxDate = new Date(today);
      maxDate.setMonth(maxDate.getMonth() + 1);

      if (typeof time === 'number') {
        this.horariosService.getSchedulesById(time, token)
          .subscribe(
            res => {
              time = res[0].hora_ini;
              if (this.timeFormatVenService.formatTime(date, time) > maxDate) {
                this.toastr.error(`No puede agendar despues del ${maxDate.getDate()}-${maxDate.getMonth() + 1}-${maxDate.getFullYear()}`, 'Reserva cancelada');
                observer.next(false);
              } else {
                observer.next(true);
              }
              observer.complete();
            },
            err => {
              observer.error(err);
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          );
      } else {
        if (this.timeFormatVenService.formatTime(date, time) > maxDate) {
          this.toastr.error(`No puede agendar despues del ${maxDate.getDate()}-${maxDate.getMonth() + 1}-${maxDate.getFullYear()}`, 'Reserva cancelada');
          observer.next(false);
        } else {
          observer.next(true);
        }
        observer.complete();
      }
    });
  }

  finalHoursValidator(dateString: string, timeStart: string, timeEnd: string): boolean {// Horas de inicio y fin en formato de cadena 'HH:mm'
    // Obtener la fecha actual para los objetos Date
    const date = new Date(dateString)
    const anio = date.getFullYear();
    const mes = date.getMonth();
    const dia = date.getDate();

    // Crear objetos Date para la hora de inicio y fin
    const horaInicio = new Date(anio, mes, dia, parseInt(timeStart.split(':')[0]), parseInt(timeStart.split(':')[1]));
    const horaFin = new Date(anio, mes, dia, parseInt(timeEnd.split(':')[0]), parseInt(timeEnd.split(':')[1]));

    // Comparar las horas
    if (horaFin < horaInicio) {
        console.log('La hora de fin es menor que la hora de inicio. ¡Error!');
        this.toastr.error('La hora de inicio no puede ser antes de la hora de finalización', 'Actividad cancelada');
        return false;
    } else {
        return true;
    }
  }
}
