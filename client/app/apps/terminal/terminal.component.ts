import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { WebglAddon } from 'xterm-addon-webgl';
// import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';

import io, { Socket } from "socket.io-client";
import { OnResize } from 'client/types/window';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';

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


    @Input() windowRef: ManagedWindow;
    @Input() data: any;


    terminal: Terminal;
    socket: Socket;
    fitAddon: FitAddon;
    webglAddon: WebglAddon;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }

    ngAfterViewInit(): void {
        // const socket = this.socket = io({
        //     secure: true,
        //     path: "/terminal.io",
        //     host: "localhost:3000",
        //     hostname: "localhost:3000",
        //     port: 3000,
        //     rejectUnauthorized: false
        // });

        // const socket = this.socket = io("https://localhost:3000/");
        const socket = this.socket = io();

        socket.on("connect", () => {
            if (!this.terminal) {
                // this.loadFont("ubuntumono");

                // Create an xterm.js instance.
                const terminal = this.terminal = new Terminal();
                const fitAddon = this.fitAddon = new FitAddon();

                terminal.loadAddon(fitAddon);



                // terminal.loadAddon(new WebLinksAddon());
                const unicode11Addon = new Unicode11Addon();
                terminal.loadAddon(unicode11Addon);
                // terminal.unicode.activeVersion = '11';


                // this.webglAddon.onContextLoss(e => {
                    //     // e.preventDefault();
                    //     this.webglAddon.dispose();
                    //     this.webglAddon = null;
                    // });

                terminal.options.theme = {
                    background: "#333333",
                    foreground: "#F5F8FA",
                };

                // Attach created terminal to a DOM element.
                terminal.open(this.terminalRef.nativeElement);
                terminal.loadAddon(this.webglAddon = new WebglAddon());
                this.fitAddon.fit();

                // terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

                this.startListening();
            }
        })
        // When terminal attached to DOM, start listening for input, output events.
        // Check TerminalUI startListening() function for details.
        // terminal.;
    }

    onResize(evt: any): void {
        console.log("resizing")
        this.fitAddon?.fit();
    }

    /**
     * Attach event listeners for terminal UI and socket.io client
     */
    startListening() {
        this.terminal.onData(data => this.sendInput(data));
        this.socket.on("output", data => {
            // When there is data from PTY on server, print that on Terminal.
            this.terminal.write(data);
        });
    }

    /**
     * Utility function to print new line on terminal.
     */
    prompt() {
        this.terminal.write(`\\r\\n$ `);
    }

    /**
     * Send whatever you type in Terminal UI to PTY process in server.
     * @param {*} input Input to send to server
     */
    sendInput(input) {
        this.socket.emit("input", input);
    }

    /**
     *
     * container is a HTMLElement where xterm can attach terminal ui instance.
     * div#terminal-container in this example.
     */
    attachTo(container) {
        this.terminal.open(container);
        // Default text to display on terminal.
        this.terminal.write("Terminal Connected");
        this.terminal.write("");
        this.prompt();
    }
}
