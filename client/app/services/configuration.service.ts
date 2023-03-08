import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {

    windowToolbarHeight = 46;

    taskbarWidth = 64;
    taskbarPosition = "left"; // top left bottom right
    topOffset    = this.taskbarPosition == "top"    ?  this.taskbarWidth : 0;
    rightOffset  = this.taskbarPosition == "right"  ? -this.taskbarWidth : 0;
    bottomOffset = this.taskbarPosition == "bottom" ? -this.taskbarWidth : 0;
    leftOffset   = this.taskbarPosition == "left"   ?  this.taskbarWidth : 0;

    workspaces = [
        { label: "default",  background: "" },
        { label: "avalon",   background: "" },
        { label: "gaia",     background: "" },
        { label: "brunhild", background: "" },
        { label: "kronos",   background: "" },
        { label: "osiris",   background: "" },
        { label: "anubis",   background: "" },
        { label: "thor",     background: "" },
    ]

    workspaceDirection: "vertical" | "horizontal" = "vertical";

    // background = "url(./assets/img/wallpaper/madison-oren-gE1phX0Lbos-unsplash.jpg)";
    background = "url(./assets/img/wallpaper/alberto-bobbera-KNhVlMjkNjs-unsplash.jpg)";

    constructor() { }
}
