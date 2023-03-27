import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { VisualizerComponent } from 'client/app/apps/music-library/visualizer/visualizer.component';
import { UrlSanitizer } from 'client/app/pipes/urlsanitizer.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MusicLibraryComponent } from 'client/app/apps/music-library/music-library.component';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    imports: [
        CommonModule,
        VisualizerComponent,
        UrlSanitizer,
        MatButtonModule,
        MatSliderModule,
        MatIconModule
    ],
    standalone: true
})
export class PlayerComponent implements OnInit {
    @ViewChild("media") mediaRef: ElementRef;
    get mediaElement() { return this.mediaRef?.nativeElement as HTMLMediaElement }


    private _analyzer: AnalyserNode;
    get analyzer() {return this._analyzer;}

    private _source: MediaElementAudioSourceNode;
    get source() {return this._source;}


    @ViewChild(VisualizerComponent) vis: VisualizerComponent;
    @Input() visualizer: VisualizerComponent;
    @Input() showVisualizer = true;

    @Input() mode: "small" | "full" = "full";

    @Input() src: string;
    @Input() title: string;

    @Output() next = new EventEmitter();
    @Output() previous = new EventEmitter();
    @Output() pause = new EventEmitter();
    @Output() play = new EventEmitter();

    context: AudioContext;

    duration = 0;
    currentTime = 0;
    progress = 0;
    volume = 100;

    isShuffling = false;
    isRepeating = false;

    state: "playing" | "paused" | "waiting" = "waiting";

    constructor(private libraryComponent: MusicLibraryComponent) { }

    ngOnInit() {
    }

    // num in seconds
    numToString(num: number) {
        const hours = Math.floor(num / (60*60));
        const minutes = Math.floor(num / 60);
        const seconds = Math.floor(num % 60);

        if (hours)
            return `${hours}:${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    onPlay(track?) {
        if (track) {
            this.src = track.url;
        }
        // Update media element's src
        this.mediaElement.src = this.src;

        console.log("playing src", this.src)
        this.state = "playing";

        this.context = this.context || new AudioContext();

        if (!this.analyzer) {
            this._analyzer = this.context.createAnalyser();
            this._analyzer.connect(this.context.destination);
        }

        if (!this.source) {
            this._source = this.context.createMediaElementSource(this.mediaElement as any);
            this._source.connect(this.analyzer);
        }


        this.vis?.start(this.context, this.analyzer, this.source);
        this.visualizer?.start(this.context, this.analyzer, this.source);
        this.libraryComponent.visualizer?.start(this.context, this.analyzer, this.source);

        this.mediaElement.volume = this.volume / 100;

        this.mediaElement.play()

    }

    onPause() {
        this.state = "paused";
        this.vis?.stop();
        this.visualizer?.stop();
        this.libraryComponent.visualizer?.stop();
    }

    onEnd() {
        this.state = "waiting";
        this.vis?.stop();
        this.visualizer?.stop();
        this.libraryComponent.visualizer?.stop();

        this.duration = 0;
        this.currentTime = 0;
        this.progress = 0;

        console.log("firing playnext")
        this.next.emit();
    }
    onProgress() {
        // this.waveforms.forEach(w => w.render(this.context, this._analyzer, this._source))
    }

    onPreviousTrack() {
        this.previous.emit();
    }

    onNextTrack() {
        this.next.emit();
    }

    debug(...args) {
        console.log(args)
    }

    volumeOnWheel(event: WheelEvent) {
        // Clamp min to 0 and max to 100
        this.volume = Math.max(Math.min(this.volume - (event.deltaY / 10), 100), 0);

        this.mediaElement.volume = this.volume / 100;
    }
}
