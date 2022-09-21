import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow, WindowManagerService } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { resolveIcon } from './icon-resolver';
import { KeyboardService } from '../../services/keyboard.service';
import { MatDialog } from '@angular/material/dialog';
import { ContextMenuItem } from '../../components/context-menu/context-menu.component';

// TODO:
/**
 * Multiple music / video / image files selected turns into a playlist
 * Dragging music / video / image queues the file(s)
 * Can save and edit a list of files as playlist
 * Can "loop" "randomize"
 */

export type DirectoryDescriptor = {
    kind: "directory",
    path: string,
    name: string
    contents: {
        dirs: DirectoryDescriptor[],
        files: FileDescriptor[]
    }
}

export type FileDescriptor = {
    kind: "file",
    stats: {
        dev: number;
        ino: number;
        mode: number;
        nlink: number;
        uid: number;
        gid: number;
        rdev: number;
        size: number;
        blksize: number;
        blocks: number;
        atimeMs: number;
        mtimeMs: number;
        ctimeMs: number;
        birthtimeMs: number;
        atime: Date;
        mtime: Date;
        ctime: Date;
        birthtime: Date;
    },
    path: string
    name: string,
    ext: string
};

export type FSDescriptor = DirectoryDescriptor | FileDescriptor;

@Component({
    selector: 'app-filemanager',
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit {
    
    resolveIcon = resolveIcon;
    
    @Input() windowData: ManagedWindow;
    
    directoryContents: FSDescriptor[] = [];
    selected: string[] = [];

    showHiddenFiles = false;
    showSidebar = true;

    viewMode = "list";

    sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type" = "a-z";

    breadcrumb = [
        { path: "/home/knackstedt/", label: "Home" },
        { path: "/home/knackstedt/source/", label: "source" },
        { path: "/home/knackstedt/source/osiris/", label: "osiris" },
        { path: "/home/knackstedt/source/osiris/client/", label: "client" },
        { path: "/home/knackstedt/source/osiris/client/assets/", label: "assets" },
        { path: "/home/knackstedt/source/osiris/client/assets/icons/", label: "icons" },
    ];

    folderContextMenu: ContextMenuItem[] = [
        {
            label: "New _F_older",
            shortcutLabel: "Shift+Ctrl+N",
            action: <FSDescriptor>(evt: MouseEvent, data: FSDescriptor) => {
                console.log("New folder goodness")
                console.log(evt, data);
            }
        },
        {
            label: "Add to _B_ookmarks",
            shortcutLabel: "Ctrl+D",
            action: (evt: MouseEvent) => {

            },
        },
        "seperator",
        {
            disabled: true,
            label: "_P_aste",
            action: (evt: MouseEvent) => {
            },
        },
        {
            label: "Select _A_ll",
            shortcutLabel: "Ctrl+A",
            action: (evt: MouseEvent) => {

            },
        },
        "seperator",
        {
            label: "Open in _T_erminal",
            action: (evt: MouseEvent) => {

            },
        },
        {
            label: "Open VS Code here",
            action: (evt: MouseEvent) => {

            },
        },
        "seperator",
        {
            label: "P_r_operties",
            action: (evt: MouseEvent) => {

            },
        }
    ]


    private sorters = {
        "a-z":      (a: FileDescriptor, b: FileDescriptor) => a.path > b.path ? 1 : -1,
        "z-a":      (a: FileDescriptor, b: FileDescriptor) => b.path > a.path ? 1 : -1,
        "lastmod":  (a: FileDescriptor, b: FileDescriptor) => a.stats.mtimeMs - b.stats.mtimeMs,
        "firstmod": (a: FileDescriptor, b: FileDescriptor) => b.stats.mtimeMs - a.stats.mtimeMs,
        "size":     (a: FileDescriptor, b: FileDescriptor) => a.stats.size - b.stats.size,
        "type":     (a: FileDescriptor, b: FileDescriptor) => a.path.split('.').splice(-1,1)[0] > b.path.split('.').splice(-1,1)[0] ? 1 : -1
    }

    _sortFilter(): FileDescriptor[] {
        return this.directoryContents?.filter(d => d.kind == 'directory')
            .concat(this.directoryContents?.filter(d => d.kind == 'file')
                .sort(this.sorters[this.sortOrder])
            ) as FileDescriptor[];
            // .filter(f => );
    }

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

    loadFolder(file: string) {
        this.fetch.post(`/api/filesystem/`, { path: file, showHidden: this.windowData.data.showHidden })
            .then((data: any) => {
                const files: FileDescriptor[] = data.files;
                const dirs: DirectoryDescriptor[] = data.dirs;

                this.directoryContents = files.concat(dirs as any) as FSDescriptor[];
            })
            .catch(err => console.error(err));
    }

    // This will only ever be one file
    openFile(file: FileDescriptor, evt: MouseEvent) {
        this.windowManager.openWindow("file-viewer", file);
    }

    selectionAction(action: "open" | "move" | "delete") {

    }

    onClick(item: FileDescriptor, evt: MouseEvent) {
        evt.stopPropagation();

        if (this.keyboard.shiftPressed) {
            let start = this.directoryContents.findIndex(i => i.name == this.selected.slice(-1, 1)[0]);
            let end = this.directoryContents.indexOf(item);

            if (start == -1)
                start = end;

            let items = start > end 
                ? this.directoryContents.slice(end, start+1) 
                : this.directoryContents.slice(start, end+1);

            this.selected = items.map(i => i.name);
        }
        else if (this.keyboard.ctrlPressed) {
            if (!this.selected.includes(item.name))
                this.selected.push(item.name);
            else // Case that we selected the same item twice
                this.selected.splice(this.selected.indexOf(item.name), 1);
        }
        else 
            this.selected = [item.name];

        console.log(this.selected);
    }

    getSelectionText() {
        const dirCount = this.selected.filter(s => s.endsWith('/')).length;
        const fileCount = this.selected.length = dirCount;

        const totalSize = (this.directoryContents
            .filter(d => d.kind == "file") as FileDescriptor[])
            .filter(d => this.selected?.includes(d.name))
            .map(d => d.stats.size).reduce((a,b) => a+b, 0);

        return `${dirCount} folders selected, ${fileCount} other items selected (${this.bytesToString(totalSize)})`
    }

    bytesToString(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }
}
