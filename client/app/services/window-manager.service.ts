import { ComponentType, Portal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { AppId, WindowOptions } from 'client/types/window';
import { Subject } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class WindowManagerService extends Subject<WindowOptions> {

    constructor() { super() }

    public async OpenWindow(options: Partial<WindowOptions> | AppId, data?) {
        let opts: any = {};
        if (typeof options == "string")
            opts.appId = options;
        else 
            opts = options;

        const cfg = {
            ...{
                appId: "unknown",
                icon: "assets/icons/dialog-question-symbolic.svg",
                description: "No description provided",
                title: "Application",
                width: 300,
                height: 200,
                x: 50,
                y: 50,
            },
            ...opts,
        };
        cfg.data = data || opts.data;

        this.next(cfg as WindowOptions);
    }
}
