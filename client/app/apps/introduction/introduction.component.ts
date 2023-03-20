import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { WindowTemplateComponent } from '../../components/window-template/window-template.component';

@Component({
    selector: 'app-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.scss'],
    imports: [
        CommonModule,
        MatButtonModule,
        WindowTemplateComponent
    ],
    standalone: true
})
export class IntroductionComponent {
    @Input() window;

}
