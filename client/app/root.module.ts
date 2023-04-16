import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ComponentResolveStrategy, NgxLazyLoaderModule } from '@dotglitch/ngx-lazy-loader';
import { ToastrModule } from 'ngx-toastr';

import { RootComponent } from './root.component';
import { TaskbarComponent } from './components/taskbar/taskbar.component';
import { WindowComponent } from './components/workspace/window/window.component';
import { WindowErrorComponent } from './apps/@framework/error/error.component';

import { NotFoundComponent } from 'client/app/apps/@framework/not-found/not-found.component';
import { LazyProgressDistractorComponent } from 'client/app/apps/@framework/lazy-progress-distractor/lazy-progress-distractor.component';
import { RegisteredApplications, LazyComponents, DialogComponents } from 'client/app/app.registry';
import { WorkspaceComponent } from 'client/app/components/workspace/workspace.component';
import { BackgroundComponent } from 'client/app/components/background/background.component';
import { HTMLSanitizer } from 'client/app/pipes/urlsanitizer.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        RootComponent,
        TaskbarComponent,
        WindowComponent,
        BackgroundComponent,
        WorkspaceComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        HTMLSanitizer,
        NgxLazyLoaderModule.forRoot({
            // TODO: add additional registries
            entries: [
                ...RegisteredApplications,
                ...DialogComponents,
                ...LazyComponents
            ],
            componentResolveStrategy: ComponentResolveStrategy.PickFirst,
            notFoundComponent: NotFoundComponent,
            loaderDistractorComponent: LazyProgressDistractorComponent,
            errorComponent: WindowErrorComponent
        }),
        ToastrModule.forRoot(),
        MatIconModule,
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
