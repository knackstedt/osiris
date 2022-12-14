// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { MonacoEditorComponent } from './components/monaco-editor/monaco-editor.component';
import { WindowToolbarComponent } from './components/window-template/window-toolbar/window-toolbar.component';
import { WindowTemplateComponent } from './components/window-template/window-template.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { ContextMenuDirective } from './directives/context-menu.directive';
import { ButtonPopoutComponent } from './components/button-popout/button-popout.component';
import { UrlSanitizer, HTMLSanitizer } from './pipes/urlsanitizer.pipe';


@NgModule({
    declarations: [
        UrlSanitizer,
        HTMLSanitizer,
        ContextMenuDirective,
        MonacoEditorComponent,
        WindowToolbarComponent,
        WindowTemplateComponent,
        ContextMenuComponent,
        ButtonPopoutComponent
    ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
        UrlSanitizer,
        HTMLSanitizer,
        ContextMenuDirective,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MonacoEditorComponent,
        WindowToolbarComponent,
        WindowTemplateComponent,
        ContextMenuComponent,
        ButtonPopoutComponent
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class AppLibModule { }
