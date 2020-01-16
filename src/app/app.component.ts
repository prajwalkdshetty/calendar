import { Component } from '@angular/core';
import { events } from '../assets/data';
import { calendarConfig } from '../assets/custom-calendar-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  config = calendarConfig;
  events = events;
}