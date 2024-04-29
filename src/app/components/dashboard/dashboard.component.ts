import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef, inject, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridWeek from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import esLocale from '@fullcalendar/core/locales/es';
import { HorariosService } from 'src/app/services/horarios.service';
import { ReservasService } from 'src/app/services/reservas.service';
import { TimeFormatVenService } from 'src/app/services/time-format-ven.service';
import { CalendarEventSetColorService } from 'src/app/services/calendar-event-set-color.service';
import { DialogService } from 'src/app/services/dialog.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { RbacPermissions } from 'src/app/modules/management/models/rbac-permissions';
import { RbacControlService } from 'src/app/services/rbac-control.service';
import { ValidationsService } from 'src/app/services/validations.service';
import { ToastrService } from 'ngx-toastr';
import { DialogCustomComponent } from '../dialog-custom/dialog-custom.component';
import { Observable, forkJoin, map, startWith } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { UsersData } from '../usuarios/usuarios.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit{

  @ViewChild('modalReservar') modalReservar!: TemplateRef<any>;
  @ViewChild('modalUserBlock') modalUserBlock!: TemplateRef<any>;
  @ViewChild('modalReglasGym') modalReglasGym!: TemplateRef<any>;
  @ViewChild('modalUsuariosReservas') modalUsuariosReservas!: TemplateRef<any>;
  @ViewChild('usersChipsInput') usersChipsInput!: ElementRef<HTMLInputElement>;

  announcer = inject(LiveAnnouncer);

  schedules: {id_horario: number, hora_ini: string, hora_fin: string}[] = []; //Horarios
  schedulesShift: { [key: string]: { id_horario: number, hora_ini: string, hora_fin: string }[] } = {}; //Horarios agrupados por turnos
  schedulesShiftKey: (keyof typeof this.schedulesShift)[] = []; //Array de los turnos
  reserveDateControl: FormControl = new FormControl(new Date(), Validators.required); //Fecha del campo inptu de la reserva
  reserveDatesRange!: string[];
  selectedShiftControl: FormControl = new FormControl('', Validators.required); //Turno seleccionado
  selectedTimeControl: FormControl = new FormControl('', Validators.required); //Hora seleccionada
  selectedPeriodShiftControl: FormControl = new FormControl('', Validators.required); //Turno seleccionado
  selectedPeriodTimeControl: FormControl = new FormControl('', Validators.required); //Hora seleccionada
  usersChipsControl: FormControl = new FormControl('', Validators.required);
  filteredUsers!: Observable<string[]>;
  chipsUsers: string[] = [];
  allChipsUsers: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
  });
  buttonDisabled: boolean = true; //Hablilitador del boton de crear reserva
  reserveEvents: {}[] = []; //Array de objetos con las reservas
  turnoReservaModal!: string;
  fechaReservaModal!: string;
  horaReservaModal!: string;
  usersReservaModal!: { id_reserva: number, fecha: string, id_horario: number, turno: string, hora_ini: string, hora_fin: string, id_usuario: number, nombre: string, apellido: string }[]
  userId!: number;
  userBlock!: number;
  id_reserva: number = 0;
  dialogRef!: MatDialogRef<DialogCustomComponent>;
  permissions!: RbacPermissions;
  tabIndexSelected: number = 0;
  fieldsValid!: boolean;
  pastDaysValid!: boolean;
  maxWeekResValid!: boolean;
  maxUserResValid!: boolean;
  alreadyResValid!: boolean;

  constructor(
    public dialogService: DialogService,
    private horariosService: HorariosService,
    private reservasService: ReservasService,
    private usuariosService: UsuariosService,
    private timeFormatVenService: TimeFormatVenService,
    private calendarEvents: CalendarEventSetColorService,
    private toastr: ToastrService,
    private rbacControl: RbacControlService,
    private popoverDayMaxEvent: ElementRef,
    private renderer: Renderer2,
    private validationsService: ValidationsService,
    private router: Router
  ) {
    this.filteredUsers = this.usersChipsControl.valueChanges.pipe(
      startWith(null),
      map((user: string | null) => (user ? this._filter(user) : this.allChipsUsers.slice())),
    );
  }

  calendarOptions: CalendarOptions = {
    locale: esLocale,
    dayMaxEvents: true,
    headerToolbar: {
      left  : 'prev,next today',
      center: 'title',
      right : 'reserve dayGridMonth,timeGridWeek,timeGridDay'
    },
    customButtons: {
      reserve: {
        text: 'Reservar',
        click: () => {
          if (this.userBlock == 0) {
            if (this.modalReservar) {
              this.dialogRef = this.dialogService.openDialog({template: this.modalReservar}, '450px', true)
              this.dialogRef.afterClosed().subscribe(res => {console.log('Dialog close', res);})
            }
          } else {
            if (this.modalUserBlock) {
              this.dialogRef = this.dialogService.openDialog({template: this.modalUserBlock}, '450px', true)
              this.dialogRef.afterClosed().subscribe(res => {console.log('Dialog close', res);})
            }
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
      this.turnoReservaModal = eventObj.title;
      this.fechaReservaModal = eventObj.startStr.slice(0, 10);
      this.horaReservaModal = eventObj.startStr.slice(11, 16);
      this.closePopover();
      this.reservasService.getUsersByReservation({hora: eventObj.startStr.slice(11, 19), fecha: eventObj.startStr.slice(0, 10)}, token)
      .subscribe(
        res => {
          this.usersReservaModal = res['usuarios'];
          if (this.modalUsuariosReservas) {
            this.dialogRef = this.dialogService.openDialog({template: this.modalUsuariosReservas}, '400px', false)
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
    // Trae los horarios de entrenamiento de la base de datos
    this.setCalendarSchedules()

    // Se llena el calendario con las reservas de la base de datos
    this.setCalendarReserves()

    this.setChipsUsers()
  }

  ngAfterViewInit(): void {
    if (this.modalReglasGym) {
      this.dialogService.openDialog({template: this.modalReglasGym}, '1100px', true).afterClosed().subscribe(res => {console.log('Dialog close', res);})
    }
    // ESTO ES POR SI NO QUIEREN QUE EL MODAL SE MUESTRE CADA VEZ QUE SE VAYA A DASHBOARD O REFRESQUE EL DASHBOARD
    // const modalShown = localStorage.getItem('modalShown');
    // if (!modalShown) {
    //   // Mostrar el modal
    //   this.showModal = true;
      
    //   // Guardar en el Local Storage que el modal ya se mostró
    //   localStorage.setItem('modalShown', 'true');
    // }
  }

  setUserPermissions() {
    const token = localStorage.getItem('token') ?? '';
    const username = localStorage.getItem('username') ?? '';
    this.usuariosService.getUsersByUsername(username, token)
    .subscribe(
      res => {
        this.permissions = this.rbacControl.getPermissions(res[0].rol);
        this.userId = res[0].id_usuario;
        this.userBlock = res[0].estatus;
      },
      err => {
        console.log(err);
      }
    )
  }

  setCalendarSchedules() {
    const token = localStorage.getItem('token') ?? '';
    // Trae los horarios de entrenamiento de la base de datos
    this.horariosService.getSchedules(token)
    .subscribe(
      res => {
        res.forEach(schedule => {
          const { id_horario, turno, hora_ini, hora_fin } = schedule;
          if (!this.schedulesShift[turno]) {
              this.schedulesShift[turno] = [];
          }
          this.schedulesShift[turno].push({ id_horario, hora_ini, hora_fin });
        })
        this.schedulesShiftKey = Object.keys(this.schedulesShift);
      },
      err => {
        console.log(err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    )
  }

  setCalendarReserves() {
    const token = localStorage.getItem('token') ?? '';
    // Se llena el calendario con las reservas de la base de datos
    this.reservasService.getReserves(token)
    .subscribe(
      res => {
        res.forEach(reservation => {
          const {fechaReserva, horaIni, horaFin, turno} = reservation
          this.reserveEvents.push({
            title: turno, // a property!
            start: this.timeFormatVenService.formatTime(fechaReserva, horaIni),
            end: this.timeFormatVenService.formatTime(fechaReserva, horaFin),
            backgroundColor: this.calendarEvents.setColor(horaIni).eventsBackgroundColor,
            borderColor: this.calendarEvents.setColor(horaIni).eventsBorderColor
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
  }

  // Extraccion del indice del tab seleccionado
  setTabIndexSelected(event: MatTabChangeEvent) {
    this.tabIndexSelected = event.index;
    this.enableCreateButton()
  }

  setChipsUsers() {
    const token = localStorage.getItem('token') ?? '';
    this.usuariosService.getUsers(token).subscribe(res => res.forEach(user => this.allChipsUsers.push(user.usuario)));
  }

  // Creacion de la reserva
  createReserve () {
    const username = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const invalidTitle = 'Reserva cancelada';
    const invalidMessage = 'No puede reservar días pasados';

    let validations = [];

    if (this.tabIndexSelected == 0) {
      validations = [
        this.validationsService.pastDaysValidator(this.reserveDateControl.value.toISOString(), this.selectedTimeControl.value, invalidTitle, invalidMessage, token),
        this.validationsService.futureDaysValidator(this.reserveDateControl.value.toISOString(), this.selectedTimeControl.value, token),
        this.validationsService.maximumWeeklyReservations(this.userId, this.reserveDateControl.value.toISOString().slice(0, 10), this.selectedTimeControl.value, token),
        this.validationsService.maximumUsersReservations(this.selectedTimeControl.value, this.reserveDateControl.value.toISOString().slice(0, 10), token),
        this.validationsService.alreadyReservationDay(this.userId, this.reserveDateControl.value.toISOString().slice(0, 10), token),
        this.validationsService.reservesFieldsRequireds(this.reserveDateControl.valid, true, this.selectedShiftControl.valid, this.selectedTimeControl.valid)
      ];
    } else {
      this.reserveDatesRange = this.timeFormatVenService.getDatesInRange(this.dateRange.value.start!.toISOString().slice(0, 10), this.dateRange.value.end!.toISOString().slice(0, 10))
      validations = [
        this.validationsService.pastDaysValidator(this.dateRange.value.start!.toISOString(), this.selectedPeriodTimeControl.value, invalidTitle, invalidMessage, token),
        this.validationsService.alreadyReservationDay(this.chipsUsers, this.reserveDatesRange, token),
        this.validationsService.reservesFieldsRequireds(this.dateRange.valid, this.chipsUsers.length > 0, this.selectedPeriodShiftControl.valid,this.selectedPeriodTimeControl.valid)
      ];
    }

    forkJoin(validations).subscribe(
      results => {
        // console.log(results)
        if (this.tabIndexSelected == 0) {
          const [pastDaysValid, futureDaysValid, maxWeekResValid, maxUsersResValid, alreadyResValid, resFieldsValid] = results;
          if (pastDaysValid && futureDaysValid && maxWeekResValid && maxUsersResValid && alreadyResValid && resFieldsValid) {
            this.schedules.forEach( schedule => {
              if (schedule.id_horario === parseInt(this.selectedTimeControl.value)) {
                this.reservasService.getReservesByDateAndSchedule({fecha: this.reserveDateControl.value.toISOString().slice(0, 10), horario: schedule.id_horario}, token)
                .subscribe(
                  res => {
                    if (res.length == 0) {
                      // Si la reserva no existe la crea en la base de datos con this.reserveDateControl fecha de la serverva, schedule.id_horario id del horario seleccionado
                      this.reservasService.createReservation({fecha: this.reserveDateControl.value.toISOString().slice(0, 10), horario: schedule.id_horario, usernameLog: username}, token)
                      .subscribe(
                        res => {
                          // Al crear la reserva en la base de datos me devuelve el id de la reserva, ahora creo el registro en usuarios reservar
                          this.id_reserva = res['reserva_id'];
                          this.reservasService.createUsersReservation({id_usuario: this.userId, id_reserva: this.id_reserva, usernameLog: username}, token)
                          .subscribe(
                            res => {
                              this.dialogRef.close(res)
                              this.toastr.success(`Reserva para el día ${this.reserveDateControl.value.toISOString().slice(0, 10)}`, 'Reserva exitosa');
                              setTimeout(() => {
                                location.reload();
                              }, 1500);
                            },
                            err => {
                              console.log(err);
                            }
                          )
                        },
                        err => {
                          console.log(err);
                        }
                      )
                    } else {
                      // Validar que no haya mas de 15 reservas para esta fecha con ese horario
                      this.id_reserva = res[0]['id_reserva'];
                      this.reservasService.createUsersReservation({id_usuario: this.userId, id_reserva: this.id_reserva, usernameLog: username}, token)
                      .subscribe(
                        res => {
                          this.dialogRef.close(res)
                          this.toastr.success(`Reserva para el día ${this.reserveDateControl.value.toISOString().slice(0, 10)}`, 'Reserva exitosa');
                          setTimeout(() => {
                            location.reload();
                          }, 1500);
                        },
                        err => {
                          console.log(err);
                        }
                      )
                    }
                  },
                  err => {
                    console.log(err);
                  }
                )
              }
            })
          }
        } else { // Reservas por periodos para los usuarios de calidad de vida
          const [pastDaysValid, alreadyResValid, resFieldsValid] = results;
          if (pastDaysValid && alreadyResValid && resFieldsValid) {
            const datesByUsers = this.chipsUsers.length * this.reserveDatesRange.length;
            let datesByUsersCount = 0;
            const userDayObject: { [key: string]: UsersData[] } = {};
            this.schedules.forEach( schedule => {
              this.reserveDatesRange.forEach(reserveDate => {
                this.chipsUsers.forEach(user => {
                  this.usuariosService.getUsersByUsername(user, token)
                  .subscribe(
                    res => {
                      if (schedule.id_horario === parseInt(this.selectedPeriodTimeControl.value)) {
                        if (userDayObject[reserveDate]) {
                          if (userDayObject[reserveDate].length < this.chipsUsers.length) {
                            userDayObject[reserveDate].push(res[0]);
                          }
                        } else {
                          userDayObject[reserveDate] = [res[0]];
                        }
                        // let userIdPeriodReserves = res[0].id_usuario;
                        const filledUserData = Object.values(userDayObject).every((usersDays) => usersDays.length === this.chipsUsers.length);
                        const filledDate = Object.keys(userDayObject).length === this.reserveDatesRange.length;
                        if (filledDate && filledUserData) {
                          for (let date in userDayObject) {
                            this.reservasService.getReservesByDateAndSchedule({fecha: date, horario: schedule.id_horario}, token)
                            .subscribe(
                              res => {
                                if (res.length == 0) {
                                  // Si la reserva no existe la crea en la base de datos con this.reserveDateControl fecha de la serverva, schedule.id_horario id del horario seleccionado
                                  this.reservasService.createReservation({fecha: date, horario: schedule.id_horario, usernameLog: username}, token)
                                  .subscribe(
                                    res => {
                                      userDayObject[date].forEach(user => {
                                        // Al crear la reserva en la base de datos me devuelve el id de la reserva, ahora creo el registro en usuarios reservar
                                        this.id_reserva = res['reserva_id'];
                                        this.reservasService.createUsersReservation({id_usuario: user.id_usuario, id_reserva: this.id_reserva, usernameLog: username}, token)
                                        .subscribe(
                                          res => {
                                            datesByUsersCount += 1;
                                            if (datesByUsersCount == datesByUsers) {
                                              this.dialogRef.close()
                                              setTimeout(() => {
                                                location.reload();
                                              }, 1500);
                                            }
                                            this.toastr.success(`Reserva para el día ${date}`, 'Reserva exitosa');
                                          },
                                          err => {
                                            console.log(err);
                                          }
                                        )
                                      })
                                    },
                                    err => {
                                      console.log(err);
                                    }
                                  )
                                } else {
                                  // Validar que no haya mas de 12 reservas para esta fecha con ese horario
                                  this.id_reserva = res[0]['id_reserva'];
                                  userDayObject[date].forEach(user =>{
                                    this.reservasService.createUsersReservation({id_usuario: user.id_usuario, id_reserva: this.id_reserva, usernameLog: username}, token)
                                    .subscribe(
                                      res => {
                                        datesByUsersCount += 1;
                                        if (datesByUsersCount == datesByUsers) {
                                          this.dialogRef.close()
                                          setTimeout(() => {
                                            location.reload();
                                          }, 1500);
                                        }
                                        this.toastr.success(`Reserva para el día ${date}`, 'Reserva exitosa');
                                      },
                                      err => {
                                        console.log(err);
                                      }
                                    )
                                  })
                                }
                              },
                              err => {
                                console.log(err);
                              }
                            )
                          }
                        }
                      }
                    }
                  )
                })
              })
            })
          }
        }
      }
    );
  }

  deleteUserReservation(usuario: { id_reserva: number, fecha: string, id_horario: number, turno: string, hora_ini: string, hora_fin: string, id_usuario: number, nombre: string, apellido: string; }) {
    const usernameLog = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const invalidTitle = 'Eliminación de reserva cancelada';
    const invalidMessage = 'No puede eliminar reservas de días pasados';

    this.validationsService.pastDaysValidator(usuario.fecha, usuario.hora_ini, invalidTitle, invalidMessage)
    .subscribe(
      isValid => {
        if (isValid) {
          this.reservasService.deleteReservationByUser(usuario.id_reserva, usuario.id_usuario, usernameLog, token)
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

  deleteGlobalReservation(fecha: string, hora: string) {
    const usernameLog = localStorage.getItem('username') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const invalidTitle = 'Eliminación de reserva cancelada';
    const invalidMessage = 'No puede eliminar reservas de días pasados';

    // La hora llega en formato hr:mn (06:00) se le agrega los ms para que quede en el formato correcto hr:mn:ms (06:00:00)
    this.validationsService.pastDaysValidator(fecha, hora + ':00', invalidTitle, invalidMessage)
    .subscribe(
      isValid => {
        if (isValid) {
          this.usersReservaModal.forEach(userReservation => {
            this.reservasService.deleteReservationByUser(userReservation.id_reserva, userReservation.id_usuario, usernameLog, token)
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
          })
        } else {
          this.dialogRef.close()
        }
      }
    )
  }

  filterSchedules() {
    if(this.selectedShiftControl.value) {
      this.schedules = this.schedulesShift[this.selectedShiftControl.value]
    } else if(this.selectedPeriodShiftControl.value) {
      this.schedules = this.schedulesShift[this.selectedPeriodShiftControl.value]
    }
  }

  addChipsUser(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && this.allChipsUsers.includes(value)) {
      // Verificar si el usuario ya está en la lista de chips
      if (!this.chipsUsers.includes(value)) {
        this.chipsUsers.push(value);
      }
    }
    event.chipInput!.clear();
    this.usersChipsControl.setValue(null);
  }

  removeChipsUser(user: string): void {
    const index = this.chipsUsers.indexOf(user);

    if (index >= 0) {
      this.chipsUsers.splice(index, 1);

      this.announcer.announce(`Removed ${user}`);
      this.enableCreateButton();
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allChipsUsers.filter(user =>
      user.toLowerCase().includes(filterValue) && !this.chipsUsers.includes(user)
    );
  }

  selectedChipsUser(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.viewValue;
    if (!this.chipsUsers.includes(selectedUser)) {
      this.chipsUsers.push(selectedUser);
      this.enableCreateButton();
    }
    this.usersChipsInput.nativeElement.value = '';
    this.usersChipsControl.setValue(null);
  }

  trackByFn(index: number, item: any): any {
    return index;
  }

  enableCreateButton() {
    if (this.tabIndexSelected == 0) {
      if (this.reserveDateControl.invalid || this.selectedShiftControl.invalid || this.selectedTimeControl.invalid) {
        this.buttonDisabled = true;
      } else {
        this.buttonDisabled = false;
      }
    } else {
      if (this.dateRange.invalid || this.selectedPeriodShiftControl.invalid || this.selectedPeriodTimeControl.invalid || this.chipsUsers.length <= 0) {
        this.buttonDisabled = true;
      } else {
        this.buttonDisabled = false;
      }
    }
  }

  dateFilter = (date: Date | null): boolean => {
    return this.timeFormatVenService.filterInputDate(date, 'reservation');
  }

  closePopover() {
    const popover = this.popoverDayMaxEvent.nativeElement.querySelector('.fc-popover');
    if (popover) {
      this.renderer.setStyle(popover, 'display', 'none');
    }
  }
}
