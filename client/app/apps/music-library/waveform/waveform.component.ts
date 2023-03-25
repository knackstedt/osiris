import { Component, Input, ViewContainerRef } from '@angular/core';
import { HTMLSanitizer } from '../../../pipes/urlsanitizer.pipe';

export type Config = {
    sample_rate: number,
    src: string
};


@Component({
    selector: 'app-waveform',
    templateUrl: './waveform.component.html',
    styleUrls: ['./waveform.component.scss'],
    imports: [
        HTMLSanitizer
    ],
    standalone: true
})
export class WaveformComponent {

    /*
      Initialize the local variables used in the Waveform.
    */
    barCount = 100;

    @Input() barSize = 4;
    @Input() barSpacing = 2.48;
    buffer: AudioBuffer;
    peaks: number[] = [];

    context = new AudioContext();
    @Input() src = "https://cdn.dotglitch.dev/music/joystock-firebird.mp3";

    waveform;

    svgXml: string;

    constructor(private viewContainer: ViewContainerRef) {

    }

    /**
     * Builds each waveform for the page.
     */
    ngAfterViewInit() {
        if (this.barSize > 0) {
            const bounds = (this.viewContainer.element.nativeElement as HTMLElement).getBoundingClientRect();
            this.barCount = Math.floor(bounds.width / (this.barSize + this.barSpacing));
        }
        /*
            Initializes a new XML Http Request.
        */
        var req = new XMLHttpRequest();

        /*
            Opens the src parameter for the audio file to read in.
        */
        req.open("GET", this.src, true);
        req.responseType = "arraybuffer";

        /*
            When the ready state changes, check to see if we can render the
            wave form.
        */
        req.onreadystatechange = (e) => {
            if (req.readyState != 4 || req.status != 200) return;

            this.context.decodeAudioData(req.response, bufferedAudio => {
                this.buffer = bufferedAudio;

                this.peaks = this.getPeaks(this.barCount-1, this.buffer);

                this.process(this.barCount, this.buffer, this.peaks);
            });
        };
        req.send();
    }

    /**
     * Processes the audio and generates the waveform.
     *
     * @param {sampleRate} sampleRate - The rate we should sample the audio.
     * @param {arraybuffer} buffer - The Web Audio API
     * @param {array} peaks - The peaks in the audio.
     */
    process(sampleRate, buffer, peaks) {
        if (!buffer) return;

        /*
            Get the total peaks in the song.
        */
        let totalPeaks = peaks.length;

        /*
            Figure out the depth of the peak.
        */
        const offset = 0;
        let path = "";
        for (let peakNumber = 0; peakNumber < totalPeaks; peakNumber++) {
            if (peakNumber % 2 === 0) {
                path += ` M${(~~(peakNumber / 2)) + offset}, ${(peaks.shift()) + offset}`;
            } else {
                path += ` L${(~~(peakNumber / 2)) + offset}, ${(peaks.shift()) + offset}`;
            }
        }

        /*
            Add the waveform to the built waveforms array.
        */
        this.waveform = path;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewbox", '-1 -2 ' + this.barCount + ' 4');
        // svg.setAttribute("preserveAspectRatio", "xMaxYMid meet");
        svg.setAttribute("preserveAspectRatio", "none");

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svg.appendChild(g);

        const sp = document.createElementNS("http://www.w3.org/2000/svg", "path");
        sp.setAttribute("d", path);
        g.appendChild(sp);

        this.svgXml = svg.outerHTML;
    }

    /**
     * Get the peaks of the audio for the waveform.
     *
     * @param {number} length - The sample size of the audio.
     * @param {array} buffer - The array buffer used to find the peaks in the audio.
     */
    getPeaks(length: number, buffer: AudioBuffer) {
        /*
          Set the parameters needed to build the SVG.
        */
        const sampleSize = buffer.length / length;
        const sampleStep = ~~(sampleSize / 10) || 1;
        const numberOfChannels = buffer.numberOfChannels;
        const mergedPeaks: number[] = [];

        /*
          Iterate over the channels and find the peaks.
        */
        for (
            let channelNumber = 0;
            channelNumber < numberOfChannels;
            channelNumber++
        ) {
            /*
              Initialize the peaks array and set the channel data to what
              the buffer has in its channel data.
            */
            const peaks: number[] = [];
            const channelData = buffer.getChannelData(channelNumber);

            /*
              Iterate over peaks with respect to the sample size.
            */
            for (let peakNumber = 0; peakNumber < length; peakNumber++) {
                /*
                  Gt the start and end peak.
                */
                const start = ~~(peakNumber * sampleSize);
                const end = ~~(start + sampleSize);

                /*
                  Set min and max to the channel data first peak.
                */
                let min = channelData[0];
                let max = channelData[0];

                /*
                  Iterate over the parts of the song starting to the
                  ending to display the waveform.
                */
                for (
                    let sampleIndex = start;
                    sampleIndex < end;
                    sampleIndex += sampleStep
                ) {
                    const value = channelData[sampleIndex];

                    if (value > max) {
                        max = value;
                    }
                    if (value < min) {
                        min = value;
                    }
                }

                /*
                  Set the max and min for the peak.
                */
                peaks[2 * peakNumber] = max;
                peaks[2 * peakNumber + 1] = min;

                /*
                  Merge the peaks
                */
                if (channelNumber === 0 || max > mergedPeaks[2 * peakNumber]) {
                    mergedPeaks[2 * peakNumber] = max;
                }

                if (channelNumber === 0 || min < mergedPeaks[2 * peakNumber + 1]) {
                    mergedPeaks[2 * peakNumber + 1] = min;
                }
            }
        }

        /*
          Returns the merged peaks.
        */
        return mergedPeaks;
    }

}
