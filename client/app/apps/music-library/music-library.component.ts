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
import { UrlSanitizer } from '../../pipes/urlsanitizer.pipe';
import { IAudioMetadata } from 'music-metadata';
import { TabulatorComponent } from 'client/app/components/tabulator/tabulator.component';
import { CellComponent, EmptyCallback } from 'tabulator-tables';

type AudioFile = {
    name: string,
    path: string,
    duration: number,
    images: string
} & IAudioMetadata;

type AudioGroup = {
    image;
    items;
    label;
    query;
}

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
        VisualizerComponent,
        UrlSanitizer,
        TabulatorComponent
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

    commonCtxItems: ContextMenuItem<AudioGroup>[] = [
        {
            label: "Play Now",
            shortcutLabel: "Alt+Enter",
            icon: "create_new_folder",
            action: (data) => {

            }
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

    groupedCtxItems: ContextMenuItem<AudioGroup>[] = [
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

    musicCtxItems: ContextMenuItem<AudioGroup>[] = [
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

    queueCtxItems: ContextMenuItem<AudioFile>[] = [
        {
            label: "Clear Queue",
            icon: "clear_all",
        },
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

    readonly groupModes = ["artist", "Genre", "Album"];
    groupMode = "artist";
    groupItems: AudioGroup[] = [];

    AudioFile

    tracks: AudioFile[] = [];

    queueIndex = 0;
    private _queue = [];
    set queue(data: AudioFile[]) {
        this._queue = data;
        this.saveQueue();
    };
    get queue() { return this._queue };


    currentTrack: AudioFile = this.queue[this.queueIndex];

    duration = 0;
    currentTime = 0;
    progress = 0;
    volume = 50;

    isShuffling = false;
    isRepeating = false;

    state: "playing" | "paused" | "waiting" = "waiting";

    constructor(private fetch: Fetch) {
        this.fetch.get<AudioFile[]>('/api/music/library').then(items => {
            this.groupItems = [];

            items.forEach(item => {
                const groupKey = item.common[this.groupMode] || "default";
                let group = this.groupItems.find(g => g.query == groupKey);
                if (!group) {
                    this.groupItems.push(group = {
                        image: this.getTrackPicture(item),
                        items: [],
                        label: groupKey,
                        query: groupKey
                    });
                }

                group.items.push(item);
            });

            this.groupItems.sort((a, b) => a.label > b.label ? 1 : -1);

            this.groupItems.unshift({
                image: null,
                items,
                label: "All Artists",
                query: ""
            });

            this.tracks = this.groupItems[0].items;
        });

        this.fetch.get<any>(`/api/data/os.music/queue`).then(({queue, index}) => {
            this.queue = queue as any || [];
            this.queueIndex = index;

            // Prevent invalid queue indexes.
            if (this.queueIndex < 0) this.queueIndex = 0;
            if (this.queueIndex > this.queue.length) this.queueIndex = 0;
        })

    }

    debug(...args) {
        console.log(...args)
    }

    selectGrouping(item: AudioGroup) {
        this.tracks = item.items;
    }

    getTrackPicture(item: AudioFile) {
        return `/api/filesystem/download?path=${item.images[0]}`
    }

    numToString(num: number) {
        const hours = Math.floor(num / (60 * 60));
        const minutes = Math.floor(num / 60);
        const seconds = Math.floor(num % 60);

        if (hours)
            return `${hours}:${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    durationFormatter = ((cell: CellComponent, formatterParams: {}, onRendered: EmptyCallback) => {
        return this.numToString(cell.getData()['duration']);
    }).bind(this)

    ngOnInit() {
    }

    getUrl(path: string) {
        return "/api/filesystem/download?path=" + encodeURIComponent(path);
    }

    addTrack(item: AudioFile) {
        this.debug('add track', item);
        this.queue.push(item);
        this.queue = [...this.queue]; // trick change detection

        if (this.state == "waiting")  {
            this.currentTrack = this.queue[this.queueIndex = 0];
            this.onPlay()
        }
    }

    removeFromQueue(track: AudioFile) {
        const pos = this.queue.findIndex(t => t.path + t.name == track.path + track.name);
        if (pos < 0) throw new Error("What happened here?!")

        this.queue.splice(pos, 1);
        this.queue = [...this.queue];

        if (pos == this.queueIndex) {
            this.currentTrack = this.queue[this.queueIndex];
            if (this.state == "playing") {
                this.onPause();
                this.onPlay();
            }
        }

        // Removed before the queue index, so reduce it by 1.
        if (pos < this.queueIndex) {
            this.queueIndex--;
        }
    }

    saveQueue() {
        this.fetch.post(`/api/data/os.music/queue`, {queue: this.queue, index: this.queueIndex})
    }

    onResize() {
        this.visualizer?.resize();
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
        // Default to the first item in the queue
        if (!this.currentTrack && this.queue.length > 0)
            this.currentTrack = this.queue[this.queueIndex = 0];

        // Update media element's src
        const url = `/api/filesystem/download?path=${this.currentTrack.path + this.currentTrack.name}`
        this.mediaElement.src = url;

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
        this.duration = this.mediaElement.duration || 100;
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
        this.volume = event.deltaY == 0 ? this.volume
                    : event.deltaY > 0
                        ? Math.max(this.volume - 10, 0)
                        : Math.min(this.volume + 10, 100);

        this.mediaElement.volume = this.volume / 100;
    }


    onTrackDoubleClick() {

    }
    onTrackSelect() {

    }


}
