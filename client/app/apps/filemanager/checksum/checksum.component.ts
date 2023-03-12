import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Fetch } from 'client/app/services/fetch.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-checksum',
    templateUrl: './checksum.component.html',
    styleUrls: ['./checksum.component.scss'],
    imports: [
        CommonModule
    ],
    standalone: true
})
export class ChecksumComponent implements OnInit {

    @Input() path: string;
    @Input() digest: "md5" | "sha1" | "sha256";

    public ngxShowDistractor$ = new BehaviorSubject(true);

    constructor(
        private fetch: Fetch
    ) { }


    sum;
    length;
    async ngOnInit() {
        let result: any = await this.fetch.post(`/api/filesystem/checksum/${this.digest}`, { path: this.path });
        this.ngxShowDistractor$.next(false);

        this.sum = result.sum;
        this.length = result.length;
    }

}
