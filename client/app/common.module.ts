// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { ContextMenuDirective } from './directives/context-menu.directive';
import { UrlSanitizer, HTMLSanitizer } from './pipes/urlsanitizer.pipe';


@NgModule({
    declarations: [
        UrlSanitizer,
        HTMLSanitizer
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        NgScrollbarModule,
        ContextMenuDirective
    ],
    exports: [
        UrlSanitizer,
        HTMLSanitizer,
        ContextMenuDirective,
        CommonModule,
        FormsModule,
        NgScrollbarModule,
        ReactiveFormsModule
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class CommonAppModule { }
