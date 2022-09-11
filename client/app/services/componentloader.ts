import { Compiler, Injectable, Injector, NgModuleFactory, NgModuleRef } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DynamicModuleLoaderService {

    constructor(private compiler: Compiler, private injector: Injector) {
        console.log('Dynamic Module Loader is loaded!');
    }

    loadModule(m: any): Promise<NgModuleRef<any>> {
        return m.then(elementModuleOrFactory => {
            if (elementModuleOrFactory instanceof NgModuleFactory) {
                // if ViewEngine
                return elementModuleOrFactory;
            } else {
                // if Ivy
                return this.compiler.compileModuleAsync(elementModuleOrFactory);
            }
        }).then(moduleFactory => moduleFactory.create(this.injector))
    }
}