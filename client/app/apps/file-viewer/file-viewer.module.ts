import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileViewerComponent } from './file-viewer.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { MaterialModule } from 'client/app/material.module';
import { VideoPlayerComponent } from './video-player/video-player.component';


@NgModule({
    declarations: [
        VideoPlayerComponent,
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
