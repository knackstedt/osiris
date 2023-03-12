import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow, WindowManagerService } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { resolveIcon } from './icon-resolver';
import { KeyboardService } from '../../services/keyboard.service';
import { MatDialog } from '@angular/material/dialog';
import { ContextMenuItem } from '../../components/context-menu/context-menu.component';
import { CommonModule } from '@angular/common';
import { CommonAppModule } from '../../common.module';
import { ButtonPopoutComponent } from 'client/app/components/button-popout/button-popout.component';
import { WindowToolbarComponent } from 'client/app/components/window-template/window-toolbar/window-toolbar.component';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AngularSplitModule } from 'angular-split';
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
    styleUrls: ['./filemanager.component.scss'],
    imports: [
        CommonModule,
        CommonAppModule,
        ButtonPopoutComponent,
        WindowToolbarComponent,
        WindowTemplateComponent,
        NgScrollbarModule,
        AngularSplitModule
    ],
    standalone: true
})
export class FilemanagerComponent implements OnInit {

    resolveIcon = resolveIcon;

    @Input("window") windowRef: ManagedWindow;

    directoryContents: FSDescriptor[] = [];
    selected: string[] = [];

    showHiddenFiles = false;
    showSidebar = true;

    viewMode = "list";

    sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type" = "a-z";

    location = {
        label: "Home",
        icon: "assets/icons/"
    }
    breadcrumb = [];

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
        "a-z":      (a: FileDescriptor, b: FileDescriptor) => a.name > b.name ? 1 : -1,
        "z-a":      (a: FileDescriptor, b: FileDescriptor) => b.name > a.name ? 1 : -1,
        "lastmod":  (a: FileDescriptor, b: FileDescriptor) => b.stats.mtimeMs - a.stats.mtimeMs,
        "firstmod": (a: FileDescriptor, b: FileDescriptor) => a.stats.mtimeMs - b.stats.mtimeMs,
        "size":     (a: FileDescriptor, b: FileDescriptor) => b.stats.size - a.stats.size,
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

        // ctrl + a => select all
        keyboard.onKeyCommand({
            key: "a",
            ctrl: true,
            window: this.windowRef
        }).subscribe(evt => {
            this.selected = this._sortFilter().map(f => f.name);
        })

        // ctrl + c => copy file names to clipboard
        keyboard.onKeyCommand({
            key: "c",
            ctrl: true,
            window: this.windowRef
        }).subscribe(evt => {

        })

        // ctrl + h => toggle hidden files
        keyboard.onKeyCommand({
            key: "h",
            ctrl: true,
            window: this.windowRef,
            interrupt: true
        }).subscribe(evt => {
            this.showHiddenFiles = !this.showHiddenFiles;
        })

        // F2 => Rename selected files
        keyboard.onKeyCommand({
            key: "f2",
            window: this.windowRef
        }).subscribe(evt => {
            // Rename selected file(s)
        })

        // Enter => Open selected files
        keyboard.onKeyCommand({
            key: "Enter",
            window: this.windowRef
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selected.includes(dc.name));
            this.windowManager.openFiles(files as any);
        })

        // Delete => delete selected files
        keyboard.onKeyCommand({
            key: "delete",
            window: this.windowRef
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selected.includes(dc.name));
        })
    }

    ngOnInit(): void {

        if (this.windowRef.data)
            this.loadFolder(this.windowRef.data?.basePath);
    }

    loadFolder(absPath?: string) {
        this.windowRef.data.basePath = absPath || this.windowRef.data.basePath;
        this.fetch.post(`/api/filesystem/`, { path: this.windowRef.data.basePath || "~", showHidden: this.showHiddenFiles })
            .then((data: any) => {
                const files: FileDescriptor[] = data.files || [];
                const dirs: DirectoryDescriptor[] = data.dirs;

                const descriptors = files.concat(dirs as any) as FSDescriptor[];

                descriptors.forEach(fsd => fsd['_icon'] = resolveIcon(fsd));

                this.directoryContents = descriptors;

                const parts = this.windowRef.data.basePath.split('/');

                // TODO Refactor.
                // this.location =
                this.breadcrumb = parts.map((p, i) => {
                    const path = parts.slice(0, i + 1).join('/');

                    return {
                        path,
                        label: p || ""
                    };
                });
            })
            .catch(err => console.error(err));
    }

    // This will only ever be one file
    openFile(file: FSDescriptor, evt: MouseEvent) {
        if (file.kind == "directory")
            this.loadFolder(file.path + file.name);
        else {
            // this.fetch.post<any>(`/api/filesystem/file?only=stat`, [file.path + file.name ]).then(res => {
            //     if (res[0].type == "text")
            //         this.windowManager.openWindow("code-editor", file);
            //     else
            //         this.downloadFile(file);
            //     // this.fileData = res;
            // });
        }
    }

    downloadFile(file: FSDescriptor) {
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
        const fileCount = this.selected.filter(s => !s.endsWith('/')).length;

        if (dirCount + fileCount == 0) return "";

        const totalSize = (this.directoryContents
            .filter(d => d.kind == "file") as FileDescriptor[])
            .filter(d => this.selected?.includes(d.name))
            .map(d => d.stats.size).reduce((a,b) => a+b, 0);

        if (dirCount + fileCount == 1)
            return `"${this.selected[0]}" selected (${this.bytesToString(totalSize)})`;

        if (dirCount > 0 && fileCount == 0)
            return `"${dirCount}" folders selected`;
        if (fileCount > 0 && dirCount == 0)
            return `${fileCount} items selected (${this.bytesToString(totalSize)})`;

        return `${dirCount} folder${dirCount == 1 ? "" : "s"} selected, ${fileCount} other item${fileCount == 1 ? "" : "s"} selected (${this.bytesToString(totalSize)})`;
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
