import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventSetColorService {

  constructor() { }
  setColor (hora:string): {eventsBackgroundColor:string, eventsBorderColor:string} {
    let eventsBackgroundColor = '',
    eventsBorderColor = '';
    if (parseInt(hora.slice(0, 2)) >= 5 && parseInt(hora.slice(0, 2)) < 11) {
      eventsBackgroundColor = '#0073b7';
      eventsBorderColor = '#0073b7';
    } else if (parseInt(hora.slice(0, 2)) >= 11 && parseInt(hora.slice(0, 2)) < 16) {
      eventsBackgroundColor = '#f56954';
      eventsBorderColor = '#f56954';
    } else if (parseInt(hora.slice(0, 2)) >= 16 && parseInt(hora.slice(0, 2)) < 22) {
      eventsBackgroundColor = '#00a65a';
      eventsBorderColor = '#00a65a';
    } else {
      eventsBackgroundColor = '#191649';
      eventsBorderColor = '#191649';
    };
    return {eventsBackgroundColor, eventsBorderColor};
  }
}
