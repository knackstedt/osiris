import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// What key does the theme get stored under on the 'localstorage' object.
const THEME_KEY = "theme";

@Injectable({
    providedIn: 'root'
})
export class ThemeLoaderService {
    readonly themes = [
        "light",
        "dark",
    ];

    // readonly defaultTheme = "light";
    readonly defaultTheme = "dark";

    private _theme;
    get theme() {
        return this._theme;
    }
    set theme(theme: string) {
        if (!this._theme || !theme) {
            this._theme = localStorage[THEME_KEY] || this.defaultTheme;
            this.theme$ = new BehaviorSubject<string>(this._theme);
        }

        this._theme = localStorage[THEME_KEY] = theme;

        // this.loadStylesheet("theme", link);
        this.themes.forEach(t => this.document.body.classList.remove(t));
        this.document.body.classList.add(theme);

        this.theme$.next(theme);
    }

    public theme$: BehaviorSubject<string>;

    constructor(
        @Inject(DOCUMENT) private document: Document
    ) {
        this.theme = localStorage[THEME_KEY] || this.defaultTheme;
        console.log("theme has bootstrapped")
    }
}
