const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index1.html');
});

app.get('/Python_Developer', (req, res) => {
  res.sendFile(__dirname + '/Python_Developer.html');
});

app.get('/MERN_Developer', (req, res) => {
  res.sendFile(__dirname + '/MERN_Developer.html');
});


const team1NameSpace = io.of('/team1')
team1NameSpace.on('connect', (socket) => {
  //console.log('a user connected');
  socket.on('join', (data) => {
    socket.join(data.room);
    team1NameSpace.in(data.room).emit('chat message', 'New Person joined the room: '+data.room);

  });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('chat message', (data) => {
      console.log('message: ' + data.msg);
      team1NameSpace.in(data.room).emit('chat message', data.msg);
    });
  });



server.listen(3000, () => {
  console.log('listening on *:3000');
});