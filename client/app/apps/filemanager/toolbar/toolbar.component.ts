import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GtkIconButtonComponent } from '../../gtk-factory/@components/icon-button/icon-button.component';
import { GtkBreadcrumbComponent } from '../../gtk-factory/@components/breadcrumb/breadcrumb.component';
import { NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [
        CommonModule,
        GtkIconButtonComponent,
        GtkBreadcrumbComponent,
        NgxContextMenuDirective
    ],
    standalone: true
})
export class ToolbarComponent {
    @Input() sortOrder: "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type";
    @Output() sortOrderChange = new EventEmitter<"a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type">();

    @Output() onBreadcrumbClick = new EventEmitter();

    @Input() currentTab;

    @Input() showHiddenFiles: boolean;
    @Output() showHiddenFilesChange = new EventEmitter<boolean>();
    @Input() showSidebar: boolean;
    @Output() showSidebarChange = new EventEmitter<boolean>();



}
