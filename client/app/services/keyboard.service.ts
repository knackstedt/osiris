import { HostListener, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

type KeyCommand = {
    ctrl?: boolean,
    alt?: boolean,
    shift?: boolean,
    super?: boolean,
    tab?: boolean,
    /**
     * The non-modifier key(s) that must be pressed for the event to fire.
     */
    key: string | string[]
}

@Injectable({
    providedIn: 'root'
})
export class KeyboardService extends Subject<string> {

    private heldKeys: { [key: string]: boolean } = {};
    private keyCommands: {
        ctrl?: boolean,
        alt?: boolean,
        shift?: boolean,
        super?: boolean,
        tab?: boolean,
        keys: string[],
        sub: Subject<KeyboardEvent>
    }[] = [];

    constructor() { super() }

    @HostListener("keydown")
    private onKeyDown(evt: KeyboardEvent) {
        this.heldKeys[evt.key] = true;

        // Do a general filter where all of the modifiers must be matched if specified
        // Then check that the actual keys match what was specified
        this.keyCommands
            .filter(kc => {
                (kc.ctrl != undefined && kc.ctrl === this.ctrlPressed) &&
                (kc.alt != undefined && kc.alt === this.altPressed) &&
                (kc.shift != undefined && kc.shift === this.shiftPressed) &&
                (kc.super != undefined && kc.super === this.superPressed) &&
                (kc.tab != undefined && kc.tab === this.tabPressed) && 
                kc.keys.length == kc.keys.filter(k => this.heldKeys[k])?.length
            })
            .forEach(kc => kc.sub.next(evt));
    }
    @HostListener("keyup")
    private onKeyUp(evt: KeyboardEvent) {
        this.heldKeys[evt.key] = false;
    }

    @HostListener("keypress")
    private onKeyPress(evt: KeyboardEvent) {
        // this.heldKeys[evt.key] = false;
    }

    /**
     * Use this to subscribe to keyboard events throughout
     * the application. This is a passive listener and will
     * **NOT** interrupt the event chain.
     */
    public onKeyCommand(key: KeyCommand) {
        let item = {
            ...key,
            keys: (Array.isArray(key.key) ? key.key : [key.key]),
            sub: new Subject<KeyboardEvent>()
        }
        this.keyCommands.push(item);
        return item.sub;
    }

    get shiftPressed() {
        return !!this.heldKeys["shift"];
    }
    get ctrlPressed() {
        return !!this.heldKeys["ctrl"];
    }
    get altPressed() {
        return !!this.heldKeys["alt"];
    }
    get superPressed() {
        return !!this.heldKeys["super"];
    }
    get tabPressed() {
        return !!this.heldKeys["tab"];
    }

}
