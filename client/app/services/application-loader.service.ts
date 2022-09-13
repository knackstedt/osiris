import { Injectable } from '@angular/core';

export const Apps = [
  {
    name: "File Manager",
    appId: "file-manager",
    load: () => import('../apps/filemanager/filemanager.module').then(m => m.FilemanagerModule),
    width: 800,
    height: 600
  }
];

@Injectable({
    providedIn: 'root'
})
export class ApplicationLoaderService {

    constructor() { }

    public async LoadApplication(appId: string) {
      return await Apps.find(a => a.appId == appId)?.load();
    }

}