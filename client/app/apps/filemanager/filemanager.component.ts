import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow, WindowManagerService } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { resolveIcon } from './icon-resolver';

// TODO:
/**
 * Multiple music / video / image files selected turns into a playlist
 * Dragging music / video / image queues the file(s)
 * Can save and edit a list of files as playlist
 * Can "loop" "randomize"
 */

@Component({
    selector: 'app-filemanager',
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit {
    
    selected: string = "";

    resolveIcon = resolveIcon;

    @Input() windowData: ManagedWindow;

    directoryContents: string[];    

    constructor(
        private fetch: Fetch, 
        private windowManager: WindowManagerService
        ) {
    }

    ngOnInit(): void {
        console.log(this.windowData);

        if (this.windowData.data)
            this.loadFolder(this.windowData.data?.basePath);
    }

    loadFolder(path: string) {
        this.fetch.post(`/api/filesystem/`, { path, showHidden: this.windowData.data.showHidden })
            .then((data: any) => {
                const files: string[] = data.files;
                const dirs: string[] = data.dirs;
                console.log("load data")

                this.directoryContents = files.concat(dirs);
            })
            .catch(err => console.error(err));
    }


    openFile(file: string, evt: MouseEvent) {
        this.windowManager.OpenWindow("file-viewer", { dir: this.windowData.data?.basePath + "/", file })
        // this.dialog.open(FileViewerComponent, {
        //     data: {
        //         dir: this.windowData.data?.basePath + "/",
        //         file,
        //     }
        // });
    }

    dbg(evt) {
        debugger;
    }
}
