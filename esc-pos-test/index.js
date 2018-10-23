
var net = require('net');

var HOST = '192.168.1.211';
var PORT = 9100;

/*
var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write('I am Chuck Norris!');
    client.destroy();
});
*/

var socket = net.createConnection(PORT, HOST);

socket.on('connect',function(){
    console.log('connected');
    this.write('test message\x0a');
    this.write('test message\x0a');
    this.write('test message\x0a');
    this.write('test message\x0a');
    this.write('\x0a\x0a\x0a\x0a\x0a');
    this.write('\x0a\x0a\x0a\x0a\x0a');
    this.write('\x0a\x0a\x0a\x0a\x0a\x0a\x0a \x1d\x56\x00');
    

    socket.destroy();
});



/*
const escpos = require('escpos');
const device  = new escpos.Network('192.168.1.211');
const printer = new escpos.Printer(device);

device.open(function() {
    printer
        .model('qsprinter')
        .font('a')
        .align('ct')
        .size(1, 1)
        .encode('utf8')
        .text('QR code example')
        // .qrcodeqs('http://agriex.market')
        .qrcode(`Я вас любил: любовь ещё, быть может,
        В душе моей угасла не совсем;
        Но пусть она вас больше не тревожит;`)
        .text('')
        .text('')
        // .barcode('123456789012', 'EAN13') // code length 12
        // .barcode('109876543210') // default type 'EAN13'
        // .barcode('7654321', 'EAN8') // The EAN parity bit is automatically added.
        .cut()
    .close();
});
*/