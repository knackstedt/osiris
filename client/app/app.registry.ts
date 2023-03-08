import { ComponentRegistration } from '@dotglitch/ngx-lazy-loader';

export const RegisteredApplications: ComponentRegistration[] = [
    // @ae-component-inject
    { id: 'native', group: "app", load: () => import('client/app/apps/_native/native.component'), icon: "home", order: 0 },
    { id: 'terminal', group: "app", load: () => import('client/app/apps/terminal/terminal.component'), icon: "home", order: 0 },
    { id: 'file-manager', group: "app", load: () => import('client/app/apps/filemanager/filemanager.component'), icon: "home", order: 0 },
    { id: 'start-menu', group: "app", load: () => import('client/app/apps/start-menu/start-menu.component'), icon: "home", order: 0 },
];

