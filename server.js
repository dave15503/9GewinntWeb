const express = require('express')
const http = require('http')
const path = require('path')

const {Server} = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.use(express.static("public"));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

process.env.PORT = 3000
server.listen(process.env.PORT, () => {
  console.log('Server started and listening on port ' + process.env.PORT)
})
