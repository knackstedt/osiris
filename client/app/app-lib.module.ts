// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { ResizableModule } from 'angular-resizable-element';
import { MonacoEditorComponent } from './components/monaco-editor/monaco-editor.component';
import { WindowToolbarComponent } from './components/window-template/window-toolbar/window-toolbar.component';
import { WindowTemplateComponent } from './components/window-template/window-template.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { ContextMenuDirective } from './directives/context-menu.directive';


@NgModule({
    declarations: [
        MonacoEditorComponent,
        WindowToolbarComponent,
        WindowTemplateComponent,
        ContextMenuComponent,
        ContextMenuDirective
    ],
    imports: [
        CommonModule,
        ResizableModule,
        MaterialModule
    ],
    exports: [
        ContextMenuDirective,
        CommonModule,
        ResizableModule,
        FormsModule,
        ReactiveFormsModule,
        MonacoEditorComponent,
        WindowToolbarComponent,
        WindowTemplateComponent,
        ContextMenuComponent
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class AppLibModule { }
