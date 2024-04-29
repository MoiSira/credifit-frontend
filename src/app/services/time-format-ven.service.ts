import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeFormatVenService {

  constructor() { }
  formatTime(fecha: string, hora: string): Date {
    if (fecha.length > 10) {
      fecha = fecha.slice(0, 10);
    }
    let datetime = fecha + 'T' + hora + '.000Z'
    let timeFormatVenezuela = new Date(datetime);
    timeFormatVenezuela.setHours(timeFormatVenezuela.getHours() + 4);
    return timeFormatVenezuela;
  }

  filterInputDate = (date: Date | null, type: string): boolean => {
    const today = new Date();
    // Establecer la hora a las 00:00:00 para comparar solo las fechas
    today.setHours(0, 0, 0, 0);

    if (type == 'reservation') {
      // Obtener la fecha límite como hoy + 1 mes
      const maxDate = new Date(today);
      maxDate.setMonth(maxDate.getMonth() + 1);
      if (date) {
        return date >= today && date <= maxDate;
      } else {
        return false;
      }
    } else {
      if (date) {
        return date >= today;
      } else {
        return false;
      }
    }
  }

  getDatesInRange(startDate: string, endDate: string): string[] {
    const dateArray: string[] = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      dateArray.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateArray;
  }

}
