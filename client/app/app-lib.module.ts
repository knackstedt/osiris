// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { ResizableModule } from 'angular-resizable-element';
import { MonacoEditorComponent } from './components/monaco-editor/monaco-editor.component';
import { WindowToolbarComponent } from './components/window-template/window-toolbar/window-toolbar.component';
import { WindowTemplateComponent } from './components/window-template/window-template.component';


@NgModule({
    declarations: [
        MonacoEditorComponent,
        WindowToolbarComponent,
        WindowTemplateComponent
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
        MonacoEditorComponent,
        WindowToolbarComponent,
        WindowTemplateComponent

    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class AppLibModule { }
