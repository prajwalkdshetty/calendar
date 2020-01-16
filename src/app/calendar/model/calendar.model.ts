export interface EventInput {
    name: string;
    start: string;
    end: string;
}

export interface EventConfig {
    offsetTop: number;
    offsetBottom: number;
    height: number;
    spacing: number;
}
export interface CalendarConfig {
    width: number;
    border: number;
    noEventsMsg: string;
    events: EventConfig;
}

export interface Event {
    name: string;
    dateText: string;
    colorCode: string;
    left: number,
    width: number;
    top: number;
}
export interface Day {
    day: string;
    date: number;
}
export interface PayloadForDataCreation {
    s: number;
    e: number;
    name: string;
    start: string;
    end: string;
}
export interface Calendar {
    noOfDays: number;
    daysData: Day[];
    eventsData: Event[];
    maxRows: number;
    height: number;
    title: string;
    activeDate: Date;
    noEvents: boolean;
}