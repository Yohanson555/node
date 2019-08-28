'use strict';
var Jimp = require('jimp');

class Image {
    constructor(source, isBit = false, width = 576) {
        this.width = width || 576;
        this.source = source;
        this.data = [];
        this.isBit = isBit;

        this.size = {
            width: null,
            height: null,
            colors: 4
        };
    }

    async load() {
        const { source: src } = this;

        if (!src) {
            throw new Error("Provide image path");
        } else {
            try {
                return Jimp.read(src).then(image => {
                    const maxWidth = this.width * 0.9;    

                    if (image.bitmap.width > maxWidth) {
                        const ratio = image.bitmap.width / image.bitmap.height;

                        image.resize(maxWidth, maxWidth / ratio);
                    }

                    const pixels = this.dithering(1, image.bitmap.data, image.bitmap.width, image.bitmap.height);

                    this.prepareData({
                        data: pixels,
                        width: image.bitmap.width,
                        height: image.bitmap.height
                    });
                }, err => {
                    if (err.code == "ENOENT") {
                        throw new Error("Mentioned file does not exist");
                    } else {
                        throw new Error("Use correct filname, and make sure file used is image");
                    }
                });
            } catch (error) {
                throw new Error("Use correct filname, and make sure file used is image");
            }
        }
    }

    dithering(errorMultiplier = 1, data, w, h) {
        var filter = [
            [0, 0, 0, 7 / 48, 5 / 48],
            [3 / 48, 5 / 48, 7 / 48, 5 / 48, 3 / 48],
            [1 / 48, 3 / 48, 5 / 48, 3 / 48, 1 / 48]
        ];
    
        var error = [];
        var x, y, xx, yy, r, g, b;
    
        for (y = 0; y < h; y++) error.push(new Float32Array(w));
    
        for (y = 0; y < h; y++) {
    
            for (x = 0; x < w; x++) {
                var id = ((y * w) + x) * 4;
    
                r = data[id];
                g = data[id + 1];
                b = data[id + 2];
    
                var avg = (r + g + b) / 3;

                avg -= error[y][x] * errorMultiplier;
    
                var e = 0;
                if (avg < 128) {
                    e = -avg;
                    avg = 0;
                }
                else {
                    e = 255 - avg;
                    avg = 255;
                }
    
                data[id] = data[id + 1] = data[id + 2] = avg;
                data[id + 3] = 255;
    
                for (yy = 0; yy < 3; yy++) {
                    for (xx = -2; xx <= 2; xx++) {
                        if (y + yy < 0 || h <= y + yy
                            || x + xx < 0 || w <= x + xx) continue;
    
                        error[y + yy][x + xx] += e * filter[yy][xx + 2];
                    }
                }
            }
        }

        return data;
    }

    rgb(pixel) {
        return {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3]
        };
    };

    prepareData(pixels) {
        const self = this;
        var threshold = 127;

        if (!pixels) throw new Error('Pixels object not specified');

        this.pixels = pixels;
        
        this.size = {
            ...this.size,
            width: this.pixels.width,
            height: this.pixels.height,
        }

        for (var i = 0; i < this.pixels.data.length; i += this.size.colors) {
            this.data.push(
                this.rgb(
                    new Array(this.size.colors)
                        .fill(0)
                        .map((_, b) => {
                            return self.pixels.data[i + b];
                        })
                )
            );
        };

        this.data = this.data.map((pixel, i) => {
            if (pixel.a == 0) return 0;

            let luminance = (pixel.r * 0.3 + pixel.g * 0.59 + pixel.b * 0.11) | 0;

            return Number(!(luminance < threshold));
        });
    }

    
    toBitmap(density) {
        density = density || 24;

        var ld, result = [];
        var x, y, b, l, i;
        var c = density / 8; 

        var n = Math.ceil(this.size.height / density);

        for (y = 0; y < n; y++) { 
            ld = result[y] = [];

            for (x = 0; x < this.size.width; x++) {
                for (b = 0; b < density; b++) {
                    i = x * c + (b >> 3);

                    if (ld[i] === undefined) {
                        ld[i] = 0;
                    }

                    l = y * density + b;
                    if (l < this.size.height) {
                        if (this.data[l * this.size.width + x]) {
                            ld[i] += (0x80 >> (b & 0x7));
                        }
                    }
                }
            }
        }

        return {
            data: result,
            density: density
        };
    };

    toRaster() {
        var result = [];
        var width = this.size.width;
        var height = this.size.height;
        var data = this.data;

        // n blocks of lines
        var n = Math.ceil(width / 8);
        var x, y, b, c, i;

        for (y = 0; y < height; y++) {
            for (x = 0; x < n; x++) {
                for (b = 0; b < 8; b++) {
                    i = x * 8 + b;

                    if (result[y * n + x] === undefined) {
                        result[y * n + x] = 0;
                    }

                    c = x * 8 + b;
                    if (c < width) {
                        if (data[y * width + i]) {
                            result[y * n + x] += (0x80 >> (b & 0x7));
                        }
                    }
                }
            }
        }

        return {
            data: result,
            width: n,
            height: height
        };
    }

    getWidth() {
        return this.size.width;
    }

    getHeight() {
        return this.size.height;
    }
}

module.exports = Image;