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
    @Input() background: string;

    get windows() {
        return this.windowManager.managedWindows
            .filter(w => w.workspace == this.workspaceId);
    }

    constructor(
        public configuration: ConfigurationService,
        public windowManager: WindowManagerService
    ) {
    }

    ngOnDestroy() {
        this.windows.forEach(w => w.hibernate())
    }


    onClick(evt) {
        console.log(evt);

        const win = this.getParentNode("app-window", evt.target);
        const id = win ? win.id.split('_')[1] : '';

        this.windows
            .filter(w => w.id != id)
            .forEach(w => w._isActive = false);
    }

    /**
     * Returns true if ANY of the ancestor nodes match the specified test.
     * @param nodeName node name to match. e.g. "APP-MY-COMPONENT"
     * @param currentNode starting Element to search from
     * @returns boolean
     */
    private getParentNode(nodeName: string, currentNode: Element): HTMLElement {
        if (!currentNode) return null;

        if (currentNode.nodeName == "BODY" || currentNode.nodeName == "HTML")
            return null;
        else if (currentNode.nodeName == nodeName.toUpperCase())
            return currentNode as HTMLElement;
        else
            return this.getParentNode(nodeName, currentNode.parentElement);
    }
}
