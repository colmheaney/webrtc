var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('message', function(msg){
    io.to(msg.channel).emit('message', msg);
    console.log('S --> Got message: ', msg);
  });

  //socket.on('create or join', function (channel) {
    //socket.join(channel);
    //io.to(channel).emit('created', channel);
  //});
  
  socket.on('create or join', function (channel) {
    var clients = io.sockets.adapter.rooms[channel];
    var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
    console.log('numclients = ' + numClients);

    // First client joining...
    if (numClients == 0){
      socket.join(channel);
      io.to(channel).emit('created', channel);
      // Second client joining...        
    } else if (numClients == 1) {
      // Inform initiator...
      io.to(channel).emit('remotePeerJoining', channel);
      // Let the new peer join channel
      socket.join(channel);

      socket.broadcast.to(channel).emit('broadcast: joined', 'S --> broadcast(): client ' + socket.id + ' joined channel ' + channel);
    } else { // max two clients
      console.log("Channel full!");
      socket.emit('full', channel);
    }
  });


  socket.on('response', function(response) {
    io.emit('response', response);
    console.log('S --> Got response: ', response);
  });

  socket.on('Bye', function(channel) {
    // Notify other peer
    io.emit('Bye');
    socket.disconnect();
  });

  socket.on('Ack', function() {
    console.log('Got an Ack!');
    socket.disconnect();
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
