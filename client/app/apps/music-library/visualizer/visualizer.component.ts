import { Component, HostListener, Input, OnInit, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { Polygon, Star } from 'client/app/apps/music-library/visualizer/michael-bromley';
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

    freqPreferences = {
        width: 500,
        height: 500,
        inherit: true,
        type: 'gradient',
        red: 50,
        green: 240,
        blue: 50
    }

    preferences = {
        width: 500,
        height: 500,
        fullscreen: false,
        inherit: true
    }


    ctx: CanvasRenderingContext2D;

    width: number;
    height: number;

    constructor(private viewContainer: ViewContainerRef) { }

    initAnalyzer() {
        if (!this.analyzer) {
            const analyzer = this.analyzer = this.context.createAnalyser();
            const source = this.source = this.context.createMediaElementSource(this.mediaElement as any);

            source.connect(analyzer);
            analyzer.connect(this.context.destination);
        }
    }

    start(ctx: AudioContext) {
        this.context = ctx;
        this.resize();
        this.ctx = this.canvas.getContext('2d');
        this.initAnalyzer();
        this.analyzer.fftSize = 1024; // reset to default

        this.canvas.setAttribute('style', '');
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);

        this.freqByteData = new Uint8Array(this.analyzer.frequencyBinCount);
        this.freqFloatData = new Float32Array(this.analyzer.frequencyBinCount);

        // return this.renderFreq();
        // return this.renderBar();
        // return this.renderCircle();
        return this.renderMichaelBromley();
        switch(this.visualization) {
            case "bar": return this.renderBar();
            case "freq": return this.renderBar();
            case "michaelbromley": return this.renderBar();
        }
    }

    stop() {
        this.ctx.moveTo(0, 0);
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.mbBgCtx) {
            this.mbMgCtx.moveTo(0, 0);
            this.mbMgCtx.clearRect(0, 0, this.width, this.height);
            this.mbBgCtx.moveTo(0, 0);
            this.mbBgCtx.clearRect(0, 0, this.width, this.height);
        }

        if (this.sampleAudioStreamInterval) {
            clearInterval(this.sampleAudioStreamInterval);
            this.sampleAudioStreamInterval = null;
        }
        if (this.drawBgInterval) {
            clearInterval(this.drawBgInterval);
            this.drawBgInterval = null;
        }
        if (this.rotateForegroundInterval) {
            clearInterval(this.rotateForegroundInterval);
            this.rotateForegroundInterval = null;
        }

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


            this.freqPreferences.red = 100 * (i / this.analyzer.frequencyBinCount);
            this.freqPreferences.blue = 150;
            this.freqPreferences.green = barHeight + 100 * (i / this.analyzer.frequencyBinCount);

            this.ctx.fillStyle = 'rgb(' + this.freqPreferences.red + ', ' + this.freqPreferences.green + ', ' + this.freqPreferences.blue + ')';
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

            this.ctx.fillStyle = 'rgb(' + this.freqPreferences.red + ', ' + this.freqPreferences.green + ', ' + this.freqPreferences.blue + ')';
            this.ctx.fillRect(this.freqBarProps.x, this.height - barHeight, this.freqBarProps.barWidth, barHeight);

            this.freqBarProps.x += this.freqBarProps.barWidth + 1;
        }
    }

    mbFgCanvas: HTMLCanvasElement;
    mbFgCtx: CanvasRenderingContext2D;
    mbMgCanvas: HTMLCanvasElement;
    mbMgCtx: CanvasRenderingContext2D;
    mbBgCanvas: HTMLCanvasElement;
    mbBgCtx: CanvasRenderingContext2D;
    tiles: Polygon[] = [];
    stars: Star[] = [];
    volume = 0;
    sampleAudioStreamInterval;
    drawBgInterval;
    rotateForegroundInterval;
    tileSize: number;
    fgRotation: number = 0;

    renderMichaelBromley() {
        this.analyzer.fftSize = 128;

        // For the main canvas layer, cannibalize the regular canvas
        this.mbFgCanvas = this.canvas;
        this.mbFgCanvas.setAttribute('style', 'position: absolute; z-index: 10');
        this.mbFgCtx = this.ctx;

        /*
            Middle Starfield Layer
        */
        this.mbMgCanvas = this.mbBgCanvas || document.createElement('canvas');
        this.mbMgCtx = this.mbBgCtx || this.mbMgCanvas.getContext("2d");
        this.mbMgCanvas.setAttribute('style', 'position: absolute; z-index: 5');
        this.viewContainer.element.nativeElement.appendChild(this.mbMgCanvas);

        /*
            Background Image Layer
        */
        this.mbBgCanvas = this.mbBgCanvas || document.createElement('canvas');
        this.mbBgCtx = this.mbBgCtx || this.mbBgCanvas.getContext("2d");
        this.viewContainer.element.nativeElement.appendChild(this.mbBgCanvas);

        this.makePolygonArray();
        this.makeStarArray();

        this.resize();
        this.drawMichaelBromley();

        this.sampleAudioStreamInterval = setInterval(this.sampleAudioStream.bind(this), 20);
        this.drawBgInterval = setInterval(this.drawMbBg.bind(this), 100);
        this.rotateForegroundInterval = setInterval(this.rotateForeground.bind(this), 20);
    }

	drawMichaelBromley() {
        this.mbFgCtx.clearRect(-this.mbFgCanvas.width, -this.mbFgCanvas.height, this.mbFgCanvas.width * 2, this.mbFgCanvas.height * 2);
        this.mbMgCtx.clearRect(-this.mbFgCanvas.width / 2, -this.mbFgCanvas.height / 2, this.mbFgCanvas.width, this.mbFgCanvas.height);

        this.stars.forEach((star) => star.drawStar());
        this.tiles.forEach((tile) => tile.drawPolygon());
        this.tiles.forEach((tile) => {
            if (tile.highlight > 0) {
                tile.drawHighlight();
            }
        });

        this.requestAnimation = window.requestAnimationFrame(this.drawMichaelBromley.bind(this));
    }

    drawMbBg() {
        this.mbBgCtx.clearRect(0, 0, this.width, this.height);
        var r, g, b, a;
        var val = this.volume / 1000;

        r = 200 + (Math.sin(val) + 1) * 28;
        g = val * 2;
        b = val * 8;
        a = Math.sin(val + 3 * Math.PI / 2) + 1;
        this.mbBgCtx.beginPath();
        this.mbBgCtx.rect(0, 0, this.width, this.height);
        /*
            Create radial gradient
        */
        var grd = this.mbBgCtx.createRadialGradient(this.width / 2, this.height / 2, val, this.width / 2, this.height / 2, this.width - Math.min(Math.pow(val, 2.7), this.width - 20));
        /*
            Centre is transparent black
        */
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(0.8, "rgba(" +
            Math.round(r) + ", " +
            Math.round(g) + ", " +
            Math.round(b) + ", 0.4)");

        this.mbBgCtx.fillStyle = grd;
        this.mbBgCtx.fill();
    }

    sampleAudioStream() {
        this.analyzer.getByteFrequencyData(this.freqByteData);

        /*
        Calculate an overall volume value
        */
        var total = 0;
        /*
                Get the volume from the first 80 bins, else it gets too loud with treble
            */
        for (var i = 0; i < 80; i++) {
            total += this.freqByteData[i];
        }

        this.volume = total;
    }

    rotateForeground() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].rotateVertices();
        }
    }

	makePolygonArray() {
        this.tiles = [];

        let i = 0;
        this.tiles.push(new Polygon(6, 0, 0, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation));

        for (var layer = 1; layer < 32; layer++) {
            this.tiles.push(new Polygon(6, 0, layer, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
            this.tiles.push(new Polygon(6, 0, -layer, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;

            for (var x = 1; x < layer; x++) {
                this.tiles.push(new Polygon(6, x, -layer, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
                this.tiles.push(new Polygon(6, -x, layer, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
                this.tiles.push(new Polygon(6, x, layer - x, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
                this.tiles.push(new Polygon(6, -x, -layer + x, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
            }
            for (var y = -layer; y <= 0; y++) {
                this.tiles.push(new Polygon(6, layer, y, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
                this.tiles.push(new Polygon(6, -layer, -y, this.tileSize, this.mbFgCtx, i, this.analyzer, this.freqByteData, this.tiles, this.fgRotation)); i++;
            }
        }
    }

    /*
        Build the star array.
    */
    makeStarArray() {
        var x;
        var y;
        var starSize;

        this.stars = [];
        var limit = this.mbFgCanvas.width / 15;

        for (var i = 0; i < limit; i++) {
            x = (Math.random() - 0.5) * this.mbFgCanvas.width;
            y = (Math.random() - 0.5) * this.mbFgCanvas.height;
            starSize = (Math.random() + 0.1) * 3;
            this.stars.push(new Star(x, y, starSize, this.mbMgCtx, this.mbFgCanvas, this.analyzer, this.freqByteData));
        }
    }


    @HostListener("window:resize")
    resize() {
        const bounds = (this.viewContainer.element?.nativeElement as HTMLElement)?.getBoundingClientRect();
        this.width = bounds.width;
        this.height = bounds.height;
        this.canvas.height = this.height;
        this.canvas.width = this.width;

        if (this.mbBgCanvas) {
            this.mbFgCtx.translate(this.mbFgCanvas.width / 2, this.mbFgCanvas.height / 2);
            this.mbMgCanvas.width = this.width;
            this.mbMgCanvas.height = this.height;
            this.mbBgCanvas.width = this.width;
            this.mbBgCanvas.height = this.height;
            this.mbMgCtx.translate(this.mbFgCanvas.width / 2, this.mbFgCanvas.height / 2);

            this.tileSize = 15;
            // this.tileSize = this.mbFgCanvas.width > this.mbFgCanvas.height ? this.mbFgCanvas.width / 25 : this.mbFgCanvas.height / 25;

            this.drawMbBg();
            this.makePolygonArray();
            this.makeStarArray();
        }
    }
}

