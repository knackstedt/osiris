// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { ResizableModule } from 'angular-resizable-element';
import { MonacoEditorComponent } from './components/monaco-editor/monaco-editor.component';


@NgModule({
    declarations: [
        MonacoEditorComponent
    ],
    imports: [
        CommonModule,
        ResizableModule,
        MaterialModule
    ],
    exports: [
        CommonModule,
        ResizableModule,
        FormsModule,
        ReactiveFormsModule,
        MonacoEditorComponent
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class AppLibModule { }
