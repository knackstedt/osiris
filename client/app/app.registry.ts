import { ComponentRegistration } from '@dotglitch/ngx-lazy-loader';

type AppIcon = string | {

}

export const RegisteredApplications: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'native',          group: "app", load: () => import('client/app/apps/_native/native.component') },
    { id: 'start-menu',      group: "app", load: () => import('client/app/apps/start-menu/start-menu.component') },

    { id: 'terminal',        group: "app", load: () => import('client/app/apps/terminal/terminal.component'),                 iconType: "mat-icon", iconSrc: "terminal", label: "Terminal", order: 0 },
    { id: 'file-manager',    group: "app", load: () => import('client/app/apps/filemanager/filemanager.component'),           iconType: "mat-icon", iconSrc: "folder", label: "File Explorer", order: 0 },
    { id: 'client-settings', group: "app", load: () => import('client/app/apps/client-settings/client-settings.component'),   iconType: "mat-icon", iconSrc: "settings", label: "Settings", order: 0 },
    { id: 'media-player',    group: "app", load: () => import('client/app/apps/video-player/video-player.component'),         iconType: "mat-icon", iconSrc: "smart_display", label: "Videos", order: 0 },
    { id: 'text-editor',     group: "app", load: () => import('client/app/apps/code-editor/code-editor.component'),           iconType: "mat-icon", iconSrc: "code", label: "Text Editor", order: 0 },
    { id: 'log-viewer',      group: "app", load: () => import('client/app/apps/code-editor/log-reader/log-reader.component'), iconType: "mat-icon", iconSrc: "article", label: "Log Viewer", order: 0 },
    { id: 'checksum',        group: "app", load: () => import('client/app/apps/filemanager/checksum/checksum.component') }
];

export const DialogComponents: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'checksum', group: "dialog", load: () => import('client/app/apps/filemanager/checksum/checksum.component') }
];

export const LazyComponents: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'vscode', load: () => import('client/app/apps/code-editor/vscode/vscode.component') }

];
