import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { WebglAddon } from 'xterm-addon-webgl';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';

import io, { Socket } from "socket.io-client";
import { OnResize } from 'client/types/window';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { ConfigurationService } from 'client/app/services/configuration.service';

@Component({
    selector: "window-terminal",
    templateUrl: './terminal.component.html',
    styleUrls: ['./terminal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        WindowTemplateComponent
    ],
    standalone: true
})
export class TerminalComponent implements OnInit, AfterViewInit, OnResize {
    @ViewChild('terminal') terminalRef: ElementRef;


    @Input("window") windowRef: ManagedWindow;
    @Input() cwd: string;


    terminal: Terminal;
    socket: Socket;
    fitAddon: FitAddon;
    webglAddon: WebglAddon;

    rowHeight = 17;
    charWidth = 8;

    constructor(private config: ConfigurationService) { }

    ngOnInit(): void {
        console.log(this.windowRef, this.cwd);
    }

    ngOnDestroy() {
        this.socket.close();
    }

    ngAfterViewInit(): void {
        const socket = this.socket = io({path: "/ws/metrics.io"});

        socket.on("init-error", ex => {
            console.log("Pty failed to init", ex);
        });

        // The pty on the remote died
        socket.on("terminate", code => {
            console.log("Pty was killed", code);
        });

        socket.on("connect", () => {
            if (this.terminal) return;

            socket.emit("start", { shell: this.config.shell, cwd: this.cwd || this.config.homedir});

            // this.loadFont("ubuntumono");

            // Create an xterm.js instance.
            const terminal = this.terminal = new Terminal();
            // const fitAddon = this.fitAddon = new FitAddon();

            // terminal.loadAddon(fitAddon);

            // terminal.loadAddon(new WebLinksAddon());
            // const unicode11Addon = new Unicode11Addon();
            // terminal.loadAddon(unicode11Addon);
            // terminal.unicode.activeVersion = '11';


            // this.webglAddon.onContextLoss(e => {
                //     // e.preventDefault();
                //     this.webglAddon.dispose();
                //     this.webglAddon = null;
                // });

            terminal.options.theme = {
                background: "#333333",
                foreground: "#ffffff",
                black: "#333333",
                brightBlack: "#88807c",
                red: "#cc0000",
                brightRed: "#f15d22",
                green: "#4e9a06",
                brightGreen: "#73c48f",
                yellow: "#c4a000",
                brightYellow: "#ffce51",
                blue: "#3465a4",
                brightBlue: "#48b9c7",
                magenta: "#75507b",
                brightMagenta: "#ad7fa8",
                cyan: "#06989a",
                brightCyan: "#34e2e2",
                white: "#d3d7cf",
                brightWhite: "#eeeeec"
            };
            terminal.options.fontFamily = "Ubuntu Mono";
            terminal.options.fontSize = this.rowHeight; // height in px
            terminal.options.fontWeight = "100";
            terminal.options.fontWeightBold = "900";
            terminal.options.lineHeight;
            terminal.options.letterSpacing;


            // Attach created terminal to a DOM element.
            terminal.open(this.terminalRef.nativeElement);
            terminal.loadAddon(this.webglAddon = new WebglAddon());
            this.onResize();

            this.startListening();
        })
    }


    onResize(): void {
        const rows = Math.floor((this.windowRef.height - this.config.windowToolbarHeight) / this.rowHeight);
        const cols = Math.floor(this.windowRef.width / this.charWidth);

        this.windowRef.width = cols * this.charWidth;
        this.windowRef.height = (rows * this.rowHeight) + this.config.windowToolbarHeight + 2;

        this.terminal.resize(cols, rows);

        // Resize the remote xterm
        this.socket.emit("resize", {rows, cols});
    }

    /**
     * Attach bidirectional socket binding
     */
    startListening() {
        this.terminal.onData(data => this.socket.emit("input", data));
        this.socket.on("output", data => this.terminal.write(data));
    }
}
