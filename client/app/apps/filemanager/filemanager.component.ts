import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { ManagedWindow, WindowManagerService } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { resolveIcon } from './icon-resolver';
import { KeyboardService } from '../../services/keyboard.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CommonAppModule } from '../../common.module';
import { ButtonPopoutComponent } from 'client/app/components/button-popout/button-popout.component';
import { WindowToolbarComponent } from 'client/app/components/window-template/window-toolbar/window-toolbar.component';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { AngularSplitModule } from 'angular-split';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { FileGridComponent } from './file-grid/file-grid.component';
import { OnResize } from 'client/types/window';
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

// TODO: enable virtual scrolling


type FileViewTab = {
    id: string,
    label: string,
    breadcrumb: {
        path: string,
        label: string
    }[],
    path: string,
    selection: FSDescriptor[];
}

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
        AngularSplitModule,
        FileGridComponent,
        MatTabsModule,
        MatIconModule
    ],
    standalone: true
})
export class FilemanagerComponent implements OnInit {
    @ViewChildren(FileGridComponent) fileGrids: FileGridComponent[];

    resolveIcon = resolveIcon;

    @Input("window") windowRef: ManagedWindow;
    @Input() path: string;

    showHiddenFiles = false;
    showSidebar = true;

    viewMode = "list";

    sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type" = "a-z";

    isHomeAncestor = false;

    location = {
        icon: "assets/icons/"
    }

    currentTab: FileViewTab = {} as any;
    tabs: FileViewTab[] = [];

    constructor(
        private fetch: Fetch,
        private windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        private dialog: MatDialog
        ) {
    }

    ngOnInit(): void {
        this.initTab(this.path);
        this.currentTab = this.tabs[0];
    }

    initTab(path) {
        this.tabs.push({
            id: crypto.randomUUID(),
            label: this.getTabLabel(path),
            breadcrumb: this.calcBreadcrumb(path),
            path,
            selection: []
        })
        this.tabs.push({
            id: crypto.randomUUID(),
            label: this.getTabLabel(path),
            breadcrumb: this.calcBreadcrumb(path),
            path,
            selection: []
        })
    }

    closeTab(tab: FileViewTab) {
        this.tabs.splice(this.tabs.findIndex(t => t.id == tab.id), 1);
    }

    calcBreadcrumb(path: string) {
        const parts = path.split('/');
        return parts.map((p, i) => {
            const path = parts.slice(0, i + 1).join('/');

            return {
                path,
                label: p || ""
            };
        });
    }

    tabPathChange(tab: FileViewTab) {
        tab.label = this.getTabLabel(tab.path);
    }

    getTabLabel(path: string) {
        return path.split('/').filter(p => p).pop();
    }

    onFileOpen(file: FSDescriptor | FSDescriptor[]) {
        // this.fetch.post<any>(`/api/filesystem/file?only=stat`, [file.path + file.name ]).then(res => {
        //     if (res[0].type == "text")
        //         this.windowManager.openWindow("code-editor", file);
        //     else
        //         this.downloadFile(file);
        //     // this.fileData = res;
        // });
    }

    onPathChange() {

    }

    downloadFile(file: FSDescriptor) {
    }

    async onResize() {
        // Trigger re-calculation of the view
        this.fileGrids.forEach(g => g.resize());
    }

    async onResizeEnd() {
        setTimeout(() => {
            this.onResize()
        }, 250);
    }
}
