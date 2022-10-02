export type AppId = 
    "native" | 
    "file-manager" | 
    "image-viewer" | 
    "video-player" | 
    "code-editor" | 
    "terminal" | 
    "system-settings";

type AppDefinition = {
    appId: AppId,
    load: () => Promise<any>,
    icon?: string,
    title?: string,
    description?: string,
    "min-width"?: number,
    "max-width"?: number,
    "min-height"?: number,
    "max-height"?: number,
}

export const Apps: AppDefinition[] = [
    {
        appId: "native",
        load: () => import('./apps/_native/native.module').then(m => m.NativeModule)
    },
    {
        appId: "terminal",
        load: () => import('./apps/terminal/terminal.module').then(m => m.TerminalModule),
        icon: "assets/icons/apps/utilities-terminal-symbolic.svg",
        title: "Terminal"
    },
    {
        appId: "file-manager",
        load: () => import('./apps/filemanager/filemanager.module').then(m => m.FilemanagerModule),
        "min-width": 683,
        "min-height": 327,
        icon: "assets/icons/apps/nautilus-symbolic.svg",
        title: "File Manager"
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
    },
    {
        appId: "system-settings",
        load: () => import('./apps/system-settings/system-settings.module').then(m => m.SystemSettingsModule),
    }
];

export const KnownApps = Apps.map(a => a.appId);

export class ApplicationLoader {

    constructor() { }

    public static async LoadApplication(appId: string) {
        return await Apps.find(a => a.appId == appId)?.load();
    }
}