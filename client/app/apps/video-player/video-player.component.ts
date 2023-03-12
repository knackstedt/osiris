import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { FileDescriptor } from '../filemanager/filemanager.component';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { ButtonPopoutComponent } from 'client/app/components/button-popout/button-popout.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss'],
    imports: [
        CommonModule,
        WindowTemplateComponent,
        ButtonPopoutComponent
    ],
    standalone: true
})
export class VideoPlayerComponent implements OnInit {

    @Input() windowRef: ManagedWindow;

    @Output() onDownload = new EventEmitter();

    file: FileDescriptor;

    currentIndex = 0;

    isPaused = true;

    constructor() { }


    brightness = 50;
    contrast = 50;
    saturation = 50;
    hue = 50;

    getFilter() {
        return [
            `brightness(${2 * this.brightness / 100})`,
            `contrast(${2 * this.contrast / 100})`,
            `saturation(${2 * this.saturation / 100})`,
            `hue(${2 * this.hue / 100})`
        ].join(" ");
    }

    ngOnInit() {

    }

    getLink(file: FileDescriptor) {
        // const f = Array.isArray(this.data.file) ? this.data.file[0] : this.data.file;
        return "api/filesystem/download?file=" + encodeURIComponent(file.name) + "&dir=" + encodeURIComponent(file.path);
    }

    isAudioOnly() {
        // let ext = this.data.file.split(".").splice(-1, 1)[0];
        // return /mp3|ogg|flac/.test(ext);
        return false;
    }
}
