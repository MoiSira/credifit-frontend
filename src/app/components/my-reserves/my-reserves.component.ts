import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridWeek from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import esLocale from '@fullcalendar/core/locales/es';
import { ReservasService } from 'src/app/services/reservas.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { CalendarEventSetColorService } from 'src/app/services/calendar-event-set-color.service';
import { TimeFormatVenService } from 'src/app/services/time-format-ven.service';
import { DialogService } from 'src/app/services/dialog.service';
import { DialogCustomComponent } from '../dialog-custom/dialog-custom.component';
import { ToastrService } from 'ngx-toastr';
import { ValidationsService } from 'src/app/services/validations.service';

@Component({
  selector: 'app-my-reserves',
  templateUrl: './my-reserves.component.html',
  styleUrls: ['./my-reserves.component.css']
})
export class MyReservesComponent implements OnInit{
  constructor(
    public dialogService: DialogService,
    private reservasService: ReservasService,
    private userService: UsuariosService,
    private timeFormatVenService: TimeFormatVenService,
    private calendarEvents: CalendarEventSetColorService,
    private validationsService: ValidationsService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  @ViewChild('modalDeleteMyReservation') modalDeleteMyReservation!: TemplateRef<any>;

  usuario_id!: number;
  idReservaModal!: string;
  turnoReservaModal!: string;
  fechaReservaModal!: string;
  horaReservaModal!: string;
  dialogRef!: MatDialogRef<DialogCustomComponent>;
  reserveEvents: {}[] = []; //Array de objetos con las reservas

  calendarOptions: CalendarOptions = {
    locale: esLocale,
    headerToolbar: {
      left  : 'prev,next today',
      center: 'title',
      right : 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridWeek, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    events: [],
    eventClick: (info) => {
      const eventObj = info.event;
      this.idReservaModal = eventObj.id;
      this.turnoReservaModal = eventObj.title;
      this.fechaReservaModal = eventObj.startStr.slice(0, 10);
      this.horaReservaModal = eventObj.startStr.slice(11, 16);
      if (this.modalDeleteMyReservation) {
        this.dialogRef = this.dialogService.openDialog({template: this.modalDeleteMyReservation}, '350px', false)
        this.dialogRef.afterClosed().subscribe(res => {console.log('Dialog close', res);})
      }
    }
  };

  ngOnInit(): void {
    // Se llena el calendario con las reservas de un usuario
    this.setCalendarMyReserves()
  }

  setCalendarMyReserves() {
    const username = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    this.userService.getUsersByUsername(username, token)
    .subscribe(
      res => {
        this.usuario_id = res[0].id_usuario;
        // Se llena el calendario con las reservas de la base de datos
        this.reservasService.getReservesByUser({usuario_id: this.usuario_id}, token)
        .subscribe(
          res => {
            res['reservas'].forEach(reservation => {
              const {id_reserva, fecha, hora_ini, hora_fin, turno} = reservation
              let fechaReserva = fecha.slice(0, 10);
              this.reserveEvents.push({
                id: id_reserva,
                title: turno, // a property!
                start: this.timeFormatVenService.formatTime(fechaReserva, hora_ini),
                end: this.timeFormatVenService.formatTime(fechaReserva, hora_fin),
                backgroundColor: this.calendarEvents.setColor(hora_ini).eventsBackgroundColor,
                borderColor: this.calendarEvents.setColor(hora_ini).eventsBorderColor
              })
              this.calendarOptions.events = this.reserveEvents;
            })
          },
          err => {
            console.log(err);
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        )
      },
      err => {
        console.log(err);
      }
    );
  }

  deleteUserReservation(id_reserva: string, fecha_reserva: string, hora_reserva: string) {
    const usernameLog = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const invalidTitle = 'Eliminación de reserva cancelada';
    const invalidMessage = 'No puede eliminar reservas de días pasados';
    // La hora llega en formato hr:mn (06:00) se le agrega los ms para que quede en el formato correcto hr:mn:ms (06:00:00)
    this.validationsService.pastDaysValidator(fecha_reserva, hora_reserva + ':00', invalidTitle, invalidMessage)
    .subscribe(
      isValid => {
        if (isValid) {
          this.reservasService.deleteReservationByUser(parseInt(id_reserva), this.usuario_id, usernameLog, token)
          .subscribe(
            res => {
              this.dialogRef.close(res)
              this.toastr.success(`Reserva eliminada exitosamente`, 'Reserva Eliminado');
              setTimeout(() => {
                location.reload();
              }, 1500);
            },
            err => {
              console.log(err);
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          )
        } else {
          this.dialogRef.close()
        }
      }
    )
  }
}
