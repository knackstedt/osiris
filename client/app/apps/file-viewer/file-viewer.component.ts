import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Fetch } from '../../services/fetch.service';
import { OnResize, OnResizeEnd, WindowOptions } from '../../../types/window';
import { ResizeEvent } from 'angular-resizable-element';
import { Subject } from 'rxjs';
import { KeyboardService } from '../../services/keyboard.service';
import { CatchErrors, ManagedWindow } from '../../services/window-manager.service';

const isImage = /\.(png|jpe?g|gif|tiff|jfif|webp|svg|ico)$/;
const isAudio = /\.(wav|mp3|ogg|adts|webm|flac)$/;
const isVideo = /\.(mp4|webm|ogv)$/;
const isArchive = /\.(7z|zip|rar|tar\.?(gz|xz)?)$/;

type WorkingFile = { 
    name: string,
    stats: any, 
    type: "text" | "binary", 
    content: string 
};

@CatchErrors()
@Component({
    selector: 'app-file-viewer',
    templateUrl: './file-viewer.component.html',
    styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, OnResizeEnd, OnResize {
    file: WorkingFile = null;

    @Input() windowData: ManagedWindow;

    resize = new Subject<void>();
    resizing = false;

    fileType: "image" | "text" | "video" | "archive" | "binary";

    data: {
        dir: string,
        file: string[]
    };

    isMultiple: boolean;

    constructor(private fetch: Fetch, private keyboard: KeyboardService) {
        console.log("fileviewer constructor")
        keyboard.onKeyCommand({
            ctrl: true,
            key: "s",
            window: this.windowData
        }).subscribe(() => {
            this.downloadFile()
        })
    }

    ngOnInit() {
        console.log("Throwing the damn error");
        throw new Error("Test eHandle");

        if (!this.windowData)
            throw new Error("Invalid data reference for fileviewer dialog popup");
        this.data = this.windowData.data;

        if (!this.data || !this.data.file || this.data.file.length == 0) 
            throw new Error("Invalid argument passed to container");

        this.isMultiple = this.data.file.length >= 1;

        this.fetch.post<WorkingFile[]>(`api/filesystem/file`, { dir: this.data.dir, file: this.data.file })
            .then(data => {
                data.forEach(file => {
                    // ....
                    // this.fileType = (isImage.test(file) && "image") ||
                    //     (isAudio.test(file) && "video") ||
                    //     (isVideo.test(file) && "video") ||
                    //     (isArchive.test(file) && "archive") ||
                    //     (data.type == "text" && "text") ||
                    //     "binary";
                })
            })
    }

    onResize(evt: ResizeEvent): void {
        this.resizing = true;
    }

    onResizeEnd() {
        this.resizing = false;
    }

    getLink() {
        // return "api/filesystem/download?file=" + encodeURIComponent(this.data.file) + "&dir=" + encodeURIComponent(this.data.dir);
        return "";
    }

    downloadFile() {
        // let a = document.createElement("a");

        // a.setAttribute("href", this.getLink());
        // a.setAttribute("download", this.data.file);

        // a.click();
        // a.remove();
    }
}
