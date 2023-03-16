import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Fetch } from 'client/app/services/fetch.service';
import { BehaviorSubject } from 'rxjs';
import { WindowTemplateComponent } from '../../../components/window-template/window-template.component';
import { ManagedWindow } from '../../../services/window-manager.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-checksum',
    templateUrl: './checksum.component.html',
    styleUrls: ['./checksum.component.scss'],
    imports: [
        CommonModule,
        WindowTemplateComponent,
        MatInputModule,
        MatIconModule
    ],
    standalone: true
})
export class ChecksumComponent implements OnInit {

    @Input() path: string;
    @Input() digest: "md5" | "sha1" | "sha256";
    @Input() window: ManagedWindow;

    public ngxShowDistractor$ = new BehaviorSubject(true);

    constructor(
        private fetch: Fetch
    ) { }


    sum: string;
    length: number;
    name: string;
    async ngOnInit() {
        let result: any = await this.fetch.post(`/api/filesystem/checksum/${this.digest}`, { path: this.path });
        this.ngxShowDistractor$.next(false);

        this.sum = result.sum;
        this.length = result.length;
        this.name = this.path.split('/').pop();
    }

}
