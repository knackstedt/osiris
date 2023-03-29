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
        console.log("SET DATAS", !!this.table, this.table, data)
        this._dataSource = data;

        this.table?.setData(this.dataSource);
    };
    get dataSource() { return this._dataSource };

    private _columns = [];
    @Input() set columns(data: ColumnDefinition[]) {
        this._columns = data;
        this.table?.setColumns(this.columns);
    };
    get columns() { return this._columns }

    table: Tabulator;

    @Output() cellClick = new EventEmitter();
    @Output() cellDblClick = new EventEmitter();

    @Output() rowClick = new EventEmitter<TabulatorEvent<T>>();
    @Output() rowContext = new EventEmitter<TabulatorEvent<T>>();
    @Output() rowDblClick = new EventEmitter<TabulatorEvent<T>>();

    constructor() { }

    ngAfterViewInit() {
        const table = this.table = new Tabulator(this.tableRef.nativeElement, {
            data: this._dataSource,
            // reactiveData: true, //enable data reactivity
            columns: this._columns,
            layout: 'fitDataFill',
            height: "100%",
            maxHeight: window.innerHeight,
            cellDblClick: console.log,
            // cellClick: this.cellClick.next.bind(this),
            // cellDblClick: this.cellDblClick.next.bind(this),
            // rowClick: this.rowClick.next.bind(this),
            // rowDblClick: this.rowDblClick.next.bind(this),
            rowDblClick: console.log,
            // rowSelected: this.rowSelected.next.bind(this),
        });

        table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        table.on("rowContext", (e, row) => this.rowContext.next({ event: e, row, data: row.getData() }));
        table.on("rowDblClick", (e, row) => this.rowDblClick.next({ event: e, row, data: row.getData() }));
        // table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        // table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        // table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        // table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        // table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        // table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));

    }

    ngOnChanges(changes: SimpleChanges): void {

    }
}
