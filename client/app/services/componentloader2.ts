import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ServiceNameService {
    constructor() { }
    
    async lazyLoadModule() {
    if (!this._moduleLoader) {
        this._moduleLoader = this.injector.get(DynamicModuleLoaderService);
    }

    this._lazyLoadedModule =
      await this._moduleLoader.loadModule(import('./components/dynamic-module/dynamic.module')
        .then(m => m.DynamicModule));

    // lazy load component of module (can also be done inside the module. e.g exported components using static references)
    const dynamicModuleComponentFactory = this._lazyLoadedModule.componentFactoryResolver.resolveComponentFactory(DynamicModuleComponent);
    this._dynamicInstanceRefs.push(
      this.dynamicModuleContainer.createComponent(dynamicModuleComponentFactory, null));
  }
}