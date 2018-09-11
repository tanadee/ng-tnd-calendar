import {Component, OnInit, Input, Output, Injectable, EventEmitter, ViewChild, OnChanges, SimpleChanges, ElementRef, Directive, Host, ComponentFactoryResolver, ViewContainerRef, AfterViewInit, Type, ComponentRef} from '@angular/core'

export interface CalendarFormatter {
    formatDate(date :number, month :number, year :number) :string
    formatMonth(date :number, month :number, year :number) :string
    formatYear(date :number, month :number, year :number) :string
    formatString(date :number, month :number, year :number) :string
    parse(str :string) : {date:number,month:number,year:number}
}

export class CalendarNumberFormatter implements CalendarFormatter {
    formatDate(date :number, month :number, year :number) :string {
        return date + ""
    }
    formatMonth(date :number, month :number, year :number) :string {
        return month + 1 + ""
    }
    formatYear(date :number, month :number, year :number) :string {
        return year + ""
    }
    formatString(date :number, month :number, year: number) :string {
        return date + "/" + (month + 1) + "/" + year
    }
    parse(str :string) : {date:number,month:number,year:number} {
        let date = -1
        let month = -1
        let year = -1
        if (str) {
            let dateToken = str.split('/')
            if (dateToken.length >= 3) {
                date = +dateToken[dateToken.length - 3]
            }
            if (dateToken.length >= 2) {
                month = +dateToken[dateToken.length - 2] - 1
            }
            if (dateToken.length >= 1) {
                year = +dateToken[dateToken.length - 1]
            }
        }
        return {date: date, month:month, year: year}
    }
}

@Directive({
    selector: '[tnd-calendar-input]',
    host: {
        "(click)": "onClick()",
        "(keyup)": "inputChange($event)",
        "(blur)": "inputChange($event)",
        "[value]": "value",
    },
})
export class CalendarInputDirective {

    value: string = ""

    calendar: CalendarPickerComponent

    @Input("format") formatter: CalendarFormatter = new CalendarNumberFormatter()

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef,
        private elementRef: ElementRef
    ){}
    
    inputChange(event: KeyboardEvent) {
        this.dateChange((<HTMLInputElement>event.target).value)
    }

    dateChange(str: string) {
        this.value = str
        if (this.calendar) {
            let dmy = this.formatter.parse(this.value)
            if (dmy.date >= 1) {
                this.calendar.date = dmy.date
            }
            if (dmy.month >= 0) {
                this.calendar.month = dmy.month
            }
            if (dmy.year >= 1) {
                this.calendar.year = dmy.year
            }
        }
    }
    
    open() {
        if (this.calendar) {
            return
        }
        let popover = this.viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(PopoverComponent))
        popover.instance.popFrom = this.elementRef
        this.calendar = popover.instance.createView(CalendarPickerComponent)
        this.calendar.formatter = this.formatter
        this.dateChange(this.value)
        this.calendar.dateChange.subscribe(()=>{
            this.calendarChange()
            this.viewContainerRef.remove()
            this.calendar = null
        })
        this.calendar.monthChange.subscribe(()=>{
            this.calendarChange()
            this.calendar.pickMode = "date"
        })
        this.calendar.yearChange.subscribe(()=>{
            this.calendarChange()
            this.calendar.pickMode = "month"
        })
    }

    calendarChange() {
        this.value = this.formatter.formatString(this.calendar.date, this.calendar.month, this.calendar.year)
    }

    onClick() {
        this.open()
    }
}

@Component({
    selector: 'popover',
    templateUrl: 'popover.html',
    styleUrls: ['popover.scss'],
})
export class PopoverComponent {
    popFrom: ElementRef
    @ViewChild('container', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private elementRef: ElementRef,
    ){}
    createView<T>(type: Type<T>) : T {
        let childComponent = this.viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(type))
        return childComponent.instance
    }
    ngAfterViewInit() {
        let native = this.elementRef.nativeElement
        let style = native.style
        style.position = "absolute"
        style.visibility = "hidden"
        setTimeout(
            () => {
                let myHeight = this.elementRef.nativeElement.offsetHeight
                let targetTop = this.popFrom.nativeElement.offsetTop - myHeight
                let targetLeft = this.popFrom.nativeElement.offsetLeft
                if (targetTop < 0) {
                    targetTop = targetTop + myHeight + this.popFrom.nativeElement.offsetHeight
                }
                style.top = targetTop + 'px'
                style.left = targetLeft + 'px'
                style.visibility = "visible"
            }
        ,0)
    }
}

@Injectable()
export class TndCalendarMath {
    constructor(){}
    ngOnInit() {}

    // y year in Anno Domini
    // m month of year, 0 = January, 11 = December
    // d day of month
    // return day of week, 0 = Sunday, 6 = Saturday
    getDayOfWeek(y,m,d):number {
        if (m < 2) y -= 1;
        return (Math.floor(((m + 10) % 12) * 2.6 + 2.5) + d + y + Math.floor(y / 4) + Math.floor(y / 400) - Math.floor(y / 100)) % 7;
    }
   
    getLastDayOfMonth(y, m):number {
        if (m == 1) {
            return (((y % 4 == 0) && (y % 
                100 != 0)) || (y % 400 == 0)) ? 29 : 28;
        } else {
            return 30 + ((((m + 12 - 2) % 12) % 5) + 1) % 2;
        }
    }
}

@Component({
    selector: 'tnd-calendar-picker',
    templateUrl: 'calendar-picker.html',
    styleUrls: ['style.scss'],
})
export class CalendarPickerComponent implements OnInit {
    @Input("format") formatter :CalendarFormatter = new CalendarNumberFormatter()
    @Input() pickMode:string
    @Output() pickModeChange = new EventEmitter<string>()
    @Input() date:number
    @Output() dateChange = new EventEmitter<number>()
    @Input() month:number
    @Output() monthChange = new EventEmitter<number>()
    @Input() year:number
    @Output() yearChange = new EventEmitter<number>()
    constructor(private cmath: TndCalendarMath) {
        let now = new Date()
        this.date = now.getDate()
        this.month = now.getMonth()
        this.year = now.getFullYear()
        if (this.year > 2300) {
            this.year -= 543;
        }
        this.pickMode = 'date'
    }
    ngOnInit() {}
    test(event: any) {
        console.log(event)
    }
    goPickDate(year:number, month:number, date: number) {
        this.date = date
        this.month = month
        this.year = year
        this.pickMode = 'date'
    }
    goPickMonth(year:number, month:number) {
        this.month = month
        this.year = year
        this.pickMode = 'month'
    }
    goPickYear(year:number) {
        this.year = year
        this.pickMode = 'year'
    }
    setDate(date:number) {
        let lastDayofMonth = this.cmath.getLastDayOfMonth(this.year, this.month)
        if (date > lastDayofMonth) {
            date -= lastDayofMonth
            this.setMonth(this.month+1)
            this.setDate(date)
        } else if (date <= 0) {
            this.setMonth(this.month-1)
            date += this.cmath.getLastDayOfMonth(this.year, this.month)
            this.setDate(date)
        } else {
            this.date = date
            this.dateChange.emit(this.date)
        }
    }
    setMonth(month:number) {
        if (month > 11) {
            this.setYear(this.year + 1)
            this.setMonth(month - 12)
        } else if (month < 0) {
            this.setYear(this.year - 1)
            this.setMonth(month + 12)
        } else {
            this.month = month
            this.monthChange.emit(this.month)
        }
    }
    setYear(year:number) {
        this.year = year
        this.yearChange.emit(this.year)
    }
}

@Component({
    selector:'tnd-date-picker',
    templateUrl:'tnd-date-picker.html',
    styleUrls:['style.scss'],
})
export class TndDatePickerComponent implements OnChanges {
    @Input() date:number
    @Output() dateChange = new EventEmitter<number>();
    @Input() month:number
    @Output() monthChange = new EventEmitter<number>();
    @Input() year:number
    @Output() yearChange = new EventEmitter<number>();
    @Input("format") formatter :CalendarFormatter = new CalendarNumberFormatter()

    dateList:Array<Array<number>>

    constructor(private cmath:TndCalendarMath) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.month || changes.year) {
            this.populateDateArray()
        }
    }

    populateDateArray() {
        this.dateList = new Array()
        let lastMonthTotalDate = this.cmath.getLastDayOfMonth(this.year, this.month - 1);
        let totalDate = this.cmath.getLastDayOfMonth(this.year, this.month)
        let firstDay = this.cmath.getDayOfWeek(this.year, this.month, 1)
        let totalWeek = Math.ceil((totalDate + firstDay) / 7)
        for (let i = 0; i < totalWeek; i++) {
            let weekList = new Array<number>()
            for (let j = 1; j <= 7; j++) {
                let myDate = i * 7 + j - firstDay
                if (myDate > totalDate) {
                    myDate = -myDate + totalDate;
                } else if (myDate <= 0) {
                    myDate = - lastMonthTotalDate - myDate
                }
                weekList.push(myDate)
            }
            this.dateList.push(weekList)
        }
    }
    change(d:number) {
        if (d > 0) {
            this.dateChange.emit(d)
        } else {
            if (d < -15) { // last month
                let m = this.month - 1
                if (m < 0) {
                    m += 12
                    this.yearChange.emit(this.year - 1)
                }
                this.monthChange.emit(m)
            } else {
                let m = this.month + 1
                if (m > 11) {
                    m -= 12
                    this.yearChange.emit(this.year + 1)
                }
                this.monthChange.emit(m)
            }
            this.dateChange.emit(-d)
        }
    }
}

@Component({
    selector:'tnd-month-picker',
    templateUrl:'tnd-month-picker.html',
    styleUrls:['style.scss'],
})
export class TndMonthPickerComponent implements OnInit {
    @Input() month:number
    @Output() monthChange = new EventEmitter<number>();
    @Input() year:number
    @Input("format") formatter :CalendarFormatter = new CalendarNumberFormatter()
    monthList: Array<Array<number>>
    constructor() {}
    ngOnInit() {
        this.monthList = new Array<Array<number>>()
        for (let i = 0; i < 3; i++) { 
            let t = new Array<number>()
            for (let j = 0; j < 4; j++) {
                t.push(i * 4 + j)
            }
            this.monthList.push(t)
        }
    }

    change(m:number) {
        this.monthChange.emit(m);
    }
}

@Component({
    selector:'tnd-year-picker',
    templateUrl:'tnd-year-picker.html',
    styleUrls:['style.scss'],
})
export class TndYearPickerComponent implements OnChanges {
    @Input() year:number
    @Output() yearChange = new EventEmitter<number>()
    @Input("format") formatter :CalendarFormatter = new CalendarNumberFormatter()
    yearList: Array<Array<number>>
    ngOnChanges(changes:SimpleChanges) {
        if (changes.year) {
            this.setYearList(this.year)
        }
    }
    setYearList(includeYear:number) {
        let yearList = new Array<Array<number>>()
        let baseYear = Math.ceil(includeYear / 20) * 20
        for (let i = 0; i < 4; i++) {
            let yearRowList = new Array<number>()
            for (let j = 0; j < 5; j++) {
                yearRowList.push(i * 5 + j + baseYear - 19)
            }
            yearList.push(yearRowList)
        }
        this.yearList = yearList
    }
    change(y:number) {
        this.yearChange.emit(y)
    }
}