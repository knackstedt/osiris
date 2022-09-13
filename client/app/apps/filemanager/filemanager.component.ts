import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { WindowOptions } from '../../services/window-manager.service';
import { Fetch } from '../../services/fetch.service';

import * as MimeTypeBase from "./mimetypes-base.json";
import * as MimeTypes from "./mimetypes.json";

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
    
    @Input() windowData: WindowOptions;

    directoryContents: string[];    

    constructor(private fetch: Fetch) {
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

    getIcon(file: string) {
        // i.thumbnail || mimeTypes[i.mimeType] || 'default'

        if (file.endsWith('/'))
            return "assets/icons/places/folder.svg";

        const ext = file.split('.').splice(-1, 1)[0];

        const mimeType = 
            MimeTypeBase[ext]
            // MimeTypes[ext] ||
            // .includes(MimeTypeBase[ext])
                // ? MimeTypeBase[ext] 
                || "application-x-generic";

        return `assets/icons/mimetypes/${mimeType}.svg`;
    }
}
