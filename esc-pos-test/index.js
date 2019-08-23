'use strict';
const path = require('path');
const escpos = require('./lib/escpos');

const port = 9100;
const host = '192.168.117.211';

const device  = new escpos.Network(host, port);
const printer = new escpos.Printer(device);

const tux = path.join(__dirname, 'gru.jpg');

escpos.Image.load(tux, function(image){
  device.open(function(){
    printer.align('ct');
    printer.raster(image);
    printer.cut();
    printer.close();
  });
});