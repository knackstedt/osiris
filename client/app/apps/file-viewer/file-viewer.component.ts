import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Fetch } from '../../services/fetch.service';
import { OnResize, OnResizeEnd, WindowOptions } from '../../../types/window';
import { ResizeEvent } from 'angular-resizable-element';
import { Subject } from 'rxjs';
import { KeyboardService } from '../../services/keyboard.service';
import { CatchErrors, ManagedWindow } from '../../services/window-manager.service';
import { FileDescriptor } from '../filemanager/filemanager.component';

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

    fileType: "image" | "text" | "video" | "archive" | "binary" | "mixed";

    data: FileDescriptor[];

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

    getMimetype(file: FileDescriptor) {
        return  (isImage.test(file.name) && "image") ||
                (isAudio.test(file.name) && "video") ||
                (isVideo.test(file.name) && "video") ||
                (isArchive.test(file.name) && "archive") ||
                (file.ext == "text" && "text") ||
                "binary"
    }

    ngOnInit() {
        if (!this.windowData || !this.windowData.data)
            throw new Error("Invalid data reference for fileviewer dialog popup");

        this.data = Array.isArray(this.windowData.data) ? this.windowData.data : [this.windowData.data];

        // Use a map to deduplicate and get a discrete count of 
        // total mimetypes provided.
        let m = {};
        this.data.map(d => this.getMimetype(d)).forEach(k => {
            m[k] = true;
        });

        const isMixed = Object.keys(m).length == 1;
        if (isMixed) {
            // Prompt saving as list
            // downloading as (tar/zip/7z/rar)
            // open with other application (...)
            // move -> new location
        }
        else {
            // Single file, can very safely open whatever dialog we need for this.
        }
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
