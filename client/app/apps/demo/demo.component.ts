import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow, Window } from 'client/app/services/window-manager.service';

@Window()
@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: any;

    constructor() { }

    // ???
    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }

    onResize(evt) { console.log("onResize", evt) }
    onResizeStart(evt) { console.log("onResizeStart", evt) }
    onResizeEnd(evt) { console.log("onResizeEnd", evt) }
    onDrag(evt) { console.log("onDrag", evt) }
    onDragStart(evt) { console.log("onDragStart", evt) }
    onDragEnd(evt) { console.log("onDragEnd", evt) }
    onActivateChange(evt) { console.log("onActivateChange", evt) }
    onCollapseChange(evt) { console.log("onCollapseChange", evt) }
    onMaximizeChange(evt) { console.log("onMaximizeChange", evt) }
    onClose(evt) { console.log("onClose", evt) }
    beforeClose(evt) { console.log("beforeClose", evt); return true}
}
