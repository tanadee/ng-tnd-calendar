import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MyModule } from '../../projects/tnd-calendar/src/lib/my-module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MyModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
