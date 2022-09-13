// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { ResizableModule } from 'angular-resizable-element';


@NgModule({
    declarations: [
        // UrlSanitizer,
        // ConfirmButtonComponent
    ],
    imports: [
        CommonModule,
        ResizableModule,
        // LayoutModule,
        MaterialModule
    ],
    exports: [
        CommonModule,
        ResizableModule,
        // UrlSanitizer,
        // MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        // ConfirmButtonComponent/
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class AppLibModule { }
