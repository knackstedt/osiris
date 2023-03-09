import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { XpraXDGReducedMenu, XpraXDGReducedMenuEntry } from 'xpra-html5-client';
import { WindowManagerService } from 'client/app/services/window-manager.service';
import { XpraService } from 'client/app/services/xpra.service';


const charMap = {
    "[": "\\[",
    "]": "\\]",
    "^": "\\^",
    "-": "\\-",
    "\\": "\\\\"
};

@Component({
    selector: 'app-start-menu',
    templateUrl: './start-menu.component.html',
    styleUrls: ['./start-menu.component.scss'],
    imports: [
        CommonModule,
        MatTabsModule
    ],
    standalone: true
})
export class StartMenuComponent {

    search = "";

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

    constructor(public windowManager: WindowManagerService, private xpra: XpraService) {
        xpra.xdgMenu.subscribe(menu => {
            // this.apps = Apps.concat()
            this.menu = menu;
        });
    }

    openApp(app: XpraXDGReducedMenuEntry) {
        // this.xpra.wm.createWindow(app);

        this.xpra.xpra.sendStartCommand(app.name, app.exec, false);
    }
}
