import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

    @Input() data: {
        file: string | string[],
        dir: string
    };
    

    @Output() onDownload = new EventEmitter();
    
    constructor() { }

    ngOnInit() {
        
    }

    getLink() {
        const f = Array.isArray(this.data.file) ? this.data.file[0] : this.data.file;
        return "api/filesystem/download?file=" + encodeURIComponent(f) + "&dir=" + encodeURIComponent(this.data.dir);
        // return "";
    }

    isAudioOnly() {
        // let ext = this.data.file.split(".").splice(-1, 1)[0];
        // return /mp3|ogg|flac/.test(ext);
        return false;
    }
}
