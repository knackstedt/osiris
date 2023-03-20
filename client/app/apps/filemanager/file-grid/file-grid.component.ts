import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { KeyboardService } from 'client/app/services/keyboard.service';
import { ManagedWindow, WindowManagerService } from 'client/app/services/window-manager.service';
import { Fetch } from 'client/app/services/fetch.service';
import { DirectoryDescriptor, FileDescriptor, FilemanagerComponent, FSDescriptor } from 'client/app/apps/filemanager/filemanager.component';
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

        if (prev != value) {
            this.pathChange.next(this.path);
            this.loadFolder()
        }
    }
    get path() {return this._path}
    @Output() pathChange = new EventEmitter<string>();

    @Input() showHiddenFiles = false;

    @Input() viewMode: "list" | "grid" = "grid";

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

    // If the current directory is inside of an archive
    isArchive = true;

    readonly columns = [
        { id: "name", label: "Name" },
        { id: "size", label: "Size"},
        { id: "type", label: "Type"},
        { id: "owner", label: "Owner"},
        { id: "group", label: "Group"},
        { id: "permissions", label: "Permissions"},
        { id: "location", label: "Location"},
        { id: "modified", label: "Modified"},
        { id: "modified--time", label: "Modified - Time"},
        { id: "accessed", label: "Accessed"},
        { id: "created", label: "Created"},
        { id: "recency", label: "Recency"},
        { id: "star", label: "Star"},
        { id: "detailed-type", label: "Detailed Type"},
    ]

    cols = [
        { id: "name", label: "Name" },
        { id: "size", label: "Size" },
        { id: "modified", label: "Modified" },
        { id: "star", label: "Star" }
    ]

    folderContextMenu: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "New _F_older",
            shortcutLabel: "Shift+Ctrl+N",
            icon: "create_new_folder",
            action: (data) => {
                console.log("New folder goodness");
                console.log(data);
            }
        },
        {
            label: "Add to _B_ookmarks",
            shortcutLabel: "Ctrl+D",
            icon: "bookmark",
            action: (evt) => {

            }
        },
        "separator",
        {
            isDisabled: (data) => true,
            label: "_P_aste",
            icon: "content_paste",
            action: (evt) => {
            }
        },
        {
            label: "Select _A_ll",
            shortcutLabel: "Ctrl+A",
            icon: "select_all",
            action: (evt) => {

            }
        },
        "separator",
        {
            label: "Open in _T_erminal",
            icon: "terminal",
            action: (evt) => {
                this.windowManager.openWindow({ appId: "terminal", data: { cwd: this.path }})
            }
        },
        {
            label: "Open VS Code here",
            action: (evt) => {

            }
        },
        "separator",
        {
            label: "P_r_operties",
            icon: "find_in_page",
            action: (evt) => {

            }
        }
    ];


    fileContextMenu: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "Download",
            icon: "download",
            action: (data) => {
                const target = `${window.origin}/api/filesystem/download?dir=${data.path}&file=${data.name}`;
                // window.open(target);
                var link = document.createElement("a");
                link.download = data.name;
                link.href = target;
                // document.body.appendChild(link);
                link.click();
                link.remove();
            }
        },
        {
            label: "Open",
            icon: "open_in_new",
            shortcutLabel: "Shift+Ctrl+N",
            action: (data) => {
                console.log("New folder goodness");
                console.log(data);
            }
        },
        {
            label: "Open in new Tab",
            icon: "open_in_new",
            isVisible: (data) => data.kind == "directory",
            action: (data) => {
                console.log("New folder goodness");
                console.log(data);

                this.fileManager.initTab(data.path + data.name)
            }
        },
        {
            label: "Open with Application...",
            isVisible: (data) => data.kind == "file",
            shortcutLabel: "Ctrl+D",
            action: (evt) => {

            },
        },
        "separator",
        {
            label: "Cut",
            icon: "content_cut",
            isDisabled: data => true,
            action: (evt) => {
            },
        },
        {
            label: "Copy",
            icon: "file_copy",
            isDisabled: data => true,
            action: (evt) => {
            },
        },
        {
            label: "Move To...",
            icon: "drive_file_move",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        {
            label: "Copy To...",
            icon: "folder_copy",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        {
            label: "Move to Trash",
            icon: "delete",
            shortcutLabel: "Ctrl+A",
            isVisible: data => !data.path.includes("#/"), // omit files in compressed dirs
            action: (evt) => {
                this.fetch.post(`/api/filesystem/delete`, { files: [evt.path + evt.name] })
            },
        },
        {
            label: "Purge",
            icon: "delete_forever",
            isVisible: data => !data.path.includes("#/"), // omit files in compressed dirs
            action: (evt) => {
                this.fetch.post(`/api/filesystem/delete?wipe=true`, { files: [evt.path + evt.name]})
            },
        },
        {
            label: "Rename",
            icon: "drive_file_rename_outline",
            isVisible: data => !data.path.includes("#/"), // omit files in compressed dirs
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },

        // Extract Here
        // Extract To...
        {
            label: "Extract Here",
            icon: "folder_zip",
            shortcutLabel: "Ctrl+A",
            isDisabled: (data) => data.kind == "file" && data.ext != ".zip",
            action: (evt) => {
                // TODO
            },
        },
        {
            label: "Extract to...",
            icon: "folder_zip",
            shortcutLabel: "Ctrl+A",
            isDisabled: (data) => data.kind == "file" && data.ext != ".zip",
            action: (evt) => {
                // TODO
            },
        },
        {
            label: "Compress...",
            icon: "folder_zip",
            shortcutLabel: "Ctrl+A",
            isDisabled: (data) => data.kind == "file" && data.ext != ".zip",
            action: (evt) => {
                // TODO
            },
        },
        {
            label: "Checksum",
            icon: "manage_search",
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
            isVisible: (data) => {
                return !this.isArchive || data.kind == "file";
            },
        },
        {
            label: "Star",
            icon: "star",
            shortcutLabel: "Ctrl+A",
            action: (evt) => {

            },
        },
        "separator",
        {
            label: "P_r_operties",
            icon: "find_in_page",
            action: (evt) => {

            },
        }
    ];

    performChecksum(path, digest) {
        this.windowManager.openWindow({
            appId: "checksum",
            data: { digest, path },
            workspace: this.windowRef.workspace,
            width: 600,
            height: 250
        });
    }

    constructor(
        private fetch: Fetch,
        private windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        private dialog: DialogService,
        private fileManager: FilemanagerComponent
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
            // this.windowManager.openFiles(files as any);
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
    }

    loadFolder() {
        this.fetch.post(`/api/filesystem/`, { path: this.path, showHidden: this.showHiddenFiles })
            .then((data: any) => {
                const files: FileDescriptor[] = data.files || [];
                const dirs: DirectoryDescriptor[] = data.dirs;

                const descriptors = files.concat(dirs as any) as FSDescriptor[];

                descriptors.forEach(fsd => fsd['_icon'] = resolveIcon(fsd));

                this.directoryContents = descriptors;

                this.resize();
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

    onSelect(item: FSDescriptor, evt) {
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
        if (file.kind == "directory"){
            this.path = file.path + file.name;
        }
        else if (file.ext == "zip") {
            this.path = file.path + file.name;
        }
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

    onDragStart(evt: DragEvent, item: FSDescriptor) {
        const target = `${window.origin}/api/filesystem/download?dir=${item.path}&file=${item.name}`;

        evt.dataTransfer.clearData();
        // evt.dataTransfer.setData('text/uri-list', target);
        // evt.dataTransfer.setData('DownloadURL', `text/uri-list:${target}`);
        evt.dataTransfer.setData('text/plain', item.name);
    }
}
