import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
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
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { FileGridComponent } from './file-grid/file-grid.component';
import { getMimeType } from 'client/app/apps/filemanager/mimetype';
import { GtkBreadcrumbComponent } from 'client/app/apps/gtk-factory/@components/breadcrumb/breadcrumb.component';
import { ConfigurationService } from '../../services/configuration.service';
import { GtkIconButtonComponent } from 'client/app/apps/gtk-factory/@components/icon-button/icon-button.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

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
        size: number;
        // Size for zipped file
        compressedSize?: number,
        atimeMs: number;
        mtimeMs: number;
        ctimeMs: number;
        birthtimeMs: number;
    },
    path: string
    name: string,
    ext: string,
    // Comment for entries in a zip file.
    comment?: string
};

export type FSDescriptor = DirectoryDescriptor | FileDescriptor;

// TODO: enable virtual scrolling


export type FileViewTab = {
    id: string,
    label: string,
    breadcrumb: {
        id: string,
        label: string
    }[],
    path: string,
    selection: FSDescriptor[],
    viewMode: "grid" | "list",
    historyIndex: number,
    history: string[]
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
        MatIconModule,
        GtkBreadcrumbComponent,
        GtkIconButtonComponent,
        ToolbarComponent
    ],
    standalone: true
})
export class FilemanagerComponent implements OnInit {
    @ViewChildren(FileGridComponent) fileGrids: FileGridComponent[];
    @ViewChild('tabGroup') tabGroup: MatTabGroup;

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
    tabIndex = 0;
    tabs: FileViewTab[] = [];

    constructor(
        private fetch: Fetch,
        private windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        private dialog: MatDialog,
        private config: ConfigurationService
        ) {
        keyboard.onKeyCommand({
            ctrl: true,
            key: "t",
            window: this.windowRef,
            interrupt: true
        }).subscribe(() => {
            this.tabs.push({
                ...this.currentTab
            });
            this.currentTab = this.tabs[this.tabs.length-1];
        })
    }

    ngOnInit(): void {
        this.initTab(this.path);
        this.currentTab = this.tabs[0];
    }

    initTab(path: string) {
        this.tabs.push(this.currentTab = {
            id: crypto.randomUUID(),
            label: this.getTabLabel(path),
            breadcrumb: this.calcBreadcrumb(path),
            path,
            selection: [],
            viewMode: "grid",
            historyIndex: 0,
            history: []
        });
        this.tabIndex = this.tabs.length;
    }

    closeTab(tab: FileViewTab) {
        this.tabs.splice(this.tabs.findIndex(t => t.id == tab.id), 1);
    }

    calcBreadcrumb(path: string) {
        const parts = path.replace("#/", '/').split('/');
        return parts.map((p, i) => {
            const path = parts.slice(0, i + 1).join('/');

            return {
                id: path,
                label: p || ""
            };
        });
    }

    onBreadcrumbClick(crumb) {
        if (crumb.id) {
            this.currentTab.path = crumb.id;
            this.currentTab.breadcrumb = this.calcBreadcrumb(crumb.id);

            // this.currentTab.history.push(crumb.id);
            // this.currentTab.history.splice(this.config.filemanager.maxHistoryLength);
        }
    }

    tabPathChange(tab: FileViewTab) {
        tab.label = this.getTabLabel(tab.path);
        tab.breadcrumb = this.calcBreadcrumb(tab.path);

        tab.history.push(tab.path);
        tab.history.splice(this.config.filemanager.maxHistoryLength);
    }

    getTabLabel(path: string) {
        return path.split('/').filter(p => p).pop();
    }

    async onFileOpen(files: FSDescriptor[]) {

        let mimetype = files
            .filter(f => f.kind == "file")
            .map(f => getMimeType(f.name))
            .reduce((a, b) => {
                if (a != b)
                    return "mixed";
                return a;
            }, getMimeType(files[0].name));

        // TODO: handle only mass file operations
        // mixed content can't be handled generically
        if (mimetype == "mixed") {
            return;
        }

        switch(mimetype) {

            case "compressed": {

                break;
            }
            case "presentation": {
                break;
            }
            case "richtext": {
                break;
            }
            case "spreadsheet": {
                break;
            }
            case "3d-model": {
                break;
            }
            case "music": {
                // this.openWindow();
                break;
            }
            case "video": {
                console.log("open window")
                this.openWindow("media-player", { files })
                break;
            }
            default: {
                switch (files[0]['ext']) {
                    case "log": {
                        this.openWindow("log-viewer", { files });
                        break;
                    }
                    default: {
                        const payload = {
                            files: files.map(f => f.path + f.name)
                        };
                        let stats: any[] = await this.fetch.post(`/api/filesystem/file?only=stat`, payload);

                        const textFiles = stats.filter(r => r.type == "text").map(r => r.name);

                        this.openWindow("text-editor", {
                            files: files.filter(f => textFiles.includes(f.path + f.name))
                        });
                    }
                }
            }
        }
    }

    private openWindow(id, args) {
        this.windowManager.openWindow({
            appId: id,
            data: args
        })
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
