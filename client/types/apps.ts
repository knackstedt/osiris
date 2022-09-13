import { ComponentType } from '@angular/cdk/portal';
export type ApplicationDefinition = {
    name: "File Manager",
    _portal: {
        contentComponent: ComponentType<any>,
        titlebarComponent?: ComponentType<any>,
        id: string,
        data: string | any // JSON serializable content
    },
    width: number,
    height: number
}