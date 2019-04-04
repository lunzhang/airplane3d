const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const World = require('./world.js');
const port = process.env.PORT || 1993;
const FRAME_RATE = 1000 / 60;
const world = new World(io);
const tanks = world.tanks;

app.use(express.static(path.join(__dirname, '../public/build/')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.set('port', port);
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
