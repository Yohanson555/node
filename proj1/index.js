var _ = require('lodash');
var net = require('net');
var express = require('express');
var app = express();
app.use(express.static('static'))
 
var http = require('http').Server(app);
var io = require('socket.io')(http);
const iconv = require('iconv-lite');

io.on('connection', function(socket){
    console.log(`New socket connected: ${socket.id}`);
    
    socket.on('print bill', (host, port, text) => {
        console.log('printing bill');
        var printerConnection = net.createConnection(port, host);

        printerConnection.on('connect',function(){
            this.write(iconv.encode(text, 'cp866'));
        
            printerConnection.destroy();
        });
    })
});


http.listen(4123, function(){
  console.log('listening on *:4123');
});