const net = require('net');
var iconv = require('iconv-lite');

const port = '9100';
const host = '192.168.117.211';

var sText = '';
sText += '\x1d\x21\x00A\x0a\x0a\x0a\x0a';
sText += '\x1d\x21\x11A\x0a\x0a\x0a\x0a';



sText += '\x0a\x0a\x0a\x1d\x56\x00\x0a\x0a\x0a';

const connect = net.createConnection(port, host);
connect.on('connect', () => {
  connect.write(iconv.encode(sText, 'cp866'));
  connect.destroy();
});