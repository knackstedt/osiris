import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { FileDescriptor, FSDescriptor } from '../filemanager/filemanager.component';
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
    @ViewChild(WindowTemplateComponent) windowTemplate: WindowTemplateComponent;

    @Input("window") windowRef: ManagedWindow;
    @Input() files: FSDescriptor[];

    @Output() onDownload = new EventEmitter();

    // files: FileDescriptor;

    mediaSrc: string;

    currentIndex = 0;
    isPaused = true;

    currentMedia: FSDescriptor;

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
        console.log(this.files);
        this.currentMedia = this.files[0];

        this.mediaSrc = "api/filesystem/download?file=" + encodeURIComponent(this.currentMedia.name) + "&dir=" + encodeURIComponent(this.currentMedia.path);
    }

    ngAfterViewInit() {
        this.resize();
    }

    afterMediaLoaded() {
        this.resize()
    }

    isAudioOnly() {
        // let ext = this.data.file.split(".").splice(-1, 1)[0];
        // return /mp3|ogg|flac/.test(ext);
        return false;
    }

    // Update the size to match the aspect ratio provided by the media being played
    resize() {
        const winEl = this.windowTemplate.viewContainer.element.nativeElement as HTMLElement;
        const bounds = winEl.getBoundingClientRect();

        this.windowRef.width = bounds.width;
        this.windowRef.height = bounds.height + 48;
    }
}
