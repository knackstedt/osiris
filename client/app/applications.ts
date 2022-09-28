export const Apps = [
    {
        appId: "file-manager",
        load: () => import('./apps/filemanager/filemanager.module').then(m => m.FilemanagerModule)
    },
    {
        appId: "video-player",
        load: () => import('./apps/video-player/video-player.module').then(m => m.VideoPlayerModule),
    },
    {
        appId: "image-viewer",
        load: () => import('./apps/image-viewer/image-viewer.module').then(m => m.ImageViewerModule),
    },    
    {
        appId: "code-editor",
        load: () => import('./apps/code-editor/code-editor.module').then(m => m.CodeEditorModule),
    }
];

export const KnownApps = Apps.map(a => a.appId);

export class ApplicationLoader {

    constructor() { }

    public static async LoadApplication(appId: string) {
        return await Apps.find(a => a.appId == appId)?.load();
    }
}