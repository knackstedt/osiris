import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { debounceTime } from 'rxjs';
import { editor } from 'monaco-editor';

declare const monaco: {
    editor: typeof editor
};

// Monaco has a UMD loader that requires this
// @ts-ignore
window.require = { paths: { 'vs': '/lib/monaco/vs' } };

const monacoFiles = [
    '/lib/monaco/vs/loader.js',
    '/lib/monaco/vs/editor/editor.main.nls.js',
    '/lib/monaco/vs/editor/editor.main.js',
]
let isInstalled = false
function installMonaco() {
    if (isInstalled) return;

    for (let i = 0; i < monacoFiles.length; i++) {
        const script = document.createElement("script");
        script.setAttribute("defer", "");
        script.setAttribute("src", monacoFiles[i]);
        document.body.append(script)
    }
    isInstalled = true;
}

const settings = {
    automaticLayout: true,
    theme: 'vs-dark',
    scrollBeyondLastLine: false,
    language: "auto",
    colorDecorators: true,
    folding: true,
    scrollBeyondLastColumn: false,
    tabSize: 2,
    minimap: {
        enabled: true
    }
};


@Component({
    selector: 'app-vscode',
    templateUrl: './vscode.component.html',
    styleUrls: ['./vscode.component.scss'],
    standalone: true
})
export class VscodeComponent implements AfterViewInit, OnDestroy {
    @ViewChild("editor", { read: ElementRef, static: false }) editorElement: ElementRef;

    isDirty = false;
    public editor: editor.IStandaloneCodeEditor;

    @Input() languages: { init: Function }[] = [];
    @Input() options: editor.IStandaloneEditorConstructionOptions = {};

    @Input() code: string;
    @Output() codeChange = new EventEmitter<string>();

    private onCodeType = new EventEmitter<string>();
    private typeDebounce = this.onCodeType.pipe(debounceTime(300));

    defaults: editor.IStandaloneEditorConstructionOptions = {
        automaticLayout: true,
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
        language: "auto",
        colorDecorators: true,
        folding: true,
        scrollBeyondLastColumn: 0,
        tabSize: 2,
        minimap: {
            enabled: true
        }
    };

    private _sub;
    constructor() {
        installMonaco();
        this._sub = this.typeDebounce.subscribe(t => this.codeChange.next(t));
    }


    ngAfterViewInit() {
        this.defaults.language = "json";
        this.initEditor();
    }
    ngOnDestroy(): void {
        this.editor?.dispose();
        this._sub?.unsubscribe();
    }

    async initEditor() {
        // Ensure Monaco is loaded.
        await new Promise((res, rej) => {
            let count = 0;
            let i = window.setInterval(() => {
                count++;

                if (typeof monaco != "undefined") {
                    window.clearInterval(i);

                    res(true);
                }
                if (count >= 100) {
                    window.clearInterval(i);
                    res(false);
                }
            }, 100);
        });

        this.languages.forEach(l => l.init(monaco));

        const opts = { ...this.defaults, ...this.options };

        console.log(opts);

        let editor = this.editor = monaco.editor.create(this.editorElement.nativeElement, opts);

        if (this.code) {
            editor.setValue(this.code);
        }
        else {
            this.code = JSON.stringify(monaco.editor, null, 4);
            editor.setValue(this.code);
        }

        editor.onDidChangeModelContent(() => {
            this.isDirty = this.editor.getValue() != this.code;
        });
    }

    download() {
        // const code = this.editor.getValue();

        // let blob = new Blob([code], { type: 'text/log' });
        // let elm = document.createElement('a');
        // let blobURL = URL.createObjectURL(blob);

        // // Set the data values.
        // elm.href = blobURL;
        // elm.download = this.filename;

        // document.body.appendChild(elm);
        // elm.click();

        // document.body.removeChild(elm);
        // elm.remove();

        // URL.revokeObjectURL(blobURL);
    }

    @HostListener('window:resize', ['$event'])
    resize = (): void => {
        this.editor?.layout();
    };
}
