import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RootComponent } from './root.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { TaskbarComponent } from './components/taskbar/taskbar.component';
import { WindowComponent } from './components/workspace/window/window.component';
import { WindowErrorComponent } from './apps/@framework/error/error.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ComponentResolveStrategy, NgxLazyLoaderModule } from '@dotglitch/ngx-lazy-loader';
import { NotFoundComponent } from 'client/app/apps/@framework/not-found/not-found.component';
import { LazyProgressDistractorComponent } from 'client/app/apps/@framework/lazy-progress-distractor/lazy-progress-distractor.component';
import { RegisteredApplications } from 'client/app/app.registry';
import { WorkspaceComponent } from 'client/app/components/workspace/workspace.component';
import { CommonAppModule } from './common.module';
import { BackgroundComponent } from 'client/app/components/background/background.component';

@NgModule({
    declarations: [
        RootComponent,
        TaskbarComponent,
        AppMenuComponent,
        WindowComponent,
        BackgroundComponent,
        WorkspaceComponent
    ],
    imports: [
        CommonModule,
        NgxLazyLoaderModule.forRoot({
            // TODO: add additional registries
            entries: RegisteredApplications,
            componentResolveStrategy: ComponentResolveStrategy.PickFirst,
            notFoundComponent: NotFoundComponent,
            loaderDistractorComponent: LazyProgressDistractorComponent,
            errorComponent: WindowErrorComponent
        }),
        CommonAppModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        }),
    ],
    providers: [],
    bootstrap: [RootComponent]
})
export class AppModule { }
