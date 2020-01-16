import { EventInput, CalendarConfig } from './model/calendar.model';
import { CalendarService } from './service/calendar.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  @Input('events')
  set events(value: EventInput[]) {
    this.calendar.eventsInput = value;
  }

  @Input('config')
  set config(value: CalendarConfig) {
    this.calendar.calendarConfig = {...this.calendar.calendarConfig, ...value};
  }

  constructor(public calendar: CalendarService) { }

  ngOnInit() {
    const today = new Date();
    this.calendar.createData(today);
  }
  
  /**
   * @name navigate
   * @description on select of next or previos month this method is called
   * @param action it is either -1 (prev) or +1 (next)
   */
  navigate(action: number): void {
    this.calendar.onNavigation(action);
  }

}
