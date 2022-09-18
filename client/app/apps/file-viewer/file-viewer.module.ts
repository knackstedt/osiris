import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileViewerComponent } from './file-viewer.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';



@NgModule({
    providers: [
    ],
    declarations: [
        VideoPlayerComponent,
        ImageViewerComponent,
        CodeEditorComponent,
        FileViewerComponent
    ],
    imports: [
        CommonModule,
        AppLibModule,
        MaterialModule,
        RouterModule.forChild([{ path: '', component: FileViewerComponent }])
    ]
})
export class FileViewerModule { }
