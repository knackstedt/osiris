import { Injectable } from '@angular/core';
import { Fetch } from 'client/app/services/fetch.service';

type Location = {
    label: string,
    path: string,
    icon: string
}

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    currentWorkspace = 0;

    windowToolbarHeight = 46;

    taskbarWidth = 64;
    // taskbarPosition = "top"; // top left bottom right
    // taskbarPosition = "right"; // top left bottom right
    // taskbarPosition = "bottom"; // top left bottom right
    private _taskbarPosition: "top" | "right" | "bottom" | "left" = "left"; // top left bottom right
    set taskbarPosition(pos: "top" | "right" | "bottom" | "left") { this._taskbarPosition = pos; this.apply()}
    get taskbarPosition() { return this._taskbarPosition }

    get topOffset(){    return this.taskbarPosition == "top"    ?  this.taskbarWidth : 0}
    get rightOffset(){  return this.taskbarPosition == "right"  ? -this.taskbarWidth : 0}
    get bottomOffset(){ return this.taskbarPosition == "bottom" ? -this.taskbarWidth : 0}
    get leftOffset(){   return this.taskbarPosition == "left"   ?  this.taskbarWidth : 0}

    workspaces = [
        { label: "default",  background: "#0000" },
        { label: "avalon",   background: "#0002" },
        { label: "gaia",     background: "#0004" },
        { label: "brunhild", background: "#0006" },
        { label: "kronos",   background: "#0008" },
        { label: "osiris",   background: "#000a" },
        { label: "anubis",   background: "#000c" },
        { label: "thor",     background: "url(./assets/img/wallpaper/alberto-bobbera-KNhVlMjkNjs-unsplash.jpg)" },
    ]

    // ! We expect a tall image for vertical, and a wide image for horizontal
    // TODO: work on resolving this
    workspaceDirection: "vertical" | "horizontal" = "vertical";

    // workspaceDirection: "vertical" | "horizontal" = "horizontal";
    background = "./assets/img/wallpaper/madison-oren-gE1phX0Lbos-unsplash.jpg";
    // background = "./assets/img/wallpaper/alberto-bobbera-KNhVlMjkNjs-unsplash.jpg";
    // background = "./assets/img/wallpaper/Canyon2.png";

    homedir: string;
    username: string;
    shell: string;
    host: string;

    currentTheme = "dark";

    ready = false;

    filemanager: {
        maxHistoryLength: number,
        maxUndoLength: number, // max number of actions that can be undone (excluding _destroy_)
        showThumbnails: boolean, // WIP
        thumbnailMaxFileSize: number, // WIP
        customCtxMenuItems: [], // WIP // support for custom context menu actions?

        defaultLocations: Location[],
        deviceLocations: Location[],
        remoteLocations: Location[],
    } = {
        maxHistoryLength: 10,
        maxUndoLength: 50, // max number of actions that can be undone (excluding _destroy_)
        showThumbnails: false, // WIP
        thumbnailMaxFileSize: 0, // WIP
        customCtxMenuItems: [], // WIP // support for custom context menu actions?

        defaultLocations: [],
        deviceLocations: [],
        remoteLocations: [],
    }

    constructor(private fetch: Fetch) {
        this.apply();

        this.fetch.get(`/api/rest`).then((config: any) => {
            this.homedir = config.user.homedir;
            this.username = config.user.username;
            this.shell = config.user.shell;
            this.host = config.host;
            // this.favoriteLocations = config.favoriteLocations;
            this.filemanager.defaultLocations = config.filemanager.defaultLocations;
            this.filemanager.deviceLocations = config.filemanager.deviceLocations;
            this.filemanager.remoteLocations = config.filemanager.remoteLocations;
            this.ready = true;
        })
    }

    // This method invokes to apply any configurations that are stateful across
    // the application.
    apply() {
        // Clear out any old classes
        [...document.body.classList as any as string[]]
            .filter(c =>
                c.startsWith("taskbar-") ||
                c.startsWith("dir-") ||
                c.startsWith("t-")
            )
            .forEach(c => document.body.classList.remove(c));


        document.body.classList.add(`taskbar-${this.taskbarPosition}`);
        document.body.classList.add(`dir-${this.workspaceDirection}`);
        document.body.classList.add(`t-${this.currentTheme}`);
    }
}
