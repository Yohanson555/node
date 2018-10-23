const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log("user connected");

    socket.on('chat message', (msg) => {
        console.log('Received message - ' + msg);

        socket.emit('ccc', 'chat mesage received');
    })

    socket.on('disconnect', () => {
        socket.disconnect();

        console.log('User disconnected');
    });

    socket.emit('test message', 'hello bro');
});

http.listen(5000, () => {
    console.log('listening on *:5000');
}); 
