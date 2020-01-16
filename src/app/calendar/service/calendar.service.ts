import { Injectable } from "@angular/core";
import { CalendarConfig, EventInput, Event, Calendar, PayloadForDataCreation, Day } from '../model/calendar.model';
@Injectable({
    providedIn: 'root'
})
export class CalendarService {
    private DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    private MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    private daysMatrix: Object[] = [];
    eventsInput: EventInput[] = [];
    colorCache = {};
    data: Calendar = {
        noOfDays: 0,
        daysData: [],
        eventsData: [],
        maxRows: 0,
        height: 0,
        title: '',
        activeDate: null,
        noEvents: false
    };

    calendarConfig: CalendarConfig = {
        width: 150,
        border: 1,
        noEventsMsg: 'No Events Found',
        events: {
            offsetTop: 40,
            offsetBottom: 10,
            height: 16,
            spacing: 3
        }
    };

    /**
     * @name onNavigation
     * @description load the next or rev month data
     * @param action it is either -1 (prev) or +1 (next)
     */
    onNavigation(action: number): void {
        const newDate = new Date(this.data.activeDate);
        if (action === 1) {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }

        this.reset();
        this.createData(newDate);
    }

    /**
     * @name createData
     * @description generate the data required for graph
     * @param date from the active month
     */
    createData(activeDate: Date): void {
        const month = activeDate.getMonth();
        const year = activeDate.getFullYear();
        this.data.title = `${this.MONTHS[month]} ${year}`;
        this.data.activeDate = activeDate;
        this.data.noOfDays = this.daysInMonth(month, year);
        const sDate = this.getDateString(activeDate, 1);
        const eDate = this.getDateString(activeDate, this.data.noOfDays);

        for (let i = 0; i <= this.data.noOfDays; i++) {
            this.daysMatrix.push({});
        }

        this.data.daysData.length = 0;
        this.data.daysData = this.generateCalenderDays(this.data.noOfDays, activeDate);
        this.data.eventsData.length = 0;
        this.eventsInput.forEach((event: EventInput) => {
            const { start, end, name } = event;
            // compare the start and end dates and if the dates in active moth and year then add it to events data
            if (!((this.compareDates(start, sDate) === -1 && this.compareDates(end, sDate) === -1) || (this.compareDates(start, eDate) === 1 && this.compareDates(end, eDate) === 1))) {
                if (this.compareDates(start, sDate) <= 0 && this.compareDates(end, eDate) >= 0) {
                    this.setEventData({ s: 1, e: this.data.noOfDays, name, start, end });
                } else if (this.compareDates(start, sDate) <= 0 && this.compareDates(end, eDate) <= 0) {
                    const endDate = new Date(end).getDate();
                    this.setEventData({ s: 1, e: endDate, name, start, end })
                } else if (this.compareDates(start, sDate) >= 0 && this.compareDates(end, eDate) <= 0) {
                    const startDate = new Date(start).getDate();
                    const endDate = new Date(end).getDate();
                    this.setEventData({ s: startDate, e: endDate, name, start, end });
                } else if (this.compareDates(start, sDate) >= 0 && this.compareDates(end, eDate) >= 0) {
                    const startDate = new Date(start).getDate();
                    this.setEventData({ s: startDate, e: this.data.noOfDays, name, start, end });
                } else {
                    const date = new Date(start).getDate();
                    this.setEventData({ s: date, e: date, name, start, end });
                }
            }
        });

        this.data.noEvents = !this.data.maxRows;
        this.data.height = (this.data.maxRows * (this.calendarConfig.events.height + this.calendarConfig.events.spacing)) + this.calendarConfig.events.offsetTop + this.calendarConfig.events.offsetBottom;
    }

    /**
     * @name setEventData
     * @description set the event datas like color code, values for positioning, title, width
     * @param date from the active month
     */
    private setEventData(data: PayloadForDataCreation): void {
        const { s, e, name, start, end } = data;
        const colorCodeFromCache = this.colorCache[`${name}_${start}_${end}`];
        let colorCode = '';
        if (colorCodeFromCache) {
            colorCode = colorCodeFromCache
        } else {
            colorCode = '#' + Math.floor(Math.random() * 16777215).toString(16);
            this.colorCache[`${name}_${start}_${end}`] = colorCode;
        }
        const event: Event = {
            name,
            dateText: s !== e ? ` from ${start} to ${end}` : ` on ${start}`,
            colorCode,
            left: (s - 1) * this.calendarConfig.width,
            width: (e - s) ? ((e - s) + 1) * this.calendarConfig.width : this.calendarConfig.width,
            top: ((this.getRowPosition(s, e) - 1) * (this.calendarConfig.events.height + this.calendarConfig.events.spacing)) + this.calendarConfig.events.offsetTop
        }
        this.data.eventsData.push(event);
    }

    /**
     * @name setEventData
     * @description get the row number in which you can draw the events without overlap
     * @param s from date in that month
     * @param e to date in that month
     * @returns row number for which all the columns are available for drawing
     */
    private getRowPosition(s: number, e: number): number {
        const matrix = this.daysMatrix;
        let columnCheck = s + 1;
        let available = false;
        let rn = 1;
        while (!available) {
            if (!matrix[s][rn]) {
                if (s === e) {
                    // if event of one day
                    matrix[s][rn] = true;
                    if (rn > this.data.maxRows) {
                        this.data.maxRows = rn;
                    }
                    break;
                }
                while (!matrix[columnCheck][rn]) {
                    if (columnCheck === e) {
                        // when all the columns for the row number rn is free
                        available = true;
                        if (rn > this.data.maxRows) {
                            this.data.maxRows = rn;
                        }
                        break;
                    }
                    columnCheck++;
                }
                if (available) {
                    for (let i = s; i < e + 1; i++) {
                        matrix[i][rn] = true;
                    }
                    break;
                }
            }
            rn++;
        }
        return rn;
    }

    /**
    * @name daysInMonth
    * @description get the number of days in that month
    * @param month month for which you want to get
    * @param year year for which you want to get
    * @returns number of days
    */
    private daysInMonth(month: number, year: number): number {
        return new Date(year, month, 0).getDate();
    }

    /**
    * @name getDateString
    * @description get the formatted date string
    * @param dateObject date object
    * @param date date of that month
    * @returns formatted date string
    */
    private getDateString(dateObject: Date, date: number): string {
        let dd = date ? date : dateObject.getDate().toString();
        let mm = (dateObject.getMonth() + 1).toString();

        var yyyy = dateObject.getFullYear();
        if (+dd < 10) {
            dd = '0' + dd;
        }
        if (+mm < 10) {
            mm = '0' + mm;
        }
        return mm + '/' + dd + '/' + yyyy;
    }

    /**
    * @name compareDates
    * @description used for comparing 2 dates
    * @param date 1 date string
    * @param date 2 date string
    * @returns return the 1,0,-1 
    */
    private compareDates(date1: string, date2: string): number {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        if (d1 > d2) return 1;
        else if (d1 < d2) return -1;
        else return 0;
    }

    /**
    * @name reset
    * @description reset calendar data when nextprev month is selected
    */
    private reset(): void {
        this.daysMatrix.length = 0;
        this.data = {
            noOfDays: 0,
            daysData: [],
            eventsData: [],
            maxRows: 0,
            height: 0,
            title: '',
            activeDate: null,
            noEvents: false
        }
    }

    /**
    * @name generateCalenderDays
    * @description generate the day name and date for drawing in calendar
    * @param noOfDays number of days in tha month
    * @param dateInstance date object from of the active moth
    * @returns array of object with day name and date values
    */
    private generateCalenderDays(noOfDays: number, dateInstance: Date): Day[] {
        let dayIndex = (new Date(this.getDateString(dateInstance, 1))).getDay();
        const daysArr: Day[] = [];
        let date = 1;
        while (date <= noOfDays) {
            dayIndex = dayIndex === 7 ? 0 : dayIndex;
            daysArr.push({ day: this.DAYS[dayIndex], date });
            date++;
            dayIndex++;
        }
        return daysArr;
    }
}