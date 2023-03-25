import { Component, HostListener, Input, OnInit, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { UrlSanitizer } from 'client/app/pipes/urlsanitizer.pipe';


type BarOpts = {
    bar_color: '#ff0000',
    width: 500,
    height: 200,
    inherit: true,
    spacer_width: 10,
    bar_width: 5,
    offset: 100,
    cutoff: 23;
}


@Component({
    selector: 'app-visualizer',
    templateUrl: './visualizer.component.html',
    styleUrls: ['./visualizer.component.scss'],
    imports: [
        UrlSanitizer
    ],
    standalone: true
})
export class VisualizerComponent  {
    @ViewChild("canvas") canvasRef: ElementRef<any>;
    get canvas() { return this.canvasRef?.nativeElement }

    @Input() visualization: "bar" | "circular" | "freq" | "michaelbromley" = "circular";

    @Input() mediaElement: HTMLElement;
    context: AudioContext;

    freqByteData: Uint8Array;
    freqFloatData: Float32Array;

    requestAnimation: number;
    analyzer: AnalyserNode;
    source: MediaElementAudioSourceNode;

    barPreferences = {
        bar_color: '#ff0000',
        width: 500,
        height: 200,
        inherit: true,
        spacer_width: 10,
        bar_width: 5,
        offset: 100,
        cutoff: 23
    }

    circlePreferences = {
        barWidth: 2,
        barHeight: 2,
        barSpacing: 5,
        barColor: "#ffffff",
        shadowColor: "#ffffff",
        shadowBlur: 10
    }

    preferences = {
        width: 500,
        height: 500,
        inherit: true,
        type: 'gradient',
        red: 50,
        green: 240,
        blue: 50
    }

    ctx: CanvasRenderingContext2D;

    width: number;
    height: number;

    constructor(private viewContainer: ViewContainerRef) { }

    initAnalyzer() {
        if (!this.analyzer) {
            const analyser = this.analyzer = this.context.createAnalyser();
            const source = this.source = this.context.createMediaElementSource(this.mediaElement as any);

            source.connect(analyser);
            analyser.connect(this.context.destination);
        }
    }

    start(ctx: AudioContext) {
        this.context = ctx;
        this.resize();
        this.ctx = this.canvas.getContext('2d');
        this.initAnalyzer();
        this.analyzer.fftSize = 1024; // reset to default

        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);

        this.freqByteData = new Uint8Array(this.analyzer.frequencyBinCount);
        this.freqFloatData = new Float32Array(this.analyzer.frequencyBinCount);

        // return this.renderFreq();
        // return this.renderBar();
        return this.renderCircle();
        switch(this.visualization) {
            case "bar": return this.renderBar();
            case "freq": return this.renderBar();
            case "michaelbromley": return this.renderBar();
        }
    }

    stop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        cancelAnimationFrame(this.requestAnimation);
    }


    renderBar() {
        this.requestAnimation = requestAnimationFrame(this.renderBar.bind(this));

        this.analyzer.getByteFrequencyData(this.freqByteData);
        this.analyzer.getFloatFrequencyData(this.freqFloatData);

        let numberOfBars = Math.round(this.width / this.barPreferences.spacer_width);

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.barPreferences.bar_color;
        this.ctx.lineCap = 'round';

        for (let i = 0; i < numberOfBars; i++) {
            let barHeight = this.freqByteData[i] + this.freqFloatData[i];

            this.ctx.fillRect(i * this.barPreferences.spacer_width, this.height - barHeight, this.barPreferences.bar_width, barHeight);
        }
    }

    renderCircle() {
        this.requestAnimation = requestAnimationFrame(this.renderCircle.bind(this));

        this.analyzer.getByteFrequencyData(this.freqByteData);
        this.analyzer.getFloatFrequencyData(this.freqFloatData);

        this.ctx.clearRect(0, 0, this.width, this.height);

        for (
            var cx = this.width / 4,
            cy = this.height / 2,
            a = cx - (this.width/8),
            i = Math.floor((2 * a * Math.PI) / (this.circlePreferences.barWidth + this.circlePreferences.barSpacing)),
            s = i - Math.floor((25 * i) / 100),
            n = Math.floor(this.freqByteData.length / i),
            r = 0;
            r < s;
            r++
        ) {
            var h = this.freqByteData[r * n] + this.freqFloatData[r * n],
                c = (2 * r * Math.PI) / i + Math.PI,
                o = ((135 - this.circlePreferences.barWidth) * Math.PI) / 180,
                f = a - (h / 12 - this.circlePreferences.barHeight),
                l = this.circlePreferences.barWidth,
                d = h / 6 + this.circlePreferences.barHeight;
            this.ctx.save(),
                this.ctx.translate(cx, cy),
                this.ctx.rotate(c - o),
                this.ctx.fillRect(0, f, l, d),
                this.ctx.restore();
        }
    }

    freqBarProps = {
        x: 0,
        barWidth: 0
    }
    renderFreq() {

        // Control the number of frequency groups in the analyzer;
        this.analyzer.fftSize = 256;

        this.freqBarProps.barWidth = (this.width / this.analyzer.frequencyBinCount) * 2;

        // switch (this.preferences.type) {
        //     case 'gradient':
        //         this.renderGradientAnimation();
        //         break;
        //     case 'dynamic':
        //         this.renderDynamicColorAnimation();
        //         break;
        //     default:
        //     case 'single':
        //         break;
        //     }
                // this.renderDynamicColorAnimation();
                this.renderGradientAnimation();

        // this.renderSingleColorAnimation();
    }

    renderGradientAnimation() {
        this.requestAnimation = requestAnimationFrame(this.renderGradientAnimation.bind(this));

        this.freqBarProps.x = 0;

        this.analyzer.getByteFrequencyData(this.freqByteData);
        this.analyzer.getFloatFrequencyData(this.freqFloatData);

        this.ctx.clearRect(0, 0, this.width, this.height);

        var gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(1, '#00ff00');
        gradient.addColorStop(0.5, '#ff8000');
        gradient.addColorStop(0, '#e60000');

        for (var i = 0; i < this.analyzer.frequencyBinCount; i++) {
            const barHeight = this.freqByteData[i] + this.freqFloatData[i];

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(this.freqBarProps.x, this.height - barHeight, this.freqBarProps.barWidth, barHeight);

            this.freqBarProps.x += this.freqBarProps.barWidth + 1;
        }
    };

    renderDynamicColorAnimation() {
        this.requestAnimation = requestAnimationFrame(this.renderDynamicColorAnimation.bind(this));

        this.freqBarProps.x = 0;

        this.analyzer.getByteFrequencyData(this.freqByteData);
        this.analyzer.getFloatFrequencyData(this.freqFloatData);

        this.ctx.clearRect(0, 0, this.width, this.height);

        for (var i = 0; i < this.analyzer.frequencyBinCount; i++) {
            const barHeight = this.freqByteData[i] + this.freqFloatData[i];


            this.preferences.red = 100 * (i / this.analyzer.frequencyBinCount);
            this.preferences.blue = 150;
            this.preferences.green = barHeight + 100 * (i / this.analyzer.frequencyBinCount);

            this.ctx.fillStyle = 'rgb(' + this.preferences.red + ', ' + this.preferences.green + ', ' + this.preferences.blue + ')';
            this.ctx.fillRect(this.freqBarProps.x, this.height - barHeight, this.freqBarProps.barWidth, barHeight);

            this.freqBarProps.x += this.freqBarProps.barWidth + 1;
        }
    };

    renderSingleColorAnimation() {
        this.requestAnimation = requestAnimationFrame(this.renderSingleColorAnimation.bind(this));

        this.freqBarProps.x = 0;

        this.analyzer.getByteFrequencyData(this.freqByteData);
        this.analyzer.getFloatFrequencyData(this.freqFloatData);

        this.ctx.clearRect(0, 0, this.width, this.height);

        for (var i = 0; i < this.analyzer.frequencyBinCount; i++) {
            const barHeight = this.freqByteData[i] + this.freqFloatData[i];

            this.ctx.fillStyle = 'rgb(' + this.preferences.red + ', ' + this.preferences.green + ', ' + this.preferences.blue + ')';
            this.ctx.fillRect(this.freqBarProps.x, this.height - barHeight, this.freqBarProps.barWidth, barHeight);

            this.freqBarProps.x += this.freqBarProps.barWidth + 1;
        }
    }

    @HostListener("window:resize")
    resize() {
        const bounds = (this.viewContainer.element?.nativeElement as HTMLElement)?.getBoundingClientRect();
        this.width = bounds.width;
        this.height = bounds.height;
    }
}
