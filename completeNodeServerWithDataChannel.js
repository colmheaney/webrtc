var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));


// Let's start managing connections...
io.on('connection', function(socket){
	
    	// Handle 'message' messages
        socket.on('message', function (message) {
                log('S --> got message: ', message);
                // channel-only broadcast...
                io.emit('message', message);
        });
      
        // Handle 'create or join' messages
        socket.on('create or join', function (room) {
                var clients = io.sockets.adapter.rooms[room];
                var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;

                log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
                log('S --> Request to create or join room', room);

                // First client joining...
                if (numClients == 0){
                        socket.join(room);
                        socket.emit('created', room);
                } else if (numClients == 1) {
                // Second client joining...                	
                        io.sockets.in(room).emit('join', room);
                        socket.join(room);
                        socket.emit('joined', room);
                } else { // max two clients
                        socket.emit('full', room);
                }
        });       
        
        function log(){
            var array = [">>> "];
            for (var i = 0; i < arguments.length; i++) {
            	array.push(arguments[i]);
            }
            socket.emit('log', array);
        }
        
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});