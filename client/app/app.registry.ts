import { ComponentRegistration } from '@dotglitch/ngx-lazy-loader';

type AppIcon = string | {

}

export const RegisteredApplications: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'native',          group: "app", load: () => import('client/app/apps/_native/native.component') },
    { id: 'start-menu',      group: "app", load: () => import('client/app/apps/start-menu/start-menu.component') },

    { id: 'terminal',        group: "app", load: () => import('client/app/apps/terminal/terminal.component'),                 matIcon: "terminal", label: "Terminal", order: 0 },
    { id: 'file-manager',    group: "app", load: () => import('client/app/apps/filemanager/filemanager.component'),           matIcon: "folder", label: "File Explorer", order: 0 },
    { id: 'client-settings', group: "app", load: () => import('client/app/apps/client-settings/client-settings.component'),   matIcon: "settings", label: "Settings", order: 0 },
    { id: 'media-player',    group: "app", load: () => import('client/app/apps/video-player/video-player.component'),         matIcon: "smart_display", label: "Videos", order: 0 },
    { id: 'music-library',   group: "app", load: () => import('client/app/apps/music-library/music-library.component'),       matIcon: "library_music", label: "Videos", order: 0 },
    { id: 'text-editor',     group: "app", load: () => import('client/app/apps/code-editor/code-editor.component'),           matIcon: "code", label: "Text Editor", order: 0 },
    { id: 'log-viewer',      group: "app", load: () => import('client/app/apps/code-editor/log-reader/log-reader.component'), matIcon: "article", label: "Log Viewer", order: 0 },
    { id: 'welcome',         group: "app", load: () => import('client/app/apps/introduction/introduction.component'),         matIcon: "help", label: "Welcome", order: 0 },
    { id: 'checksum',        group: "app", load: () => import('client/app/apps/filemanager/checksum/checksum.component') },
    { id: 'system-monitor',  group: "app", load: () => import('client/app/apps/system-monitor/system-monitor.component'),     matIcon: "monitor_heart", label: "System Monitor", order: 0 },
    { id: 'iframe',          group: "app", load: () => import('client/app/apps/@framework/iframe/iframe.component') },



    // Factory components (large imports)
    { id: 'material-factory', group: "app", load: () => import('client/app/apps/material-factory/material-factory.component') },
    { id: 'gtk-factory',      group: "app", load: () => import('client/app/apps/gtk-factory/gtk-factory.component') }
];

export const DialogComponents: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'checksum', group: "dialog", load: () => import('client/app/apps/filemanager/checksum/checksum.component') }
];

export const LazyComponents: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'vscode', load: () => import('client/app/apps/code-editor/vscode/vscode.component') },
    { id: 'filesystem-radial', load: () => import('client/app/apps/system-monitor/filesystem-radial/filesystem-radial.component') },
];
