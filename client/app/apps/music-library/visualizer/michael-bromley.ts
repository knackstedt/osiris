export class Polygon {
    analyser: any;
    sides: any;
    tileSize: any;
    ctx: any;
    tiles: any;
    fgRotation: any;
    num: any;
    high: number;
    decay: number;
    highlight: number;
    y: number;
    x: number;
    vertices: any[];
    streamData: any;
    volume = 0;

    constructor(sides, x, y, tileSize, ctx, num, analyser, streamData, tiles, fgRotation) {
        this.analyser = analyser;
        this.sides = sides;
        this.tileSize = tileSize;
        this.ctx = ctx;
        this.tiles = tiles;
        this.fgRotation = fgRotation;

        /*
            The number of the tile, starting at 0
        */
        this.num = num;
        /*
            The highest colour value, which then fades out
        */
        this.high = 0;
        /*
            Increase this value to fade out faster.
        */
        this.decay = this.num > 42 ? 1.5 : 2;
        /* For highlighted stroke effect
            figure out the x and y coordinates of the center of the polygon based on the
            60 degree XY axis coordinates passed in
        */
        this.highlight = 0;

        var step = Math.round(Math.cos(Math.PI / 6) * tileSize * 2);
        this.y = Math.round(step * Math.sin(Math.PI / 3) * -y);
        this.x = Math.round(x * step + y * step / 2);

        /*
            Calculate the vertices of the polygon
        */
        this.vertices = [];
        for (var i = 1; i <= this.sides; i += 1) {

            x = this.x + this.tileSize * Math.cos(i * 2 * Math.PI / this.sides + Math.PI / 6);
            y = this.y + this.tileSize * Math.sin(i * 2 * Math.PI / this.sides + Math.PI / 6);

            this.vertices.push([x, y]);
        }

        this.streamData = streamData;
    }

    /**
     * Roate vertices
     */
    rotateVertices() {
        /*
            Rotate all the vertices to achieve the overall rotational effect
        */
        let rotation = this.fgRotation;

        // rotation -= this.volume / 800000;
        rotation -= Math.sin(this.volume / 800000);

        for (let i = 0; i <= this.sides - 1; i += 1) {
            this.vertices[i][0] = this.vertices[i][0] - this.vertices[i][1] * Math.sin(rotation);
            this.vertices[i][1] = this.vertices[i][1] + this.vertices[i][0] * Math.sin(rotation);
        }
    };

    /**
     * Draw polygon
     */
    drawPolygon() {
        var bucket = Math.ceil(this.streamData.length / this.tiles.length * this.num);
        var val = Math.pow((this.streamData[bucket] / 255), 2) * 255;
        val *= this.num > 42 ? 1.1 : 1;
        /*
            Establish the value for this tile
        */
        if (val > this.high) {
            this.high = val;
        } else {
            this.high -= this.decay;
            val = this.high;
        }

        /*
            Figure out what colour to fill it and then draw the polygon
        */
        var r, g, b, a;
        if (val > 0) {
            this.ctx.beginPath();
            var offset = this.calculateOffset(this.vertices[0]);
            this.ctx.moveTo(this.vertices[0][0] + offset[0], this.vertices[0][1] + offset[1]);

            /*
                Draw the polygon
            */
            for (var i = 1; i <= this.sides - 1; i += 1) {
                offset = this.calculateOffset(this.vertices[i]);
                this.ctx.lineTo(this.vertices[i][0] + offset[0], this.vertices[i][1] + offset[1]);
            }

            this.ctx.closePath();

            if (val > 128) {
                r = (val - 128) * 2;
                g = ((Math.cos((2 * val / 128 * Math.PI / 2) - 4 * Math.PI / 3) + 1) * 128);
                b = (val - 105) * 3;
            } else if (val > 175) {
                r = (val - 128) * 2;
                g = 255;
                b = (val - 105) * 3;
            } else {
                r = ((Math.cos((2 * val / 128 * Math.PI / 2)) + 1) * 128);
                g = ((Math.cos((2 * val / 128 * Math.PI / 2) - 4 * Math.PI / 3) + 1) * 128);
                b = ((Math.cos((2.4 * val / 128 * Math.PI / 2) - 2 * Math.PI / 3) + 1) * 128);
            }

            if (val > 210) {
                // TODO: Add the cube effect if it's really loud
                // this.cubed = val;
            }

            if (val > 120) {
                /*
                    Add the highlight effect if it's pretty loud
                */
                this.highlight = 100;
            }

            /*
                Set the alpha
            */
            var e = 2.7182;
            a = (0.5 / (1 + 40 * Math.pow(e, -val / 8))) + (0.5 / (1 + 40 * Math.pow(e, -val / 20)));

            this.ctx.fillStyle = "rgba(" +
                Math.round(r) + ", " +
                Math.round(g) + ", " +
                Math.round(b) + ", " +
                a + ")";
            this.ctx.fill();

            /*
                Stroke
            */
            if (val > 20) {
                var strokeVal = 20;
                this.ctx.strokeStyle = "rgba(" + strokeVal + ", " + strokeVal + ", " + strokeVal + ", 0.5)";
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    };

    /**
     * Calculate the offset
     *
     * @param {array} coords
     */
    calculateOffset(coords) {
        this.analyser.getByteFrequencyData(this.streamData);


        var angle = Math.atan(coords[1] / coords[0]);


        /*
            A bit of pythagoras
        */
        var distance = Math.sqrt(Math.pow(coords[0], 2) + Math.pow(coords[1], 2));
        /*
            This factor makes the visualization go crazy wild
        */
        var mentalFactor = Math.min(Math.max((Math.tan(this.volume / 8000) * 0.5), -20), 2);

        var offsetFactor = Math.pow(distance / 3, 2) * (this.volume / 2000000) * (Math.pow(this.high, 1.3) / 300) * mentalFactor;
        var offsetX = Math.cos(angle) * offsetFactor;
        var offsetY = Math.sin(angle) * offsetFactor;
        offsetX *= (coords[0] < 0) ? -1 : 1;
        offsetY *= (coords[0] < 0) ? -1 : 1;
        return [offsetX, offsetY];
    };

    /**
     * Draw the highlight
     */
    drawHighlight() {
        this.ctx.beginPath();
        /*
            Draw the highlight
        */
        var offset = this.calculateOffset(this.vertices[0]);
        this.ctx.moveTo(this.vertices[0][0] + offset[0], this.vertices[0][1] + offset[1]);

        /*
            Draw the polygon
        */
        for (var i = 0; i <= this.sides - 1; i += 1) {
            offset = this.calculateOffset(this.vertices[i]);

            this.ctx.lineTo(this.vertices[i][0] + offset[0], this.vertices[i][1] + offset[1]);
        }
        this.ctx.closePath();
        var a = this.highlight / 100;
        this.ctx.strokeStyle = "rgba(255, 255, 255, " + a + ")";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.highlight -= 0.5;
    };
}

export class Star {

    high = 0;
    angle = 0;
    constructor(public x: number, public y: number, public starSize, public ctx, public fgCanvas, public analyzer, public streamData) {
        this.angle = Math.atan(Math.abs(y) / Math.abs(x));
    }

    drawStar() {
        var distanceFromCentre = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.analyzer.getByteFrequencyData(this.streamData);

        /*
            Calculate an overall volume value
        */
        var total = 0;
        /*
            Get the volume from the first 80 bins, else it gets too loud with treble
        */
        for (var i = 0; i < 80; i++) {
            total += this.streamData[i];
        }

        var volume = total;

        /*
            Stars as lines
        */
        var brightness = 200 + Math.min(Math.round(this.high * 5), 55);
        this.ctx.lineWidth = 0.5 + distanceFromCentre / 2000 * Math.max(this.starSize / 2, 1);
        this.ctx.strokeStyle = 'rgba(' + brightness + ', ' + brightness + ', ' + brightness + ', 1)';
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        var lengthFactor = 1 + Math.min(Math.pow(distanceFromCentre, 2) / 30000 * Math.pow(volume, 2) / 6000000, distanceFromCentre);
        var toX = Math.cos(this.angle) * -lengthFactor;
        var toY = Math.sin(this.angle) * -lengthFactor;
        toX *= this.x > 0 ? 1 : -1;
        toY *= this.y > 0 ? 1 : -1;
        this.ctx.lineTo(this.x + toX, this.y + toY);
        this.ctx.stroke();
        this.ctx.closePath();

        /*
            Starfield movement coming towards the camera
        */
        var speed = lengthFactor / 20 * this.starSize;
        this.high -= Math.max(this.high - 0.0001, 0);
        if (speed > this.high) {
            this.high = speed;
        }

        var dX = Math.cos(this.angle) * this.high;
        var dY = Math.sin(this.angle) * this.high;
        this.x += this.x > 0 ? dX : -dX;
        this.y += this.y > 0 ? dY : -dY;

        var limitY = this.fgCanvas.height / 2 + 500;
        var limitX = this.fgCanvas.width / 2 + 500;
        if ((this.y > limitY || this.y < -limitY) || (this.x > limitX || this.x < -limitX)) {
            /*
                It has gone off the edge so respawn it somewhere near the middle.
            */
            this.x = (Math.random() - 0.5) * this.fgCanvas.width / 3;
            this.y = (Math.random() - 0.5) * this.fgCanvas.height / 3;
            this.angle = Math.atan(Math.abs(this.y) / Math.abs(this.x));
        }
    }

}
