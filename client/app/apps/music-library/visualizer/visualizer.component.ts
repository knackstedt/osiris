import { Component, HostListener, Input, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { Polygon, Star } from 'client/app/apps/music-library/visualizer/michael-bromley';
import { UrlSanitizer } from 'client/app/pipes/urlsanitizer.pipe';
import { MatSelectModule } from '@angular/material/select';

/**
 * Visualizations are rewritten from
 * https://github.com/521dimensions/amplitudejs
 * Note: the referenced source has many bugs and
 * problems, thus we include fixes as well.
 */

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
        UrlSanitizer,
        MatSelectModule
    ],
    standalone: true
})
export class VisualizerComponent  {
    @ViewChild("canvas") canvasRef: ElementRef<any>;
    get canvas() { return this.canvasRef?.nativeElement as HTMLCanvasElement }

    @Input() visualization: string = "circular";

    @Input() mediaElement: HTMLElement;

    readonly modes = [
        "bar",
        "circular",
        "freq-1",
        "freq-2",
        "freq-3",
        "michaelbromley"
    ];

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

    ctx: CanvasRenderingContext2D;

    width: number;
    height: number;

    constructor(private viewContainer: ViewContainerRef) { }

    onModeSelect(mode: string) {
        this.visualization = mode as any;

        // Restart the animation
        if (this.requestAnimation) {
            this.stop();
            this.start(this.context);
        }
    }

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
        this.canvas.setAttribute("width", this.width.toString());
        this.canvas.setAttribute("height", this.height.toString());

        this.freqByteData = new Uint8Array(this.analyzer.frequencyBinCount);
        this.freqFloatData = new Float32Array(this.analyzer.frequencyBinCount);

        // return this.renderFreq();
        // return this.renderBar();
        // return this.renderCircle();
        // return this.renderMichaelBromley();
        switch(this.visualization) {
            case "spectrum": return this.renderSpectrum();
            case "spectrum-mini": return this.renderSpectrum("mini");
            case "bar": return this.renderBar();
            case "circular": return this.renderCircle();
            case "freq-1": return this.renderFreq("basic");
            case "freq-2": return this.renderFreq("dynamic");
            case "freq-3": return this.renderFreq("gradient");
            case "michaelbromley": return this.renderMichaelBromley();
        }
    }

    stop() {
        cancelAnimationFrame(this.requestAnimation);

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

        // Cleanup
        this.mbMgCanvas?.remove();
        this.mbBgCanvas?.remove();
        this.mbMgCanvas = null;
        this.mbBgCanvas = null;
        this.mbMgCtx = null;
        this.mbBgCtx = null;

        this.spectrumCacheCanvas?.remove();
        this.spectrumCacheCanvas = null;
        this.spectrumCacheCtx = null;
    }

    spectrumCacheCanvas: HTMLCanvasElement;
    spectrumCacheCtx: CanvasRenderingContext2D;
    isSpectrumMini = false;
    renderSpectrum(state?: string) {
        if (state == "mini") this.isSpectrumMini = true;

        this.spectrumCacheCanvas = this.spectrumCacheCanvas || document.createElement("canvas");
        this.spectrumCacheCanvas.width = this.width;
        this.spectrumCacheCanvas.height = this.height;
        this.spectrumCacheCtx = this.spectrumCacheCtx || this.spectrumCacheCanvas.getContext("2d");
        this.spectrumCallback();
    }
    spectrumCallback() {
        this.requestAnimation = requestAnimationFrame(this.spectrumCallback.bind(this));

        this.freqBarProps.x = 0;

        this.analyzer.getByteFrequencyData(this.freqByteData);
        this.analyzer.getFloatFrequencyData(this.freqFloatData);

        const spectrumWidth = this.analyzer.frequencyBinCount / 4;
        const lineWidth = 4;
        const y = this.height / 2;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.spectrumCacheCtx.clearRect(0, 0, this.width, this.height);


        let gradient;
        if (this.isSpectrumMini) {
            gradient = this.ctx.createLinearGradient(0, this.height / 4, 0, this.height - (this.height/4));
            gradient.addColorStop(0, '#03C1EB');
            gradient.addColorStop(1, '#86F3B8');
        }

        for (let i = this.freqByteData.length - 1; i >= 0; i--) {
            const frequency = this.freqByteData[i] + this.freqFloatData[i];
            const fNorm = frequency / 256;
            const x = i / spectrumWidth * this.width;
            const hue = 110 * (1 - fNorm);
            const height = 0.25 * this.height * fNorm;

            this.ctx.beginPath();
            this.ctx.lineCap = "round";
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = this.isSpectrumMini ? gradient : `hsla(${hue}, 60%, 50%, 1)`;
            this.ctx.moveTo(x, y - height);
            this.ctx.lineTo(x, y + height);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // this.spectrumCacheCtx.save();
        // this.spectrumCacheCtx.filter = 'blur(5px)';
        // this.spectrumCacheCtx.drawImage(this.canvas, 0, 0);
        // this.spectrumCacheCtx.restore();

        // this.spectrumCacheCtx.save();
        // this.spectrumCacheCtx.globalCompositeOperation = 'lighter';
        // this.spectrumCacheCtx.drawImage(this.canvas, 0, 0);
        // this.spectrumCacheCtx.restore();

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

    renderFreq(type: string) {

        // Control the number of frequency groups in the analyzer;
        this.analyzer.fftSize = 256;

        this.freqBarProps.barWidth = (this.width / this.analyzer.frequencyBinCount) * 2;

        switch (type) {
            case 'gradient':
                return this.renderGradientAnimation();
            case 'dynamic':
                return this.renderDynamicColorAnimation();
            default:
            case 'basic':
                return this.renderGradientAnimation();
        }
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
        this.mbFgCanvas.setAttribute('style', 'position: absolute; z-index: 2');
        this.mbFgCtx = this.ctx;

        /*
            Middle Starfield Layer
        */
        this.mbMgCanvas = this.mbBgCanvas || document.createElement('canvas');
        this.mbMgCtx = this.mbBgCtx || this.mbMgCanvas.getContext("2d");
        this.mbMgCanvas.setAttribute('style', 'position: absolute; z-index: 1');
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
                tile.volume = this.volume;
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
            generally between 0000 -> 10,000
        */
        var total = 0;
        for (var i = 0; i < this.analyzer.frequencyBinCount; i++) {
            total += this.freqByteData[i];
        }

        this.volume = total;
    }

    rotateForeground() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].volume = this.volume;
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

