import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { VisualizerComponent } from 'client/app/apps/music-library/visualizer/visualizer.component';
import { WaveformComponent } from 'client/app/apps/music-library/waveform/waveform.component';
import { UrlSanitizer } from 'client/app/pipes/urlsanitizer.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    imports: [
        CommonModule,
        VisualizerComponent,
        WaveformComponent,
        UrlSanitizer,
        MatButtonModule,
        MatSliderModule,
        MatIconModule
    ],
    standalone: true
})
export class PlayerComponent implements OnInit {
    @ViewChild(VisualizerComponent) vis: VisualizerComponent;

    @Input() mode: "small" | "full" = "full";

    @Input() src = "https://cdn.dotglitch.dev/music/joystock-firebird.mp3";
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

    constructor() { }

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

    onPlay() {
        this.state = "playing";
        this.context = new AudioContext();
        this.vis.start(this.context);
    }
    onPause() {
        this.state = "paused";
        this.vis.stop();
    }
    onEnd() {
        this.state = "waiting";
        this.vis.stop();
    }
}
