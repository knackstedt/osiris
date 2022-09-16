import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {
    @Input() data: {
        file: string,
        dir: string
    };
    

    @Output() onDownload = new EventEmitter();
    
    constructor() { }

    ngOnInit() {
    }

    getLink() {
        return "api/filesystem/download?file=" + encodeURIComponent(this.data.file) + "&dir=" + encodeURIComponent(this.data.dir);
    }

    isAudioOnly() {
        let ext = this.data.file.split(".").splice(-1, 1)[0];
        return /mp3|ogg|flac/.test(ext);
    }
}
