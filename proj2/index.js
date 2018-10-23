var net = require('net');

var HOST = '192.168.1.211';
var PORT = 9100;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    //client.write('I am Chuck Norris! \x0a');

    var texttoprint = "\x1d\x21\x00 Test \x0a";
    texttoprint += "\x1d\x21\x11 Test \x0a";
    texttoprint += "\x1d\x21\x22 Test \x0a";
    texttoprint += "\x1d\x21\x33 Test \x0a";
    texttoprint += "\x1d\x21\x44 Test \x0a";
    texttoprint += "\x1d\x21\x55 Test \x0a";
    texttoprint += "\x1d\x21\x66 Test \x0a";
    texttoprint += "\x1d\x21\x77 Test \x0a";
    texttoprint += "\x0a\x0a";
    texttoprint += "\x1d\x56\x41 \x0a";

    const buf = Buffer.from(texttoprint);

    client.write(buf);
});

/*
var socket = require('socket.io-client')('http://offsw7.local:41234');

var bufArr = new ArrayBuffer(5);
var bufView = new Uint8Array(bufArr);
bufView[0]=6;
bufView[1]=7;
bufView[2]=8;
bufView[3]=9;
bufView[4]=10;
socket.emit('message',bufArr);

socket.emit("print bill", "192.168.1.211", "9100", bufArr);
*/