import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WindowTemplateComponent } from '../../components/window-template/window-template.component';
import { GtkTextboxComponent } from '../gtk-factory/@components/textbox/textbox.component';

@Component({
    selector: 'app-client-settings',
    templateUrl: './client-settings.component.html',
    styleUrls: ['./client-settings.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        WindowTemplateComponent,
        GtkTextboxComponent
    ],
    standalone: true
})
export class ClientSettingsComponent implements OnInit {
    @Input() window;

    constructor(
        public config: ConfigurationService
    ) { }

    ngOnInit() {
    }

}
