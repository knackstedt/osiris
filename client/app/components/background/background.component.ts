import { Component, Input, OnInit } from '@angular/core';
import { WallpaperService } from 'client/app/services/wallpaper.service';

@Component({
    selector: 'app-background',
    templateUrl: './background.component.html',
    styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {

    @Input() background: string;

    constructor(
        public wallpaper: WallpaperService,
    ) { }

    ngOnInit() {
        console.log(this.background)
    }

}
