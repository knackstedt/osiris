import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { WindowTemplateComponent } from '../../components/window-template/window-template.component';
import { ManagedWindow } from '../../services/window-manager.service';
import { AngularSplitModule } from 'angular-split';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ContextMenuItem, NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FSDescriptor } from '../filemanager/filemanager.component';
import { Fetch } from 'client/app/services/fetch.service';
import { VisualizerComponent } from 'client/app/apps/music-library/visualizer/visualizer.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-music-library',
    templateUrl: './music-library.component.html',
    styleUrls: ['./music-library.component.scss'],
    imports: [
        CommonModule,
        WindowTemplateComponent,
        AngularSplitModule,
        NgScrollbarModule,
        NgxContextMenuDirective,
        ScrollingModule,
        MatTabsModule,
        MatSliderModule,
        MatIconModule,
        MatButtonModule,
        VisualizerComponent
    ],
    standalone: true
})
export class MusicLibraryComponent implements OnInit {
    @ViewChild(VisualizerComponent) visualizer: VisualizerComponent;

    @ViewChild("progressSlider") progressSliderRef: ElementRef;
    get progressSlider() { return this.progressSliderRef.nativeElement as HTMLElement }
    @ViewChild("volumeSlider") volumeSliderRef: ElementRef;
    get volumeSlider() { return this.volumeSliderRef.nativeElement as HTMLElement }

    @ViewChild("media") mediaRef: ElementRef;
    get mediaElement() { return this.mediaRef?.nativeElement as HTMLMediaElement; }

    @Input() window: ManagedWindow;

    private _analyzer: AnalyserNode;
    get analyzer() { return this._analyzer; }

    private _source: MediaElementAudioSourceNode;
    get source() { return this._source; }
    context: AudioContext;



    commonCtxItems: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "Play Now",
            shortcutLabel: "Alt+Enter",
            icon: "create_new_folder",
            action: (data) => { }
        },
        {
            label: "Play Shuffled",
            icon: "bookmark",
            action: (evt) => { }
        },
        {
            label: "Queue Next",
            icon: "bookmark",
            action: (evt) => { }
        },
        {
            label: "Queue Last",
            icon: "bookmark",
            action: (evt) => { }
        },
    ]

    groupedCtxItems: ContextMenuItem<FSDescriptor>[] = [
        ...this.commonCtxItems,
        "separator",
        {
            label: "Send To",
            icon: "find_in_page",
        },
        {
            label: "Include in Playlist",
            icon: "bookmark"
        },
        {
            label: "Paste Artwork",
            icon: "bookmark",
        },
    ];

    musicCtxItems: ContextMenuItem<FSDescriptor>[] = [
        ...this.commonCtxItems,
        "separator",
        {
            label: "Edit",
            icon: "create_new_folder",
        }, {
            label: "Rating",
            icon: "create_new_folder",
        },
        {
            label: "Include in Playlist",
            icon: "create_new_folder",
        },
        {
            label: "Send To",
            icon: "create_new_folder",
        },
        {
            label: "Delete",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "Auto-Tag by Album",
            icon: "create_new_folder",
        },
        {
            label: "Auto-Tag by Track",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "Search",
            icon: "create_new_folder",
        }
    ];

    queueCtxItems: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "Show Upcoming Tracks",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "Play Now",
            icon: "create_new_folder",
        },
        {
            label: "Queue Next",
            icon: "create_new_folder",
        },
        {
            label: "Skip Track",
            icon: "create_new_folder",
        },
        {
            label: "Play More...",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "Stop After Track",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "List",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "Edit",
            icon: "create_new_folder",
        },
        {
            label: "Rating",
            icon: "create_new_folder",
        },
        {
            label: "Include in Playlist",
            icon: "create_new_folder",
        },
        {
            label: "Send To",
            icon: "create_new_folder",
        },
        {
            label: "Remove",
            icon: "create_new_folder",
        },
        "separator",
        {
            label: "Search",
            icon: "create_new_folder",
        }
    ];

    readonly groupModes = ["Artist", "Genre", "Album"];
    groupMode = "Artist";
    groupItems = [
        {
            label: "Joybeat - Happy",
            image: "https://www.joystock.org/logos/joystock_icon.png",
            items: [
                "/home/knackstedt/Music/joystock-oceanic-drift.mp3",
                "/home/knackstedt/Music/joystock-summer-pop.mp3",
                "/home/knackstedt/Music/joystock-upbeat-summer-electro-pop.mp3"
            ]
        },
        {
            label: "Joybeat - Epic",
            image: "https://www.joystock.org/logos/joystock_icon.png",
            items: [
                "/home/knackstedt/Music/joystock-big-epic-rock.mp3",
                "/home/knackstedt/Music/joystock-dark-epic-beat.mp3",
                "/home/knackstedt/Music/joystock-epic.mp3"
            ]
        },
    ];

    tracks = [
        {
            name: "Big Epic Rock",
            artist: "Joystock",
            url: "/home/knackstedt/Music/joystock-big-epic-rock.mp3",
            image: "https://www.joystock.org/track-images/epic.jpg"
        }
        // "/home/knackstedt/Music/joystock-dark-epic-beat.mp3",
        // "/home/knackstedt/Music/joystock-epic.mp3"
    ];

    queueIndex = 0;
    queue = [{
        title: "Oceanic Drift",
        url: "/api/filesystem/download?path=/home/knackstedt/Music/joystock-big-epic-rock.mp3"
    },
    {
        title: "Epic",
        url: "/api/filesystem/download?path=/home/knackstedt/Music/joystock-epic.mp3"
    }
        // "/home/knackstedt/Music/joystock-big-epic-rock.mp3",
        // "/home/knackstedt/Music/joystock-epic.mp3"
    ]

    currentTrack = this.queue[this.queueIndex];

    duration = 0;
    currentTime = 0;
    progress = 0;
    volume = 50;

    isShuffling = false;
    isRepeating = false;

    state: "playing" | "paused" | "waiting" = "waiting";

    constructor(private feth: Fetch) {
        // this.feth.get('/api/music/library').then(e => console.log(e));
    }

    numToString(num: number) {
        const hours = Math.floor(num / (60 * 60));
        const minutes = Math.floor(num / 60);
        const seconds = Math.floor(num % 60);

        if (hours)
            return `${hours}:${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    ngOnInit() {
    }

    getUrl(path: string) {
        return "/api/filesystem/download?path=" + encodeURIComponent(path);
    }


    onResize() {
        this.visualizer.resize();
    }

    playPrevious() {
        this.queueIndex -= 1;

        if (this.queueIndex < 0) {
                this.queueIndex = 0;
        }

        this.currentTrack = this.queue[this.queueIndex];
        this.onPlay();
    }

    playNext() {
        console.log("this.playNext");
        this.queueIndex += 1;

        if (this.queueIndex > this.queue.length) {
            if (this.isRepeating)
                this.queueIndex = 0;
        }

        this.currentTrack = this.queue[this.queueIndex];

        this.onPlay();

        // TODO: shuffle
    }

    updateTimeInterval: number;
    onPlay() {
        // Update media element's src
        this.mediaElement.src = this.currentTrack.url;

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

        this.visualizer?.start(this.context, this.analyzer, this.source);

        this.mediaElement.volume = this.volume / 100;
        this.mediaElement.play();

        // this.updateTimeInterval = setInterval(() => {
        //     this.progress += .1;
        // }, 100) as any;
    }

    onTimeUpdate() {
        // Only update duration when
        if (this.duration == 0) {
            this.duration = this.mediaElement.duration || 100;
        }
        this.currentTime = this.mediaElement.currentTime;

        this.progress = this.currentTime/this.duration*100;
    }

    onPause() {
        this.state = "paused";
        this.visualizer?.stop();
    }

    onEnd() {
        this.state = "waiting";
        this.visualizer?.stop();

        this.duration = 0;
        this.currentTime = 0;
        this.progress = 0;

        this.playNext();
    }

    volumeOnWheel(event: WheelEvent) {
        // Clamp min to 0 and max to 100
        this.volume = Math.max(Math.min(this.volume - (event.deltaY / 10), 100), 0);

        this.mediaElement.volume = this.volume / 100;
    }
}
