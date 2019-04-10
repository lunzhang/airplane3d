const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const port = process.env.PORT || 1993;
const FRAME_RATE = 1000 / 60;
const planes = {};

app.use(express.static(path.join(__dirname, '../public/build/')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.set('port', port);
server.listen(port);

io.on('connection', (socket) => {
  // User enters game
  socket.on('enter', (plane) => {
    planes[socket.id] = plane;
  });
  // Constant update by user
  socket.on('update', (plane) => {
    planes[socket.id] = plane;
  });
  // User hits a target, let target know
  socket.on('hit', (id) => {
    const hit = io.sockets.connected[id];
    const plane = planes[socket.id];
    if (hit !== undefined) {
      io.emit('msg', `${plane.name} has hit ${planes[id].name}`);
      hit.emit('hit');
    }
  });
  // User fires a missle
  socket.on('fire', () => {
    socket.broadcast.emit('fire', socket.id);
  });
  // User disconnects
  socket.on('disconnect', () => {
    delete planes[socket.id];
  });
});

// Constant update of planes
setInterval(() => {
  io.emit('update', planes);
}, FRAME_RATE);
