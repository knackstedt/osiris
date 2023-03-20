import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'gtk-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    imports: [
        CommonModule,
        MatSelectModule
    ],
    standalone: true
})
export class GtkDropdownComponent implements OnInit {

    @Input() value: any;
    @Output() valueChange = new EventEmitter();

    @Input() options: string[] | number[] | { id: string|number, label: string}[] = [];
    _options: any[] = []; // template typechecking doesn't like a union array.

    constructor() { }

    ngOnInit() {
        this._options = this.options;
    }
}
