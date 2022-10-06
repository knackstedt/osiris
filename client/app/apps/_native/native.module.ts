import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NativeComponent } from './native.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';
import { WindowComponent } from './window/window.component';
import { CanvasComponent } from './window/canvas/canvas.component';

@NgModule({
    declarations: [
        NativeComponent,
        WindowComponent,
        CanvasComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: NativeComponent }])
    ]
})
export class NativeModule { }
