import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Fetch } from '../../services/fetch.service';
import { OnResize, OnResizeEnd, WindowOptions } from '../../../types/window';
import { ResizeEvent } from 'angular-resizable-element';
import { Subject } from 'rxjs';

const isImage = /\.(png|jpe?g|gif|tiff|jfif|webp|svg|ico)$/;
const isAudio = /\.(wav|mp3|ogg|adts|webm|flac)$/;
const isVideo = /\.(mp4|webm|ogv)$/;
const isArchive = /\.(7z|zip|rar|tar\.?(gz|xz)?)$/;

type WorkingFile = { stats: any, type: "text" | "binary", content: string };

@Component({
    selector: 'app-file-viewer',
    templateUrl: './file-viewer.component.html',
    styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, OnResizeEnd, OnResize {
    file: WorkingFile = null;

    @Input() windowData: WindowOptions;

    resize = new Subject<void>();
    resizing = false;

    fileType: "image" | "text" | "video" | "archive" | "binary";

    public data: {
        dir: string,
        file: string
    };

    constructor(private fetch: Fetch) { }

    ngOnInit() {
        if (!this.windowData)
            throw "Invalid data reference for fileviewer dialog popup";
        this.data = this.windowData.data;

        this.fetch.post<WorkingFile>(`api/filesystem/file`, { dir: this.data.dir, file: this.data.file })
            .then(data => {
                this.file = data;
                this.fileType = (isImage.test(this.data.file) && "image") ||
                    (isAudio.test(this.data.file) && "video") ||
                    (isVideo.test(this.data.file) && "video") ||
                    (isArchive.test(this.data.file) && "archive") ||
                    (data.type == "text" && "text") ||
                    "binary";
            })
    }

    onResize(evt: ResizeEvent): void {
        this.resizing = true;
    }

    onResizeEnd() {
        this.resizing = false;
    }

    getLink() {
        return "api/filesystem/download?file=" + encodeURIComponent(this.data.file) + "&dir=" + encodeURIComponent(this.data.dir);
    }

    downloadFile() {
        let a = document.createElement("a");

        a.setAttribute("href", this.getLink());
        a.setAttribute("download", this.data.file);

        a.click();
        a.remove();
    }
}
