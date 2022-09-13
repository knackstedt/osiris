import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FilemanagerComponent } from './filemanager.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';

@NgModule({
    declarations: [
        FilemanagerComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: FilemanagerComponent }])
    ]
})
export class FilemanagerModule { }
