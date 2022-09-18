import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow, WindowManagerService } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { resolveIcon } from './icon-resolver';
import { KeyboardService } from '../../services/keyboard.service';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';
import { MatDialog } from '@angular/material/dialog';

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
    
    selected: string[] = [];

    resolveIcon = resolveIcon;

    @Input() windowData: ManagedWindow;

    directoryContents: string[];    

    constructor(
        private fetch: Fetch, 
        private windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        private dialog: MatDialog
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

    // This will only ever be one file
    openFile(file: string, evt: MouseEvent) {
        this.windowManager.OpenWindow("file-viewer", { dir: this.windowData.data?.basePath + "/", file })
    }

    selectionAction(action: "open" | "move" | "delete") {

    }

    onClick(item: string, evt: MouseEvent) {
        evt.stopPropagation();

        if (this.keyboard.shiftPressed) {
            let start = this.directoryContents.indexOf(this.selected.slice(-1, 1)[0]);
            let end = this.directoryContents.indexOf(item);

            let items = start > end 
                ? this.directoryContents.slice(end, start+1) 
                : this.directoryContents.slice(start, end+1);

            this.selected = items;
        }
        else if (this.keyboard.ctrlPressed) {
            if (!this.selected.includes(item))
                this.selected.push(item);
            else // Case that we selected the same item twice
                this.selected.splice(this.selected.indexOf(item), 1);
        }
        else 
            this.selected = [item];
    }
}
