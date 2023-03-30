import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { ColumnDefinition, RowComponent, TabulatorFull as Tabulator } from 'tabulator-tables';

export type TabulatorEvent<T = any> = {
    event: any,
    row: RowComponent,
    data: T
}

@Component({
    selector: 'app-tabulator',
    templateUrl: './tabulator.component.html',
    styleUrls: ['./tabulator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [],
    standalone: true
})
export class TabulatorComponent<T = any> {
    @ViewChild("table") tableRef: ElementRef<any>;

    private _dataSource = [];
    @Input() set dataSource(data: Object[]) {
        this._dataSource = data;

        if (this.table?.getDataCount() > 0) {
            const current = this.table.getData();
            const ids = current.filter(i => !!i[this.key]).map(i => i[this.key]);

            const newItems = data.filter(d => !ids.includes(d[this.key]));
            const updatedItems = data.filter(d => ids.includes(d[this.key]));
            const removedItems = ids.filter(id => !data.find(d => d[this.key] == id));

            this.table.updateData(updatedItems);
            this.table.addData(newItems);
            removedItems.forEach(i => this.table.deleteRow(i));
        }
        else
            this.table?.setData(this.dataSource);
    };
    get dataSource() { return this._dataSource };

    private _columns = [];
    @Input() set columns(data: ColumnDefinition[]) {
        this._columns = data;
        this.table?.setColumns(this.columns);
    };
    get columns() { return this._columns }

    @Input() key: string;

    table: Tabulator;

    @Output() cellClick = new EventEmitter();
    @Output() cellDblClick = new EventEmitter();

    @Output() rowClick = new EventEmitter<TabulatorEvent<T>>();
    @Output() rowContext = new EventEmitter<TabulatorEvent<T>>();
    @Output() rowDblClick = new EventEmitter<TabulatorEvent<T>>();

    constructor() { }

    ngAfterViewInit() {
        const table = this.table = new Tabulator(this.tableRef.nativeElement, {
            index: this.key,
            data: this._dataSource,
            reactiveData: true,
            columns: this._columns,
            layout: 'fitDataFill',
            height: "100%",
            maxHeight: window.innerHeight
        });

        table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        table.on("rowContext", (e, row) => this.rowContext.next({ event: e, row, data: row.getData() }));
        table.on("rowDblClick", (e, row) => this.rowDblClick.next({ event: e, row, data: row.getData() }));

    }

    ngOnChanges(changes: SimpleChanges): void {

    }
}
