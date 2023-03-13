import { Component, Input, OnInit } from '@angular/core';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { FileDescriptor } from '../filemanager/filemanager.component';
import { MatTabsModule } from '@angular/material/tabs';
import { VscodeComponent } from 'client/app/apps/code-editor/vscode/vscode.component';
import { NgxLazyLoaderComponent } from '@dotglitch/ngx-lazy-loader';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss'],
    imports: [
        CommonModule,
        WindowTemplateComponent,
        VscodeComponent,
        NgxLazyLoaderComponent,
        MatTabsModule,
        MatIconModule
    ],
    standalone: true
})
export class CodeEditorComponent implements OnInit {

    @Input('window') windowRef: ManagedWindow;
    @Input() files: FileDescriptor[];

    tabs: {
        label: string,
        contents: string;
    }[] = [];

    currentTab;

    constructor(private fetch: Fetch) { }

    async ngOnInit() {

        const payload = {
            files: this.files.map(f => f.path + f.name)
        };

        await this.fetch.post(`/api/filesystem/file`, payload).then((res: any) => {
            res.forEach(result => {
                this.tabs.push({
                    label: result.name.split('/').pop(),
                    contents: res[0].content
                });
            });
        });
    }

    download() {

        // let blob = new Blob([code], { type: 'text/log' });
        // let elm = document.createElement('a');
        // let blobURL = URL.createObjectURL(blob);

        // // Set the data values.
        // elm.href = blobURL;
        // elm.download = "download";

        // document.body.appendChild(elm);
        // elm.click();

        // document.body.removeChild(elm);
        // elm.remove();

        // URL.revokeObjectURL(blobURL);
    }
}
