import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Fetch } from '../../services/fetch.service';

const isImage = /\.(png|jpe?g|gif|tiff|jfif|webp|svg|ico)$/;
const isText = /\.(txt|x?html?|xml|json|js|ts|tson|md|s?css|less|sass|toml|java|cs|csproj|sln)$/;
const isAudio = /\.(wav|mp3|ogg|adts|webm|flac)$/;
const isVideo = /\.(mp4|webm|ogv)$/

@Component({
    selector: 'app-file-viewer',
    templateUrl: './file-viewer.component.html',
    styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: {
            file: string, 
            contents: any
        },
        private fetch: Fetch) { }

    ngOnInit() {
        if (!this.data)
            throw "Invalid data reference for fileviewer dialog popup";

        this.fetch.post(`api/filesystem/file`, { path: this.data.file })
            .then(contents => {
                
            })
    }
}
