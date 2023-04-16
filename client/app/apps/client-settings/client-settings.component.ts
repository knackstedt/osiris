import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WindowTemplateComponent } from '../../components/window-template/window-template.component';
import { GtkTextboxComponent } from '../gtk-factory/@components/textbox/textbox.component';
import { GtkDropdownComponent } from '../gtk-factory/@components/dropdown/dropdown.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-client-settings',
    templateUrl: './client-settings.component.html',
    styleUrls: ['./client-settings.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        WindowTemplateComponent,
        GtkTextboxComponent,
        GtkDropdownComponent
    ],
    standalone: true
})
export class ClientSettingsComponent implements OnInit {
    @Input() window;


    directionOptions = [ "vertical", "horizontal" ];
    taskbarPositions = [ "top", "right", "bottom", "left" ];
    themeList = ["light", 'dark'];

    constructor(
        public config: ConfigurationService
    ) { }

    ngOnInit() {
    }

}
