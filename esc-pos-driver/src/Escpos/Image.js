'use strict';
const _ = require('./Comands');
const getPixels = require('get-pixels');
const ImageJs = require('image-js');
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

        const grey = image
            .resize({
                width: 100
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

        console.log(mask);

        const maskBuffer = mask.toBuffer({
            format: 'jpg'
        });
        const buf = Buffer.from(maskBuffer);

        getPixels(buf, 'image/jpg', (err, pixels) => {
            console.log('here is the pixels!');
            console.log(pixels);

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
            width: this.pixels.shape[0],
            height: this.pixels.shape[1],
            colors: this.pixels.shape[2],
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
            return white ? 0 : 1;
        });
    }

    render(density) {
        density = 's8';
        var n = !!~['d8', 's8'].indexOf(density) ? 1 : 3;

        console.log('density is: ', density);

        var header = _.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];
        var bitmap = this.toBitmap(n * 8);

        console.log('bitmap');
        console.log(bitmap);

        let buffer = new MutableBuffer();

        //this.lineSpace(0); // set line spacing to 0

        buffer.write(_.LINE_SPACING.LS_SET);
        buffer.writeUInt8(0);

        bitmap.data.forEach((line) => {
            //console.log('line is', line);
            buffer.write(header);
            buffer.writeUInt16LE(line.length / n);
            buffer.write(line);
            buffer.write(_.EOL);
        });

        buffer.write(_.LINE_SPACING.LS_DEFAULT);

        console.log('BUFFER:');
        console.log(buffer);

        const result = buffer.flush();

        return result;
    };

    render2(mode = null) {
        mode = mode || 'normal';
        if (mode === 'dhdw' ||
            mode === 'dwh' ||
            mode === 'dhw') mode = 'dwdh';

        var raster = this.toRaster();
        var header = _.GSV0_FORMAT['GSV0_' + mode.toUpperCase()];

        console.log(raster);

        let buffer = new MutableBuffer();

        buffer.write(header);
        buffer.writeUInt16LE(raster.width);
        buffer.writeUInt16LE(raster.height);
        buffer.write(raster.data);

        return buffer.flush();
    };

    toBitmap(density) {
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