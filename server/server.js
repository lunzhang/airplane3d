var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var World = require('./world.js');
var port = process.env.PORT || 80;
var FRAME_RATE = 1000/60;
var world = new World(io);
var tanks = world.tanks;
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.set('port', (port));
server.listen(port);

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
        io.emit('msg',tank.name + ' has hit ' + tanks[id].name);
        hit.emit('hit');
      }
      if(id < 5){
        io.emit('msg',tank.name + ' has hit ' + tanks[id].name);
        world.hit(id);
      }
  });

  //bot hits a user
  socket.on('bothit',function(id){
      var bot = tanks[id];
      io.emit('msg',bot.name + 'has hit ' + tanks[socket.id].name);
      socket.emit('hit');
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
  world.update();
  io.emit('update',tanks);
},FRAME_RATE);
