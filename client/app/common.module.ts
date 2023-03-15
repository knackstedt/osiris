// Base Angular Components
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { UrlSanitizer, HTMLSanitizer } from './pipes/urlsanitizer.pipe';
import { NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';


@NgModule({
    declarations: [
        UrlSanitizer,
        HTMLSanitizer
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        NgScrollbarModule,
        NgxContextMenuDirective
    ],
    exports: [
        UrlSanitizer,
        HTMLSanitizer,
        NgxContextMenuDirective,
        CommonModule,
        FormsModule,
        NgScrollbarModule,
        ReactiveFormsModule
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class CommonAppModule { }
