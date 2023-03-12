import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
    selector: 'app-client-settings',
    templateUrl: './client-settings.component.html',
    styleUrls: ['./client-settings.component.scss'],
    imports: [
        CommonModule,
        FormsModule
    ],
    standalone: true
})
export class ClientSettingsComponent implements OnInit {

    constructor(
        public config: ConfigurationService
    ) { }

    ngOnInit() {
    }

}