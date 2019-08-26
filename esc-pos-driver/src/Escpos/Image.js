'use strict';
const _ = require('./Commands');
const getPixels = require('get-pixels');
const ImageJs = require('image-js');
var Jimp = require('jimp');
const { MutableBuffer } = require('mutable-buffer');
const { URL } = require('url');

class Image {
    constructor(source) {
        this.width = 576;
        this.source = source;
        this.data = [];

        this.size = {
            width: null,
            height: null,
            colors: null
        };
    }

    async load() {
        const self = this;
        const { source } = this;

        // проверяю, задан ли source. если нет, то ошибка

        if (!source)
            throw new Error('Image source not specified');

        const image = await ImageJs.Image.load(source);

        console.log("Loaded image: ");
        console.log(image);

        const grey = image
            .resize({
                width: 150
            })
            .grey({
                algorithm: 'lightness'
            });

        // we create a mask, which is basically a binary image
        // a mask has as source a grey image and we will decide how to determine
        // the threshold to define what is white and what is black
        var mask = grey.mask({
            algorithm: 'li'
        });

        //console.log(mask);

        const maskBuffer = mask.toBuffer({
            format: 'jpg'
        });
        const buf = Buffer.from(maskBuffer);

        getPixels(buf, 'image/jpg', (err, pixels) => {
            //console.log('here is the pixels!');
            //console.log(pixels);

            if (err) throw new Error(err);
            this.prepareData(pixels);
        });
        /*
    return new Promise((resolve, reject) => {
        //изображение может быть задано в двух варианта
        // 1. Как url изображения в сети
        // 2. Как base64 строка //TODO

        getPixels(source, (err, pixels) => {
            this.prepareData(pixels);
            
            //console.log('result data');
            //console.log(this.data);

            resolve();
        });

        /*
        ImageJs.Image.load(source).then(image => {
            const grey = image
                .resize({ width: 200 })
                .grey({ algorithm: 'lightness' });

            var mask = grey.mask({ algorithm: 'li' });

            const maskBuffer = mask.toBuffer({ format: 'jpg' });
            const buf = Buffer.from(maskBuffer);

            
        });
        
    });*/
    }

    async load2() {
        const { source: src } = this;

        if (!src) {
            throw new Error("Provide image path");
        } else {
            try {
                return Jimp.read(src).then(image => {
                    console.log(image);
                    image.resize(50, 50);

                    console.log(image);
                    const pixels = this.dithering(1, image.bitmap.data, image.bitmap.width, image.bitmap.height);
                    this.prepareData({
                        data: pixels,
                        width: image.bitmap.width,
                        height: image.bitmap.height,
                        colors: 4
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
    
        for (y = 0; y < h; y++)error.push(new Float32Array(w));
    
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
            a: pixel[3],
            avg: ((pixel[0] + pixel[1] + pixel[2]) / 3) | 0
        };
    };

    prepareData(pixels) {
        const self = this;

        if (!pixels) throw new Error('Pixels object not specified');
        this.pixels = pixels;

        console.log('this pixels', this.pixels.shape);

        this.size = {
            width: this.pixels.width,
            height: this.pixels.height,
            colors: this.pixels.colors,
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

            var white = pixel.r > 200 && pixel.g > 200 && pixel.b > 200;

            //return pixel.avg;

            return white ? 0 : 1;
        });
    }

    toBitmap(density) {
        density = 8;
        density = density || 24;

        var ld, result = [];
        var x, y, b, l, i;
        var c = density / 8;

        console.log("SIZE:", this.size);

        // n blocks of lines
        var n = Math.ceil(this.size.height / density);

        for (y = 0; y < n; y++) {
            // line data
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

    lineSpace(n) {
        let t = '';

        if (n === undefined || n === null) {
            t = _.LINE_SPACING.LS_DEFAULT;
        } else {
            t = `${_.LINE_SPACING.LS_SET}${n}`;
        }

        return t;
    };
}

module.exports = Image;