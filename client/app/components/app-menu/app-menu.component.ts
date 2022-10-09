import { Component, OnInit } from '@angular/core';
import { Apps } from 'client/app/applications';
import { WindowManagerService } from '../../services/window-manager.service';
import { MatDialogRef } from '@angular/material/dialog';

const charMap = {
    "[": "\\[",
    "]": "\\]",
    "^": "\\^",
    "-": "\\-",
    "\\": "\\\\"
}

@Component({
    selector: 'app-app-menu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss']
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

    constructor(public windowManager: WindowManagerService, public dialogRef: MatDialogRef<any>) { }
}
