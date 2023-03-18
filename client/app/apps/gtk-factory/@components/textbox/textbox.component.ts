import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'gtk-textbox',
    templateUrl: './textbox.component.html',
    styleUrls: ['./textbox.component.scss'],
    imports: [
        CommonModule
    ],
    standalone: true
})
export class GtkTextboxComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
