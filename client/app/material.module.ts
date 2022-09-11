import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
    exports: [
        DragDropModule,
        MatButtonModule,
        MatDialogModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatToolbarModule,
        MatTabsModule,
        OverlayModule
    ]
})
export class MaterialModule { }
