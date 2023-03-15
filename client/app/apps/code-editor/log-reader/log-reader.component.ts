import { Component, HostListener, Input } from '@angular/core';
import * as LogLanguage from './log-syntax';
import { NgxLazyLoaderComponent } from '@dotglitch/ngx-lazy-loader';
import { editor } from 'monaco-editor';
import { VscodeComponent } from 'client/app/apps/code-editor/vscode/vscode.component';
import { sleep } from 'client/app/util';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { FileDescriptor } from 'client/app/apps/filemanager/filemanager.component';
import { Fetch } from '../../../services/fetch.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { WindowTemplateComponent } from '../../../components/window-template/window-template.component';


// https://github.com/mrodalgaard/language-log

@Component({
    selector: 'app-log-reader',
    templateUrl: './log-reader.component.html',
    styleUrls: ['./log-reader.component.scss'],
    imports: [
        CommonModule,
        NgxLazyLoaderComponent,
        MatTabsModule,
        MatIconModule,
        WindowTemplateComponent
    ],
    standalone: true
})
export class LogReaderComponent {

    @Input('window') windowRef: ManagedWindow;
    @Input() files: FileDescriptor[];

    editor: editor.IStandaloneCodeEditor;
    vscode: VscodeComponent;

    language = LogLanguage;

    tabs: {
        label: string,
        contents: string
    }[] = [];

    currentTab;

    constructor(
        private fetch: Fetch
    ) { }

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

    async loaded(component: VscodeComponent) {
        this.vscode = component;

        while (!component.editor)
            await sleep(10);

        this.editor = component.editor;
    }


    // this.editor?.revealPosition({ lineNumber: Number.MAX_SAFE_INTEGER, column: 0 });
    // this.editor?._domElement.querySelector('.monaco-scrollable-element').scrollBy(0, Number.MAX_SAFE_INTEGER);

    filterLogRows({ severity, searchText, startDate, endDate }) {
        // let data = this.originalLogData;
        // let logs = data.split(/\r\n/);

        // severity && (logs = logs.filter(d => d.indexOf(severity) >= 0));
        // searchText && (logs = logs.filter(d => d.indexOf(searchText) >= 0));

        // this.logData = logs.join('\n');
    }
}
