import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { KeyboardService } from 'client/app/services/keyboard.service';
import { ManagedWindow, WindowManagerService } from 'client/app/services/window-manager.service';
import { Fetch } from 'client/app/services/fetch.service';
import { DirectoryDescriptor, FileDescriptor, FSDescriptor } from 'client/app/apps/filemanager/filemanager.component';
import { resolveIcon } from 'client/app/apps/filemanager/icon-resolver';
import { DialogService } from 'client/app/services/dialog.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ContextMenuItem, NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';

const itemWidth = (80 + 20);
const margin = 10;

@Component({
    selector: 'app-file-grid',
    templateUrl: './file-grid.component.html',
    styleUrls: ['./file-grid.component.scss'],
    imports: [
        MatTabsModule,
        CommonModule,
        NgScrollbarModule,
        NgxContextMenuDirective,
        ScrollingModule
    ],
    standalone: true
})
export class FileGridComponent implements OnInit {
    @ViewChild("fileViewport") filesRef: ElementRef;

    @Input("window") windowRef: ManagedWindow;

    private _path: string;
    @Input() set path(value: string) {
        if (!value) return;

        let prev = this._path;

        this._path = value;

        if (prev != value)
            this.loadFolder(this.path)
    }
    get path() {return this._path}
    @Output() pathChange = new EventEmitter<string>();

    @Input() showHiddenFiles = false;

    @Output() fileSelect = new EventEmitter<FSDescriptor[]>();
    @Output() fileOpen = new EventEmitter<FSDescriptor[]>();
    @Output() newTab = new EventEmitter<{ path: string; }>();

    directoryContents: FSDescriptor[] = [];
    @Input("selection") selectedItems: FSDescriptor[] = [];
    @Output("selectionChange") selectedItemsChange = new EventEmitter<FSDescriptor[]>();

    selectionText: string;

    sortedFolders: any[][] = [];

    private readonly sorters = {
        "a-z": (a: FileDescriptor, b: FileDescriptor) => a.name > b.name ? 1 : -1,
        "z-a": (a: FileDescriptor, b: FileDescriptor) => b.name > a.name ? 1 : -1,
        "lastmod": (a: FileDescriptor, b: FileDescriptor) => b.stats.mtimeMs - a.stats.mtimeMs,
        "firstmod": (a: FileDescriptor, b: FileDescriptor) => a.stats.mtimeMs - b.stats.mtimeMs,
        "size": (a: FileDescriptor, b: FileDescriptor) => b.stats.size - a.stats.size,
        "type": (a: FileDescriptor, b: FileDescriptor) => a.path.split('.').splice(-1, 1)[0] > b.path.split('.').splice(-1, 1)[0] ? 1 : -1
    };
    sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type" = "a-z";

    itemsPerRow = 6;

    folderContextMenu: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "New _F_older",
            shortcutLabel: "Shift+Ctrl+N",
            action: (data) => {
                console.log("New folder goodness");
                console.log(data);
            }
        },
        {
            label: "Add to _B_ookmarks",
            shortcutLabel: "Ctrl+D",
            action: (evt) => {

            }
        },
        "seperator",
        {
            disabled: true,
            label: "_P_aste",
            action: (evt) => {
            }
        },
        {
            label: "Select _A_ll",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            }
        },
        "seperator",
        {
            label: "Open in _T_erminal",
            action: (evt) => {
                this.windowManager.openWindow({ appId: "terminal", data: { cwd: this.path }})
            }
        },
        {
            label: "Open VS Code here",
            action: (evt) => {

            }
        },
        "seperator",
        {
            label: "P_r_operties",
            action: (evt) => {

            }
        }
    ];


    fileContextMenu: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "Open",
            shortcutLabel: "Shift+Ctrl+N",
            action: (data) => {
                console.log("New folder goodness");
                console.log(data);
            }
        },
        {
            label: "Open with Application...",
            shortcutLabel: "Ctrl+D",
            action: (evt) => {

            },
        },
        "seperator",
        {
            disabled: true,
            label: "Cut",
            action: (evt) => {
            },
        },
        {
            disabled: true,
            label: "Copy",
            action: (evt) => {
            },
        },
        {
            label: "Move To...",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        {
            label: "Copy To...",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        {
            label: "Move to Trash",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        {
            label: "Rename",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },

        // Extract Here
        // Extract To...

        {
            label: "Compress...",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {
            },
        },
        {
            label: "CRC SHA",
            children: [
                {
                    label: "MD5",
                    action: (evt) => this.performChecksum(evt.path + evt.name, "md5"),
                },
                {
                    label: "SHA1",
                    action: (evt) => this.performChecksum(evt.path + evt.name, "sha1"),
                },
                {
                    label: "SHA256",
                    action: (evt) => this.performChecksum(evt.path + evt.name, "sha256"),
                },
                {
                    label: "SHA512",
                    action: (evt) => this.performChecksum(evt.path + evt.name, "sha512"),
                },
            ],
            canActivate(data) {
                return data.kind == "file";
            },
        },
        {
            label: "Send To...",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        {
            label: "Star",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        "seperator",
        {
            label: "P_r_operties",
            action: (evt) => {

            },
        }
    ];

    performChecksum(path, digest) {
        this.windowManager.openWindow({
            appId: "checksum",
            data: { digest, path },
            workspace: this.windowRef.workspace,
            width: 300,
            height: 200
        });
    }

    constructor(
        private fetch: Fetch,
        private windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        private dialog: DialogService
    ) {
        // ctrl + a => select all
        keyboard.onKeyCommand({
            key: "a",
            ctrl: true,
            window: this.windowRef
        }).subscribe(evt => {
            this.selectedItems = this._sortFilter();
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
            const files = this.directoryContents.filter(dc => this.selectedItems.find(i => i.name == dc.name));
            this.windowManager.openFiles(files as any);
        });

        // Delete => delete selected files
        keyboard.onKeyCommand({
            key: "delete",
            window: this.windowRef
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selectedItems.find(i => i.name == dc.name));
        });
    }

    async ngOnInit() {
        // while (!this.path)
        // await sleep(10)
        await this.loadFolder(this.path);
    }

    loadFolder(path: string) {
        this.fetch.post(`/api/filesystem/`, { path, showHidden: this.showHiddenFiles })
            .then((data: any) => {
                const files: FileDescriptor[] = data.files || [];
                const dirs: DirectoryDescriptor[] = data.dirs;

                const descriptors = files.concat(dirs as any) as FSDescriptor[];

                descriptors.forEach(fsd => fsd['_icon'] = resolveIcon(fsd));

                this.directoryContents = descriptors;

                this.resize();

                // TODO Refactor.
                // this.location =
                this.pathChange.next(this.path = path);
            })
            .catch(err => console.error(err));
    }

    flowRows() {
        let filtered = this._sortFilter();

        this.sortedFolders = [];
        const num = Math.ceil(filtered.length / this.itemsPerRow);
        const iterations = Math.min(num, 100);

        for (let row = 0; row < iterations; row++) {
            if (!this.sortedFolders[row])
                this.sortedFolders[row] = [];

            for (let i = row * this.itemsPerRow; i < (row + 1) * this.itemsPerRow && i < filtered.length; i++) {
                this.sortedFolders[row].push(filtered[i]);
            }
        }
    }

    onSelect(item: FileDescriptor, evt) {
        evt.stopPropagation();

        if (this.keyboard.shiftPressed) {
            let start = this.directoryContents.findIndex(i => i.name == this.selectedItems.slice(-1, 1)[0].name);
            let end = this.directoryContents.indexOf(item);

            if (start == -1)
                start = end;

            let items = start > end
                ? this.directoryContents.slice(end, start + 1)
                : this.directoryContents.slice(start, end + 1);

            this.selectedItems = items;
        }
        else if (this.keyboard.ctrlPressed) {
            if (!this.selectedItems.includes(item))
                this.selectedItems.push(item);
            else // Case that we selected the same item twice
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
        }
        else
            this.selectedItems = [item];

        this.selectedItemsChange.next(this.selectedItems);
        this.selectionText = this.getSelectionText();
    }

    onItemClick(file: FSDescriptor) {
        if (file.kind == "directory")
            this.loadFolder(file.path + file.name);
        else {
            this.fileOpen.next([file]);
        }
    }

    _sortFilter(): FileDescriptor[] {
        return this.directoryContents?.filter(d => d.kind == 'directory')
            .concat(this.directoryContents?.filter(d => d.kind == 'file')
                .sort(this.sorters[this.sortOrder])
            ) as FileDescriptor[];
    }

    private getSelectionText() {
        const dirCount = this.selectedItems.filter(s => s.kind == "directory").length;
        const fileCount = this.selectedItems.filter(s => s.kind == "file").length;

        if (dirCount + fileCount == 0) return "";

        const totalSize =
            this.directoryContents
                .filter(d => d.kind == "file")
                .filter(d => this.selectedItems?.find(i => i.name == d.name))
                .map(d => d['stats'].size).reduce((a, b) => a + b, 0);

        if (dirCount + fileCount == 1)
            return `"${this.selectedItems[0].name}" selected (${this.bytesToString(totalSize)})`;

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

    public resize() {
        const bounds = (this.filesRef.nativeElement as HTMLElement).getBoundingClientRect();
        this.itemsPerRow = Math.floor(bounds.width / itemWidth);
        if (this.itemsPerRow > 100)
            this.itemsPerRow = 1;

        this.flowRows();
    }
}
