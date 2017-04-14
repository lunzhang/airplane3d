var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var port = process.env.PORT || 80;
var FRAME_RATE = 1000.0 / 60.0;

app.use('/public', express.static(__dirname + '/public'));
app.set('port', (port));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

server.listen(port);

var tanks = {};

io.on('connection', function(socket){

  //user enters game
  socket.on('enter',function(tank){
        tanks[socket.id] = tank;
  });

  //constant update by user
  socket.on('update',function(tank){
        tanks[socket.id] = tank;
  });

  //user hits a target, let target know
  socket.on('hit',function(id){
      let hit = io.sockets.connected[id];
      let tank = tanks[socket.id];
      if(hit != undefined){
        socket.broadcast.emit(tank.name + ' has hit ' + tanks[id].name);
        hit.emit('hit');
      }
  });

  //user fires a missle
  socket.on('fire',function(){
      socket.broadcast.emit('fire',socket.id);
  });

  socket.on('disconnect',function(){
      delete tanks[socket.id];
  });

});

//constant update of tanks
setInterval(function(){
  io.sockets.emit('update',tanks);
},FRAME_RATE);
