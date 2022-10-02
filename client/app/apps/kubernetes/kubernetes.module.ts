import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KubernetesComponent } from './kubernetes.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';

@NgModule({
    declarations: [
        KubernetesComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: KubernetesComponent }])
    ]
})
export class KubernetesModule { }
