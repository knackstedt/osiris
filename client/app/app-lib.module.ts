/**
 * This is a shared library that is available to all of the routed angular pages.
 * 
 * It should contain **common** dependencies such as the Syncfusion Grid.
 * 
 * Things such as the Syncfusion Kanban or Calendar component are **NOT** common dependencies.
 * Do place those dependencies in the loaded module.ts file. 
 */


// Base Angular Components
import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';

// import { UrlSanitizer } from '../utils/pipes/url-sanitizer.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ConfirmButtonComponent } from '../components/confirm-button/confirm-button.component';
import { MaterialModule } from './material.module';

@NgModule({
    declarations: [
        // UrlSanitizer,
        // ConfirmButtonComponent
    ],
    imports: [
        CommonModule,
        // LayoutModule,
        MaterialModule
    ],
    exports: [
        // UrlSanitizer,
        // MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        // ConfirmButtonComponent/
    ],
})

// @ts-ignore Ignore ts-server resolution messages
export class AppLibModule { }
