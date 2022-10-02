import { Component, OnInit, ComponentRef, Input, ViewChild, ElementRef, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WindowComponent {
    
    @Input() window: ManagedWindow;
    @Input() data: any;

    error: any;

    constructor(private keyboard: KeyboardService) {
        keyboard.onKeyCommand({
            key: "w",
            ctrl: true,
            window: this.window,
            interrupt: true
        }).subscribe(evt => this.window.close());
    }

    injectPortal(ref) {
        const component = ref as ComponentRef<any>;

        // Bind the window reference
        component.instance["windowRef"] = this.window;
        // Bind arbitrary data
        component.instance["data"] = this.data;
        
        this.window._component = component;

        // If we have a decorated __onError handler,
        // we listen for init errors.
        component.instance.__onError?.subscribe(err => {
            // avoid "Expression changed after last checked" error
            setTimeout(() => {
                this.error = err;
            }, 1);
        });
    }

    attachHandlers() {
        

        // interact('.item').draggable({
        //     listeners: {
        //         start(event) {
        //             console.log(event.type, event.target)
        //         },
        //         move(event) {
        //             position.x += event.dx
        //             position.y += event.dy

        //             event.target.style.transform =
        //                 `translate(${position.x}px, ${position.y}px)`
        //         },
        //         end(event) {

        //         }
        //     }
        // })
        //     .resizable({
        //         edges: { top: true, left: true, bottom: true, right: true },
        //         listeners: {
        //             move: function (event) {
        //                 let { x, y } = event.target.dataset

        //                 x = (parseFloat(x) || 0) + event.deltaRect.left
        //                 y = (parseFloat(y) || 0) + event.deltaRect.top

        //                 Object.assign(event.target.style, {
        //                     width: `${event.rect.width}px`,
        //                     height: `${event.rect.height}px`,
        //                     transform: `translate(${x}px, ${y}px)`
        //                 })

        //                 Object.assign(event.target.dataset, { x, y })
        //             }
        //         }
        //     })
    }



}
