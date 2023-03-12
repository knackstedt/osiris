import { Component, Input, OnInit } from '@angular/core';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { FileDescriptor } from '../filemanager/filemanager.component';
import { MatTabsModule } from '@angular/material/tabs';
import { VscodeComponent } from 'client/app/apps/code-editor/vscode/vscode.component';
import { NgxLazyLoaderComponent } from '@dotglitch/ngx-lazy-loader';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss'],
    imports: [
        WindowTemplateComponent,
        MatTabsModule,
        VscodeComponent,
        NgxLazyLoaderComponent
    ],
    standalone: true
})
export class CodeEditorComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: FileDescriptor | FileDescriptor[];

    files: (FileDescriptor & {content: string})[] = [];

    constructor(private fetch: Fetch) { }

    async ngOnInit() {
        const data = Array.isArray(this.data) ? this.data : [this.data];

        const payload = data.map(d => d.path + d.name);

        await this.fetch.post(`/api/filesystem/file`, payload).then((res: any) => {
            res.forEach(result => {
                this.files.push({
                    ...result,
                    content: res[0].content,
                    name: result.name.split('/').pop()
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
