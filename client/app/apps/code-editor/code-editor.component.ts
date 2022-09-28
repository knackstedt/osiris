import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { FileDescriptor } from '../filemanager/filemanager.component';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CodeEditorComponent implements OnInit {
    public _editor: monaco.editor.IStandaloneCodeEditor;
    @ViewChild('editorContainer') _editorContainer: ElementRef;

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
        const code = this._editor.getValue();

        let blob = new Blob([code], { type: 'text/log' });
        let elm = document.createElement('a');
        let blobURL = URL.createObjectURL(blob);

        // Set the data values.
        elm.href = blobURL;
        elm.download = "download";

        document.body.appendChild(elm);
        elm.click();

        document.body.removeChild(elm);
        elm.remove();

        URL.revokeObjectURL(blobURL);
    }
}
