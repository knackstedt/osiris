import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxAppMenuDirective, NgxContextMenuDirective, ContextMenuItem } from '@dotglitch/ngx-ctx-menu';

import { GtkIconButtonComponent } from '../../gtk-factory/@components/icon-button/icon-button.component';
import { GtkBreadcrumbComponent } from '../../gtk-factory/@components/breadcrumb/breadcrumb.component';
import { FSDescriptor } from 'client/app/apps/filemanager/filemanager.component';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [
        CommonModule,
        GtkIconButtonComponent,
        GtkBreadcrumbComponent,
        NgxContextMenuDirective,
        NgxAppMenuDirective
    ],
    standalone: true
})
export class ToolbarComponent {
    @ViewChild('zoomTemplate') zoomTemplate: TemplateRef<any>;
    @ViewChild('actionTemplate') actionTemplate: TemplateRef<any>;


    @Input() sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type";
    @Output() sortOrderChange = new EventEmitter<"a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type">();

    @Output() onBreadcrumbClick = new EventEmitter();

    @Input() currentTab;

    @Input() showHiddenFiles: boolean;
    @Output() showHiddenFilesChange = new EventEmitter<boolean>();
    @Input() showSidebar: boolean;
    @Output() showSidebarChange = new EventEmitter<boolean>();

    fileOptions: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "New Folder",
            action: (folder) => {
                //
            }
        },
        {
            label: "Add to Bookmarks (WIP)",
            action: (folder) => {
                //
            }
        },
        "separator",
        {
            label: "Paste",
            action: (folder) => {
                //
            }
        },
        {
            label: "Select All",
            action: (folder) => {
                //
            }
        },
        "separator",
        {
            label: "Open Terminal here",
            action: (folder) => {
                //
            }
        },
        {
            label: "Open VS Code here",
            action: (folder) => {
                //
            }
        },
        "separator",
        {
            label: "Properties",
            action: (folder) => {
                //
            }
        },

    ]

    sortOptions: ContextMenuItem<FSDescriptor>[] = [
        {
            label: "Sort",
            separator: true
        },
        {
            label: "Open VS Code here",
            action: (folder) => {
                //
            }
        },
    ];
}
