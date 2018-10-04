var _ = require('lodash');
var express = require('express');
var app = express();
app.use(express.static('static'))
 
var http = require('http').Server(app);
var io = require('socket.io')(http);
var messages = new Array();
var users = {};
var _users = {};
var typing_users = {};

io.on('connection', function(socket){

    console.log(`New socket connected: ${socket.id}`);
    
    socket.on('chat message', function(msg, nick) {
        reg = new RegExp(/#\S+#/, 'gi');
        let names = reg.exec(msg);
        
        if(names) {
            _.each(names, (val, key) => {
                const nickname = val.slice(1, val.length-1);
                const socketId = _users[nickname];
                
                if(socketId) {
                    io.to(`${socketId}`).emit('private', msg.replace(/#\S+#/, ''), nick);
                }
            });
        } else {
            messages.push({
                type: 'message',
                message: msg,
                nickname: nick
            });
            socket.broadcast.emit('chat message', msg, nick, this.id);
        }
        
    });

    socket.on('user conected', function(login){
        console.log(`new user connected: ${login}`);
        users[this.id] = login;
        _users[login] = this.id;

        socket.emit('connected succesfuly', messages, users);
        socket.broadcast.emit('user conected', `New user conected to chat: ${login}`, login, this.id);
    });

    socket.on('disconnect', function(){
        
        const login = users[this.id];

        delete users[this.id];
        delete _users[login];
        console.log('user disconnected')
        console.log(`users now in chat ${users.length}`);
        io.emit('user disconnected', `User ${login} disconnected`, this.id );
    });

    socket.on('user typing', function() {
        const login = users[this.id];

        if(login) {
            let timer = typing_users[this.id];

            if(timer){
                clearTimeout(timer)
            }

            typing_users[this.id] = setTimeout(() => {
                socket.broadcast.emit('user end typing', this.id );
            }, 3000);

            socket.broadcast.emit('user typing', login, this.id );
        }
    });
});


http.listen(4123, function(){
  console.log('listening on *:4123');
});