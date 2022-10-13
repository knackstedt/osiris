import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Apps } from 'client/app/applications';
import { WindowManagerService } from '../../services/window-manager.service';
import { MatDialogRef } from '@angular/material/dialog';
import { XpraService } from 'client/app/services/xpra.service';
import { XpraXDGReducedMenu, XpraXDGReducedMenuEntry } from 'xpra-html5-client';

const charMap = {
    "[": "\\[",
    "]": "\\]",
    "^": "\\^",
    "-": "\\-",
    "\\": "\\\\"
}

@Component({
    selector: 'app-menu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppMenuComponent {
    search = "";

    apps = Apps;

    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent)

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
    ]


    menu: XpraXDGReducedMenu = null;

    constructor(public windowManager: WindowManagerService, public dialogRef: MatDialogRef<any>, private xpra: XpraService) {
        xpra.xdgMenu.subscribe(menu => {
            // this.apps = Apps.concat()
            this.menu = menu;
        })
    }

    openApp(app: XpraXDGReducedMenuEntry) {
        // this.xpra.wm.createWindow(app);

        this.xpra.xpra.sendStartCommand(app.name, app.exec, false);
    }
}
