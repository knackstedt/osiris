import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MonacoEditorService {
  loaded: boolean = false;

  public loadingFinished: Subject<void> = new Subject<void>();

  constructor() { }

  private finishLoading() {
    this.loaded = true;
    this.loadingFinished.next();
  }

  // This is what we SHOULD use. 
  // Doesn't work.
  public load_original() {
    if (this.loaded) return;
    // load the assets

    const baseUrl = './lib/monaco/min/vs';

    if (typeof (<any>window).monaco === 'object') {
      this.finishLoading();
      return;
    }

    const onGotAmdLoader: any = () => {
      // load Monaco
      (<any>window).require.config({ paths: { vs: `${baseUrl}` } });
      (<any>window).require([`vs/editor/editor.main`], () => {
        this.finishLoading();
      });
    };

    // load AMD loader, if necessary
    if (!(<any>window).require) {
      const loaderScript: HTMLScriptElement = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = `${baseUrl}/loader.js`;
      loaderScript.addEventListener('load', onGotAmdLoader);
      document.body.appendChild(loaderScript);
    } 
    else {
      onGotAmdLoader();
    }
  }
  public load() {
    if (this.loaded) return;

    // Yes, this an annoying workaround.
    // I can't get monaco to load correctly otherwise.
    let i = setInterval(() => {
      if (window.monaco) {
        clearInterval(i);
        this.finishLoading();
      }
    }, 10);
  }
}
