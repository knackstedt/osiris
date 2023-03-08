import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ConfigurationService } from 'client/app/services/configuration.service';
import { WindowManagerService } from 'client/app/services/window-manager.service';

@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnDestroy {

    @Input() workspaceId = 0;

    constructor(
        public configuration: ConfigurationService,
        public windowManager: WindowManagerService
    ) {
    }

    ngOnDestroy() {
        this.windowManager.managedWindows
            .filter(w => w.workspace == this.workspaceId)
            .forEach(w => w.hibernate())
    }
}
