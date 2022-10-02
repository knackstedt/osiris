import { Component, OnInit } from '@angular/core';
import { Apps } from 'client/app/applications';
import { WindowManagerService } from '../../services/window-manager.service';
import { MatDialogRef } from '@angular/material/dialog';



@Component({
    selector: 'app-app-menu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent {

    apps = Apps;

    constructor(public windowManager: WindowManagerService, public dialogRef: MatDialogRef<any>) { }
}
