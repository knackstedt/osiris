/// <reference types="monaco-editor/monaco" />
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { first, Subject } from 'rxjs';
import { MonacoEditorService } from '../../services/monaco-editor.service';

@Component({
    selector: 'app-monaco-editor',
    templateUrl: './monaco-editor.component.html',
    styleUrls: ['./monaco-editor.component.scss']
})
export class MonacoEditorComponent implements OnDestroy, AfterViewInit {
    public _editor: monaco.editor.IStandaloneCodeEditor;
    @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

    // @Input()
     options: monaco.editor.IStandaloneEditorConstructionOptions = {
        automaticLayout: true,
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
        // language: langMap.find(l => ),
        colorDecorators: true,
        folding: true,
        minimap: {
            enabled: true
        }
    };
    
    private _code: string;
    @Input() set code(code) {
        this._code = code;
        if (this._editor) {
            let pos = this._editor.getPosition();
            this._editor.setValue(code);
            this._editor.setPosition(pos);
            const model = monaco.editor.createModel(this.code, undefined, monaco.Uri.file(this.path));

            this._editor.getModel()?.dispose();
            this._editor.setModel(model);
        }
    }
    @Input() path: string;
    // @Output() 

    isDirty = false;

    constructor(private monacoEditorService: MonacoEditorService) {
        monacoEditorService.load();
    }
    ngAfterViewInit(): void {
        this.initMonaco();
    }
    ngOnDestroy(): void {
        this._editor.dispose();
    }

    private initMonaco(): void {
        if (!this.monacoEditorService.loaded) {
            this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
                this.initMonaco();
            });
            return;
        }

        const editor = this._editor = window.monaco.editor.create(this._editorContainer.nativeElement, this.options);

        if (this._code) {
            editor.setValue(this._code);

            const model = monaco.editor.createModel(this._code, undefined, monaco.Uri.file(this.path));
            this._editor.getModel()?.dispose();

            this._editor.setModel(model);
        }

        editor.onDidChangeModelContent(() => {
            this.isDirty = this._editor.getValue() != this._code;
        })
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

    reset() {
        this.isDirty = false;
        this._editor.setValue(this.code);
    }
}