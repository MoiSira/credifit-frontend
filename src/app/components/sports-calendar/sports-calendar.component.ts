import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridWeek from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import esLocale from '@fullcalendar/core/locales/es';
import { TimeFormatVenService } from 'src/app/services/time-format-ven.service';
import { CalendarEventSetColorService } from 'src/app/services/calendar-event-set-color.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SportsCalendarService } from 'src/app/services/sports-calendar.service';
import { ValidationsService } from 'src/app/services/validations.service';
import { RbacPermissions } from 'src/app/modules/management/models/rbac-permissions';
import { RbacControlService } from 'src/app/services/rbac-control.service';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { DialogCustomComponent } from '../dialog-custom/dialog-custom.component';

@Component({
  selector: 'app-sports-calendar',
  templateUrl: './sports-calendar.component.html',
  styleUrls: ['./sports-calendar.component.css']
})
export class SportsCalendarComponent implements OnInit {
  constructor(
    public dialogService: DialogService,
    private userService: UsuariosService,
    private timeFormatVenService: TimeFormatVenService,
    private calendarEvents: CalendarEventSetColorService,
    private sportsService: SportsCalendarService,
    private validationsService: ValidationsService,
    private toastr: ToastrService,
    private rbacControl: RbacControlService,
    private router: Router
  ) {}

  @ViewChild('modalCrearActDepo') modalCrearActDepo!: TemplateRef<any>;
  @ViewChild('modalInfoActDepo') modalInfoActDepo!: TemplateRef<any>;

  token:string = localStorage.getItem('token') ?? '';
  username:string = localStorage.getItem('username') ?? '';
  activitiesEvents: {}[] = []; //Array de objetos con las actividades deportivas
  nombreActividadModal!: string;
  fechaActividadModal!: string;
  horaInicioActividadModal!: string;
  horaFinActividadModal!: string;
  lugarActividadModal!: string;
  activityNameControl: FormControl = new FormControl('', Validators.required);
  activityDateControl: FormControl = new FormControl(new Date(), Validators.required);
  activityTimeStartControl!: FormControl
  activityTimeEndControl!: FormControl
  activityPlaceControl: FormControl = new FormControl('', Validators.required);
  buttonDisabled: boolean = true;
  permissions!: RbacPermissions;
  dialogRef!: MatDialogRef<DialogCustomComponent>;
  fieldsValid!: boolean;
  pastDaysValid!: boolean;
  finalHourValid!: boolean;

  calendarOptions: CalendarOptions = {
    locale: esLocale,
    headerToolbar: {},
    customButtons: {
      createAct: {
        text: 'Crear',
        click: () => {
          // Obtener la hora actual en formato HH:mm
          const now = new Date();
          const currentHour = ('0' + now.getHours()).slice(-2);
          const currentMinute = ('0' + now.getMinutes()).slice(-2);
          const currentTime = `${currentHour}:${currentMinute}`;
          // Asignar la hora actual al FormControl
          this.activityTimeStartControl = new FormControl(currentTime, Validators.required);
          this.activityTimeEndControl = new FormControl(currentTime, Validators.required);
          if (this.modalCrearActDepo) {
            this.dialogRef = this.dialogService.openDialog({template: this.modalCrearActDepo}, '450px', true)
            this.dialogRef.afterClosed().subscribe(res => {console.log('Dialog close', res);})
          }
        }
      }
    },
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridWeek, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    events: [],
    eventClick: (info) => {
      const token = localStorage.getItem('token') ?? '';
      const eventObj = info.event;
      this.nombreActividadModal = eventObj.title;
      this.fechaActividadModal = eventObj.startStr.slice(0, 10);
      this.horaInicioActividadModal = eventObj.startStr.slice(11, 16);
      this.horaFinActividadModal = eventObj.endStr.slice(11, 16);
      this.sportsService.getSportsActivityById(parseInt(eventObj.id), token)
      .subscribe(
        res => {
          this.lugarActividadModal = res[0].lugar;
          if (this.modalInfoActDepo) {
            this.dialogRef = this.dialogService.openDialog({template: this.modalInfoActDepo}, '350px', false)
            this.dialogRef.afterClosed().subscribe(res => {console.log('Dialog close', res);})
          }
        },
        err => {
          console.log(err);
        }
      )
    }
  };

  ngOnInit(): void {
    this.setUserPermissions()
    this.setCalendarSportsAct()
  }

  setUserPermissions() {
    this.userService.getUsersByUsername(this.username, this.token)
    .subscribe(
      res => {
        this.permissions = this.rbacControl.getPermissions(res[0].rol);
        this.setCalendarHeaderToolbar();
      },
      err => {
        console.log(err);
      }
    )
  }

  setCalendarHeaderToolbar() {
    this.calendarOptions.headerToolbar = {
      left  : 'prev,next today',
      center: 'title',
      right : this.permissions?.actions?.cargarActividadesDeportivas ? 'createAct dayGridMonth,timeGridWeek,timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
    };
  }

  setCalendarSportsAct() {
    const token = localStorage.getItem('token') ?? '';
    this.sportsService.getSportsActivities(token)
    .subscribe(
      res => {
        res.forEach(activity => {
          const {id_actividad, fecha, hora_ini, hora_fin, nombre} = activity
          this.activitiesEvents.push({
            id: id_actividad,
            title: nombre, // a property!
            start: this.timeFormatVenService.formatTime(fecha, hora_ini),
            end: this.timeFormatVenService.formatTime(fecha, hora_fin),
            backgroundColor: this.calendarEvents.setColor(hora_ini).eventsBackgroundColor,
            borderColor: this.calendarEvents.setColor(hora_ini).eventsBorderColor
          })
          this.calendarOptions.events = this.activitiesEvents;
        })
      },
      err => {
        console.log(err);
        console.log(err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    )
  }

  createSportsAct() {
    const username = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const invalidTitle = 'Actividad cancelada';
    const invalidMessage = 'No puede crear actividades en días pasados';

    this.activityDateControl.markAsTouched();
    this.fieldsValid = this.validationsService.activitiesFieldsRequireds(
      this.activityNameControl.valid,
      this.activityDateControl.valid,
      this.activityTimeStartControl.valid,
      this.activityTimeEndControl.valid,
      this.activityPlaceControl.valid
    );

    this.validationsService.pastDaysValidator(
      this.activityDateControl.value.toISOString(),
      this.activityTimeStartControl.value + ':00',
      invalidTitle,
      invalidMessage
    )
    .subscribe(
      isValid => {
        this.pastDaysValid = isValid;
      }
    );

    this.finalHourValid = this.validationsService.finalHoursValidator(
      this.activityDateControl.value.toISOString(),
      this.activityTimeStartControl.value,
      this.activityTimeEndControl.value
    );
    if (this.fieldsValid && this.pastDaysValid && this.finalHourValid) {
      this.sportsService.createSportsActivity(
        {
          nombre: this.activityNameControl.value,
          fecha: this.activityDateControl.value.toISOString().slice(0, 10),
          hora_ini: this.activityTimeStartControl.value + ':00',
          hora_fin: this.activityTimeEndControl.value + ':00',
          lugar: this.activityPlaceControl.value,
          usernameLog: username
        },
        token
      ).subscribe(
        res => this.dialogRef.close(res),
        err => console.log(err)
      )
      setTimeout(() => {
        location.reload();
      }, 1500);
      return this.toastr.success('Actividad creada con exito', 'Actividad creada');
    } else {
      console.log('Error al crear la actividad');
      return;
    }
  }

  enableCreateButton() {
    if (this.activityNameControl.valid && this.activityDateControl.valid && this.activityTimeStartControl.valid && this.activityTimeEndControl.valid && this.activityPlaceControl.valid) {
      this.buttonDisabled = false; // Habilitar el botón si todos los campos son válidos
    } else {
      this.buttonDisabled = true; // Inhabilitar el botón si algún campo es inválido
    }
  }

  dateFilter = (date: Date | null): boolean => {
    return this.timeFormatVenService.filterInputDate(date, 'stportActivity');
  }

}
