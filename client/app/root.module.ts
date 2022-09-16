import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RootComponent } from './root.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppLibModule } from 'client/app/app-lib.module';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    RootComponent,
    AppMenuComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppLibModule,
    MaterialModule,
    PortalModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
