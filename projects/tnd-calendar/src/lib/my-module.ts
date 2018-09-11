import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CalendarPickerComponent, 
  TndMonthPickerComponent, 
  TndYearPickerComponent, 
  TndCalendarMath, 
  TndDatePickerComponent, 
  CalendarInputDirective, 
  PopoverComponent, 
} from './calendar-picker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports:[
    CalendarPickerComponent,
    CalendarInputDirective,
  ],
  declarations: [
    CalendarPickerComponent,
    TndDatePickerComponent,
    TndMonthPickerComponent,
    TndYearPickerComponent,
    CalendarInputDirective,
    PopoverComponent,
  ],
  providers:[
    TndCalendarMath,
  ],
  entryComponents:[
    CalendarPickerComponent,
    PopoverComponent,
  ],
})
export class MyModule { }
