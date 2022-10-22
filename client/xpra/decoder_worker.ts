/*
 * Copyright (c) 2022 Garen Fang <fungaren@qq.com>
 * -------------- The file has been tested on Xpra server version v4.3.2 ---------------
 * -------------------- and may not work on previous version -------------------------
 *
 * Copyright (C) 2021 Tijs van der Zwaan <tijzwa@vpo.nl>
 * Copyright (c) 2021 Antoine Martin <antoine@xpra.org>
 * Licensed under MPL 2.0, see:
 * http://www.mozilla.org/MPL/2.0/
 *
 * This file is part of Xpra.
 */
import { createBitmapFromCompressedRgb } from './rgb_decoder'

class WebCodecsImageDecoder {
    static get available() {
        return ('ImageDecoder' in window)
    }

    /**
     * Create BitmapImage from image buffer
     * @param {Uint8Array} data
     * @param {String} mime
     * @returns Promise that resolves with an ImageBitmap object.
     */
    static async createBitmapFromBuffer(data, mime = 'image/jpeg'): Promise<ImageBitmap> {
        if (!WebCodecsImageDecoder.available)
            throw 'your browser does not support WebCodecs'

        return new Promise((resolve) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/ImageDecoder
            new window['ImageDecoder']({
                data: data,
                type: mime,
                colorSpaceConversion: "none",
            }).decode({
                // The decoder may output a progressive images when false. Default true
                completeFramesOnly: true,
            }).then(({ image }) => {
                image.width = image.codedWidth
                image.height = image.codedHeight
                resolve(image) // VideoFrame object
                // NOTICE: close the frame when no longer needed:
                // frame.close()
            })
        })
    }
}

class WebCodecsVideoDecoder {
    codec = ''
    onError = null

    decoder = null
    frameCounter = 0

    // As the decoder can only decode a piece of data once a time,
    // if too much data come, put them here.
    frameQueue = []
    outputResolver = null
    outputRejector = null

    static get available() {
        return ('VideoDecoder' in window)
    }

    /**
     * Constructor
     * @param {String} codec Codec, eg. avc1.42C01E
     * @param {Number} width Width
     * @param {Number} height Height
     * @param {Function} onError Callback
     */
    constructor(codec, width, height, onError) {
        if (!WebCodecsVideoDecoder.available)
            throw 'your browser does not support WebCodecs'

        this.codec = codec
        this.onError = onError

        this.decoder = new window['VideoDecoder']({
            output: (frame) => {
                // Someone is waiting for it
                if (this.outputResolver) {
                    let r = this.outputResolver
                    this.outputResolver = null
                    r(frame) // VideoFrame Object
                } else
                    this.frameQueue.push(frame)
            },
            error: (e) => {
                if (this.decoder.state != 'closed')
                    this.decoder.close()
                this.decoder = null
                this.onError(e)
            },
        })
        /* eslint-enable no-undef */

        this.decoder.configure({
            codec: this.codec,
            // hardwareAcceleration: "prefer-hardware",
            // minimize the number of EncodedVideoChunk objects that
            // have to be decoded before a VideoFrame is output.
            optimizeForLatency: true,
            // width of the VideoFrame in pixels
            codedWidth: width,
            codedHeight: height,
            // A BufferSource containing a sequence of codec specific bytes.
            // description: null,
        })
    }
    /**
     * Paint to OffscreenCanvas in Web Worker
     * @param {Canvas} canvas OffscreenCanvas
     */
    async paint(canvas) {
        if (!this.decoder)
            throw 'the decoder is broken'

        // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
        let ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false

        while (this.decoder.state != 'closed') {
            let frame = null
            if (this.frameQueue.length > 0)
                frame = this.frameQueue.shift()
            else {
                try {
                    frame = await new Promise((r, j) => {
                        this.outputResolver = r
                        this.outputRejector = j
                    })
                } catch {
                    return // Terminated
                }
            }

            // ctx.drawImage(frame,
            //   0, 0, config.codedWidth, config.codedHeight,
            //   0, 0, canvas.width, canvas.height,
            // )
            ctx.drawImage(frame, 0, 0)
            frame.close()
            // ctx.commit() // unsupported

            /* Limit the fps if necessary */
            await new Promise(r => setTimeout(r, 1000 / 25))
        }
    }
    /**
     * Decode chunk
     * @param {Uint8Array} data Video data
     * @param {Object} options Codec object
     */
    decode(data, options) {
        if (!this.decoder)
            throw 'the decoder is broken'

        if (options.type != 'IDR' && this.frameCounter == 0)
            throw 'first frame must be a key frame'

        // https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk/EncodedVideoChunk
        // Eslint do not recognize WebCodecs API currently.
        /* eslint-disable no-undef */
        this.decoder.decode(new window['EncodedVideoChunk']({
            // Indicates if the chunk is a key chunk that
            // does not rely on other frames for encoding
            type: options.type == 'IDR' ? 'key' : 'delta',
            // An integer representing the timestamp of the video in microseconds
            timestamp: options.frame,
            // Representing the duration of the video in microseconds
            // duration: 0,
            // A BufferSource containing the video data.
            data: data,
        }))
        /* eslint-enable no-undef */

        ++this.frameCounter
    }
    /**
     * Close the decoder
     */
    close() {
        if (!this.decoder)
            throw 'the decoder is broken'

        if (this.decoder.state != 'closed')
            this.decoder.close()

        if (this.outputResolver)
            this.outputRejector()

        this.decoder = null
    }
}

let windows = {}

onmessage = function (e) {
    const data = e.data
    switch (data.cmd) {
        case 'addWnd':
            windows[data.wndId] = { canvas: data.offscreenCanvas }

            if (WebCodecsVideoDecoder.available) {
                windows[data.wndId].video = new WebCodecsVideoDecoder(
                    'avc1.42C01E', data.offscreenCanvas.width, data.offscreenCanvas.height, (e) => postMessage({
                        cmd: 'error',
                        text: e,
                    }))
                windows[data.wndId].video.paint(data.offscreenCanvas)
            }
            break
        case 'removeWnd':
            {
                if (!(data.wndId in windows)) {
                    console.error('wndId', data.wndId, 'does not exists')
                    break
                }
                const wnd = windows[data.wndId]
                if (wnd.video)
                    wnd.video.close()
                delete windows[data.wndId]
            }
            break
        case 'draw':
            {
                if (!(data.wndId in windows)) {
                    console.error('wndId', data.wndId, 'does not exists')
                    break
                }
                const wnd = windows[data.wndId]
                // let destWidth = e.srcWidth
                // let destHeight = e.srcHeight
                // if (e.options.scaled_size)
                //   destWidth, destHeight = e.options.scaled_size[0], e.options.scaled_size[1]
                switch (data.encoding) {
                    case 'void':
                        break
                    case 'scroll':
                        {
                            const ctx = wnd.canvas.getContext("2d")
                            let n = data.data.length
                            for (const t of data.data) {
                                const x = t[0]
                                const y = t[1]
                                const w = t[2]
                                const h = t[3]
                                const xDelta = t[4]
                                const yDelta = t[5]
                                ctx.drawImage(wnd.canvas, x, y, w, h, x + xDelta, y + yDelta, w, h)
                                if (--n == 0) {
                                    // ctx.commit() // unsupported
                                    postMessage({
                                        cmd: 'painted',
                                        seqId: data.seqId,
                                        text: '',
                                    })
                                }
                            }
                        }
                        break
                    case 'jpeg':
                    case 'png':
                    case 'png/P':
                    case 'png/L':
                    case 'webp':
                    case 'avif':
                        {
                            const mime = 'image/' + data.encoding.split('/')[0]
                            WebCodecsImageDecoder.createBitmapFromBuffer(data.data, mime).then(bmp => {
                                const ctx = wnd.canvas.getContext("2d")
                                ctx.clearRect(data.x, data.y, bmp.width, bmp.height)
                                ctx.drawImage(bmp, data.x, data.y)
                                // ctx.commit() // unsupported
                                bmp.close()
                                postMessage({
                                    cmd: 'painted',
                                    seqId: data.seqId,
                                    text: '',
                                })
                            }).catch((e) => {
                                console.error(e)
                                postMessage({
                                    cmd: 'painted',
                                    seqId: e.seqId,
                                    text: 'failed to decode image: ' + e,
                                })
                            })
                        }
                        break
                    case 'rgb':
                    case 'rgb32':
                    case 'rgb24':
                        createBitmapFromCompressedRgb(
                            data.data, data.srcWidth, data.srcHeight, data.encoding, data.rowStride, data.options,
                        ).then(bmp => {
                            const ctx = wnd.canvas.getContext("2d")
                            ctx.clearRect(data.x, data.y, bmp.width, bmp.height)
                            ctx.drawImage(bmp, data.x, data.y)
                            // ctx.commit() // unsupported
                            bmp.close()
                            postMessage({
                                cmd: 'painted',
                                seqId: data.seqId,
                                text: '',
                            })
                        }).catch(e => {
                            console.error(e)
                            postMessage({
                                cmd: 'painted',
                                seqId: e.seqId,
                                text: 'failed to decode image: ' + e,
                            })
                        })
                        break
                    case 'h264':
                        wnd.video.decode(data.data, data.options)
                        // TODO: postMessage when decodes finished.
                        postMessage({
                            cmd: 'painted',
                            seqId: data.seqId,
                            text: '',
                        })
                        break
                    default:
                        console.error('unsupported encoding', data.encoding)
                        postMessage({
                            cmd: 'painted',
                            seqId: data.seqId,
                            text: 'unsupported encoding: ' + data.encoding,
                        })
                        break
                }
            }
            break
        case 'close':
            for (const wndId in windows)
                windows[wndId].video.close()
            windows = {}
            close()
            break
        default:
            postMessage({
                cmd: 'error',
                text: 'unknown command: ' + data.cmd
            })
            break
    }
}
