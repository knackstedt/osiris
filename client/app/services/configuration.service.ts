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
    
    constructor() { }
}
