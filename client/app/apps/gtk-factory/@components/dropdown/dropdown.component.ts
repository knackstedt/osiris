import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'gtk-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    imports: [
        CommonModule
    ],
    standalone: true
})
export class GtkDropdownComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
