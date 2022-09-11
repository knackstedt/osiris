import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// import { AppRoutingModule } from './routing.module';
import { RootComponent } from './root.component';
// import { FilemanagerComponent } from './webix/filemanager/filemanager.component';
// import { CalculatorComponent } from 'client/apps/calculator/calculator.component';
// import { SystemSettingsComponent } from 'client/apps/system-settings/system-settings.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WindowComponent } from './components/window/window.component';
import { AppLibModule } from 'client/app/app-lib.module';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    RootComponent,
    WindowComponent,
    // FilemanagerComponent,
    // CalculatorComponent,
    // SystemSettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppLibModule,
    MaterialModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
