import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { XpraXDGReducedMenu, XpraXDGReducedMenuEntry } from 'xpra-html5-client';
import { WindowManagerService } from 'client/app/services/window-manager.service';
import { XpraService } from 'client/app/services/xpra.service';
import { Fetch } from 'client/app/services/fetch.service';
import { RegisteredApplications } from 'client/app/app.registry';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigurationService } from 'client/app/services/configuration.service';


const charMap = {
    "[": "\\[",
    "]": "\\]",
    "^": "\\^",
    "-": "\\-",
    "\\": "\\\\"
};

const boltons = [
    {}
]

@Component({
    selector: 'app-start-menu',
    templateUrl: './start-menu.component.html',
    styleUrls: ['./start-menu.component.scss'],
    imports: [
        CommonModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule
    ],
    standalone: true
})
export class StartMenuComponent {

    search = "";

    sysApps = RegisteredApplications.filter(a => a['matIcon']);


    menus: {
        label: string,
        icon: string,
        apps: any[]
    }[] = [
        {
            label: "system",
            icon: "",
            apps: this.sysApps
        },
        {
            label: "boltons",
            icon: "",
            apps: [
                { id: "iframe", label: "GoCD",          matIcon: "terminal", data: { url: "/app/go/"} },
                // { id: "iframe", label: "K8s Dashboard", matIcon: "terminal", data: { url: "/app/go/"} },
                { id: "iframe", label: "Trillium",      matIcon: "terminal", data: { url: "/app/notes/"} },
                { id: "iframe", label: "VSCode",       matIcon: "terminal", data: { url: "/app/vscode/"} },
            ]
        }
    ];

    apps = [];//Apps;

    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);

    _filterApps() {
        const regex = this.search.split('')
            .map(c => charMap[c] || c)
            .map((c, i) => `([${c}])`)
            .join(".*?");
        const rx = new RegExp(regex, 'i');

        return this.apps.filter(a => rx.test(a.title) || rx.test(a.description));
    }
    // renderAppName(text) {
    //     if (this.search.length == 0) return text;

    //     const regex = this.search.split('')
    //         .map(c => charMap[c] || c)
    //         .map((c, i) => `(?<_${i}>[${c}])`)
    //         .join(".*?");

    //     const rx = new RegExp(regex, 'i');
    //     text.replace(rx, (...args) => {
    //         // const groups = args.pop();
    //         // Object.keys(groups).forEach()
    //         // debugger;
    //     })
    // }

    folders = [
        {
            icon: "",
            title: "",
            apps: [
                "..."
            ]
        }
    ];


    menu: XpraXDGReducedMenu = null;

    constructor(
        public windowManager: WindowManagerService,
        private fetch: Fetch,
        private xpra: XpraService,
        private dialog: MatDialogRef<any>,
        private config: ConfigurationService
    ) {
        xpra.xdgMenu.subscribe(menu => {
            // this.apps = Apps.concat()
            this.menu = menu;
        });
    }

    ngOnInit() {
        // let allItems = await this.fetch.get(`/api/xorg`)

    }

    openApp(app: any) {
        this.windowManager.openWindow({
            appId: app.id,
            workspace: this.config.currentWorkspace,
            title: app.label,
            data: app.data
        })
        this.dialog.close()
    }

    openXpraApp(app: XpraXDGReducedMenuEntry) {
        // this.xpra.wm.createWindow(app);

        this.xpra.xpra.sendStartCommand(app.name, app.exec, false);
    }
}
