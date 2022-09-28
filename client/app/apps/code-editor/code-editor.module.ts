import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CodeEditorComponent } from './code-editor.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';

@NgModule({
    declarations: [
        CodeEditorComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: CodeEditorComponent }])
    ]
})
export class CodeEditorModule { }
