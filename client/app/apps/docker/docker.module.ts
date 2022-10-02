import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DockerComponent } from './docker.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';

@NgModule({
    declarations: [
        DockerComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: DockerComponent }])
    ]
})
export class DockerModule { }
