import { Injectable } from '@angular/core';

export const Apps = [
    {
        appId: "file-manager",
        load: () => import('./apps/filemanager/filemanager.module').then(m => m.FilemanagerModule)
    },
    {
        appId: "file-viewer",
        load: () => import('./apps/file-viewer/file-viewer.module').then(m => m.FileViewerModule),
    }
];

export class ApplicationLoader {

    constructor() { }

    public static async LoadApplication(appId: string) {
        return await Apps.find(a => a.appId == appId)?.load();
    }
}