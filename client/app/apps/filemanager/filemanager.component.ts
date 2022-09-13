import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { WindowOptions } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { resolveIcon } from './icon-resolver';
// import * as MimeTypeBase from "./mimetypes-base.json";
// import * as MimeTypes from "./mimetypes.json";
import { MatDialog } from '@angular/material/dialog';
import { FileViewerComponent } from '../../components/file-viewer/file-viewer.component';


// const CustomMimeTypes = {};
// Object.keys(MimeTypes).forEach(key => {
//     MimeTypes[key].forEach(ext => CustomMimeTypes[ext] = key);
// })


@Component({
    selector: 'app-filemanager',
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss']
})
export class FilemanagerComponent implements OnInit {
    
    selected: string = "";

    resolveIcon = resolveIcon;

    @Input() windowData: WindowOptions;

    directoryContents: string[];    

    constructor(private fetch: Fetch, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        console.log(this.windowData);

        if (this.windowData.data)
            this.loadFolder(this.windowData.data?.basePath);
    }

    loadFolder(path: string) {
        this.fetch.post(`/api/filesystem/`, { path, showHidden: this.windowData.data.showHidden })
            .then((data: any) => {
                const files: string[] = data.files;
                const dirs: string[] = data.dirs;

                this.directoryContents = files.concat(dirs);
            })
            .catch(err => console.error(err));
    }


    openFile(file: string, evt: MouseEvent) {
        this.dialog.open(FileViewerComponent, {
            data: {
                file,
            }
        });
    }

    dbg(evt) {
        debugger;
    }
}
