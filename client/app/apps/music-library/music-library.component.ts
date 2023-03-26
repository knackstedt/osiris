import { Component, OnInit, Input } from '@angular/core';
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
import { PlayerComponent } from './player/player.component';

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
        PlayerComponent
    ],
    standalone: true
})
export class MusicLibraryComponent implements OnInit {

    @Input() window: ManagedWindow;


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
            image: "",
            items: [
                "/home/knackstedt/Music/joystock-oceanic-drift.mp3",
                "/home/knackstedt/Music/joystock-summer-pop.mp3",
                "/home/knackstedt/Music/joystock-upbeat-summer-electro-pop.mp3"
            ]
        },
        {
            label: "Joybeat - Epic",
            image: "",
            items: [
                "/home/knackstedt/Music/joystock-big-epic-rock.mp3",
                "/home/knackstedt/Music/joystock-dark-epic-beat.mp3",
                "/home/knackstedt/Music/joystock-epic.mp3"
            ]
        },
    ];

    tracks = [
        "/home/knackstedt/Music/joystock-big-epic-rock.mp3",
        "/home/knackstedt/Music/joystock-dark-epic-beat.mp3",
        "/home/knackstedt/Music/joystock-epic.mp3"
    ];

    queue = [{
        image: "",

    }
        // "/home/knackstedt/Music/joystock-big-epic-rock.mp3",
        // "/home/knackstedt/Music/joystock-epic.mp3"
    ]

    constructor(private feth: Fetch) {
        // this.feth.get('/api/music/library').then(e => console.log(e));
    }

    ngOnInit() {
    }

    getUrl(path: string) {
        return "/api/filesystem/download?path=" + encodeURIComponent(path);
    }


}
