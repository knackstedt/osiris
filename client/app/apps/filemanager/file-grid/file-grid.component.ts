import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { KeyboardService } from 'client/app/services/keyboard.service';
import { ManagedWindow, WindowManagerService } from 'client/app/services/window-manager.service';
import { Fetch } from 'client/app/services/fetch.service';
import { DirectoryDescriptor, FileDescriptor, FSDescriptor } from 'client/app/apps/filemanager/filemanager.component';
import { ContextMenuDirective } from '../../../directives/context-menu.directive';
import { resolveIcon } from 'client/app/apps/filemanager/icon-resolver';
import { ContextMenuItem } from 'client/app/components/context-menu/context-menu.component';

@Component({
    selector: 'app-file-grid',
    templateUrl: './file-grid.component.html',
    styleUrls: ['./file-grid.component.scss'],
    imports: [
        MatTabsModule,
        CommonModule,
        NgScrollbarModule,
        ContextMenuDirective
    ],
    standalone: true
})
export class FileGridComponent implements OnInit {
    @Input("window") windowRef: ManagedWindow;

    @Input() path: string;
    @Output() pathChange = new EventEmitter<string>();

    @Input() showHiddenFiles = false;

    @Output() fileSelect = new EventEmitter<FSDescriptor | FSDescriptor[]>();
    @Output() fileOpen = new EventEmitter<FSDescriptor | FSDescriptor[]>();
    @Output() newTab = new EventEmitter<{ path: string }>();

    directoryContents: FSDescriptor[] = [];
    @Input("selection") selectedItems: string[] = [];
    @Output("selectionChange") selectedItemsChange = new EventEmitter<string[]>();

    selectionText: string;


    private readonly sorters = {
        "a-z": (a: FileDescriptor, b: FileDescriptor) => a.name > b.name ? 1 : -1,
        "z-a": (a: FileDescriptor, b: FileDescriptor) => b.name > a.name ? 1 : -1,
        "lastmod": (a: FileDescriptor, b: FileDescriptor) => b.stats.mtimeMs - a.stats.mtimeMs,
        "firstmod": (a: FileDescriptor, b: FileDescriptor) => a.stats.mtimeMs - b.stats.mtimeMs,
        "size": (a: FileDescriptor, b: FileDescriptor) => b.stats.size - a.stats.size,
        "type": (a: FileDescriptor, b: FileDescriptor) => a.path.split('.').splice(-1, 1)[0] > b.path.split('.').splice(-1, 1)[0] ? 1 : -1
    }
    sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type" = "a-z";

    folderContextMenu: ContextMenuItem[] = [
        {
            label: "New _F_older",
            shortcutLabel: "Shift+Ctrl+N",
            action: <FSDescriptor>(evt: MouseEvent, data: FSDescriptor) => {
                console.log("New folder goodness");
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

    constructor(
        private fetch: Fetch,
        private windowManager: WindowManagerService,
        private keyboard: KeyboardService,
    ) {
        // ctrl + a => select all
        keyboard.onKeyCommand({
            key: "a",
            ctrl: true,
            window: this.windowRef
        }).subscribe(evt => {
            this.selectedItems = this._sortFilter().map(f => f.name);
            this.selectionText = this.getSelectionText();
            this.selectedItemsChange.next(this.selectedItems);
        });

        // ctrl + c => copy file names to clipboard
        keyboard.onKeyCommand({
            key: "c",
            ctrl: true,
            window: this.windowRef
        }).subscribe(evt => {

        });

        // ctrl + h => toggle hidden files
        keyboard.onKeyCommand({
            key: "h",
            ctrl: true,
            window: this.windowRef,
            interrupt: true
        }).subscribe(evt => {
            this.showHiddenFiles = !this.showHiddenFiles;
        });

        // F2 => Rename selected files
        keyboard.onKeyCommand({
            key: "f2",
            window: this.windowRef
        }).subscribe(evt => {
            // Rename selected file(s)
        });

        // Enter => Open selected files
        keyboard.onKeyCommand({
            key: "Enter",
            window: this.windowRef
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selectedItems.includes(dc.name));
            this.windowManager.openFiles(files as any);
        });

        // Delete => delete selected files
        keyboard.onKeyCommand({
            key: "delete",
            window: this.windowRef
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selectedItems.includes(dc.name));
        })
    }

    async ngOnInit() {
        // while (!this.path)
            // await sleep(10)
        this.loadFolder(this.path);
    }

    loadFolder(path: string) {
        this.fetch.post(`/api/filesystem/`, { path, showHidden: this.showHiddenFiles })
            .then((data: any) => {
                const files: FileDescriptor[] = data.files || [];
                const dirs: DirectoryDescriptor[] = data.dirs;

                const descriptors = files.concat(dirs as any) as FSDescriptor[];

                descriptors.forEach(fsd => fsd['_icon'] = resolveIcon(fsd));

                this.directoryContents = descriptors;

                // TODO Refactor.
                // this.location =
                this.pathChange.next(this.path = path);
            })
            .catch(err => console.error(err));
    }

    onSelect(item: FileDescriptor, evt: MouseEvent) {
        evt.stopPropagation();

        if (this.keyboard.shiftPressed) {
            let start = this.directoryContents.findIndex(i => i.name == this.selectedItems.slice(-1, 1)[0]);
            let end = this.directoryContents.indexOf(item);

            if (start == -1)
                start = end;

            let items = start > end
                ? this.directoryContents.slice(end, start + 1)
                : this.directoryContents.slice(start, end + 1);

            this.selectedItems = items.map(i => i.name);
        }
        else if (this.keyboard.ctrlPressed) {
            if (!this.selectedItems.includes(item.name))
                this.selectedItems.push(item.name);
            else // Case that we selected the same item twice
                this.selectedItems.splice(this.selectedItems.indexOf(item.name), 1);
        }
        else
            this.selectedItems = [item.name];

        this.selectedItemsChange.next(this.selectedItems);
        this.selectionText = this.getSelectionText();
    }

    onItemClick(file: FSDescriptor) {
        if (file.kind == "directory")
            this.loadFolder(file.path + file.name);
        else {
            this.fileOpen.next(file);
        }
    }

    _sortFilter(): FileDescriptor[] {
        return this.directoryContents?.filter(d => d.kind == 'directory')
            .concat(this.directoryContents?.filter(d => d.kind == 'file')
                .sort(this.sorters[this.sortOrder])
            ) as FileDescriptor[];
        // .filter(f => );
    }

    private getSelectionText() {
        const dirCount = this.selectedItems.filter(s => s.endsWith('/')).length;
        const fileCount = this.selectedItems.filter(s => !s.endsWith('/')).length;

        if (dirCount + fileCount == 0) return "";

        const totalSize = (this.directoryContents
            .filter(d => d.kind == "file") as FileDescriptor[])
            .filter(d => this.selectedItems?.includes(d.name))
            .map(d => d.stats.size).reduce((a, b) => a + b, 0);

        if (dirCount + fileCount == 1)
            return `"${this.selectedItems[0]}" selected (${this.bytesToString(totalSize)})`;

        if (dirCount > 0 && fileCount == 0)
            return `"${dirCount}" folders selected`;
        if (fileCount > 0 && dirCount == 0)
            return `${fileCount} items selected (${this.bytesToString(totalSize)})`;

        return `${dirCount} folder${dirCount == 1 ? "" : "s"} selected, ${fileCount} other item${fileCount == 1 ? "" : "s"} selected (${this.bytesToString(totalSize)})`;
    }

    private bytesToString(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }
}
