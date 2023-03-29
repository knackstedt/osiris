import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { ColumnDefinition, TabulatorFull as Tabulator } from 'tabulator-tables';


@Component({
    selector: 'app-tabulator',
    templateUrl: './tabulator.component.html',
    styleUrls: ['./tabulator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [],
    standalone: true
})
export class TabulatorComponent {
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
    @Output() rowClick = new EventEmitter();
    @Output() rowDblClick = new EventEmitter();
    @Output() rowSelected = new EventEmitter();

    constructor() { }

    ngAfterViewInit() {
        this.table = new Tabulator(this.tableRef.nativeElement, {
            data: this._dataSource,
            // reactiveData: true, //enable data reactivity
            columns: this._columns,
            layout: 'fitDataFill',
            height: "100%",
            maxHeight: window.innerHeight,
            cellClick: this.cellClick.emit.bind(this),
            cellDblClick: this.cellDblClick.emit.bind(this),
            rowClick: this.rowClick.emit.bind(this),
            rowDblClick: this.rowDblClick.emit.bind(this),
            rowSelected: this.rowSelected.emit.bind(this),
        });
    }

    ngOnChanges(changes: SimpleChanges): void {

    }
}
