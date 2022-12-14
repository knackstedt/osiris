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
import { TaskbarComponent } from './components/taskbar/taskbar.component';
import { WindowComponent } from './components/window/window.component';
import { WindowErrorComponent } from './components/window/error/error.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
    declarations: [
        RootComponent,
        TaskbarComponent,
        AppMenuComponent,
        WindowErrorComponent,
        WindowComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppLibModule,
        MaterialModule,
        PortalModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: environment.production,
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [],
    bootstrap: [RootComponent]
})
export class AppModule { }
