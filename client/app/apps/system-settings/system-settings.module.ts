import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SystemSettingsComponent } from './system-settings.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';
import { AboutComponent } from './panels/about/about.component';

@NgModule({
    declarations: [
        AboutComponent,
        SystemSettingsComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: SystemSettingsComponent }])
    ]
})
export class SystemSettingsModule { }
