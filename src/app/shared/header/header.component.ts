import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    document.addEventListener('DOMContentLoaded', () => {
      // Agregar una clase al elemento que controla el menú retraído al cargar la página
      const pushMenuElement = document.querySelector('[data-widget="pushmenu"]');
      if (pushMenuElement) {
        pushMenuElement.classList.add('menu-retraido');
      }
    });
  }

}