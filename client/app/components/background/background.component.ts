import { Component, OnInit } from '@angular/core';
import { WallpaperService } from 'client/app/services/wallpaper.service';

@Component({
    selector: 'app-background',
    templateUrl: './background.component.html',
    styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {

    constructor(
        public wallpaper: WallpaperService,
    ) { }

    ngOnInit() {
    }

}
