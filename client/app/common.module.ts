// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextMenuDirective } from './directives/context-menu.directive';
import { UrlSanitizer, HTMLSanitizer } from './pipes/urlsanitizer.pipe';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
    declarations: [
        UrlSanitizer,
        HTMLSanitizer,
        ContextMenuDirective,
    ],
    imports: [
        CommonModule,
        MatDialogModule
    ],
    exports: [
        UrlSanitizer,
        HTMLSanitizer,
        ContextMenuDirective,
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class CommonAppModule { }
