const express = require('express')
const http = require('http')
const path = require('path')

const { Server } = require('socket.io')

const { GameState, Game } = require('./GameState')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})

app.use(express.static("public"));

GameState.init()

const broadcastGame = (gameId) => {

	io.to(String(gameId)).emit('game-state', JSON.stringify(GameState.Games[gameId]))
}

io.on('connection', (socket) => {
	console.log('a user connected as' + socket.id);

	socket.on('register', (msg) => {
		// register the Id in gamstate
		let pId = GameState.registerPlayer()
		let payload = { pId: pId, sId: socket.id }
		console.log(payload)
		socket.emit('registered', JSON.stringify(payload))
	})

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('start-game', (msg) => {
		let payload = JSON.parse(msg)
		let pId = parseInt(payload.pId)
		let gameId = GameState.startGame(pId)

		// add the player to the room and connect him to the game
		socket.join(String(gameId))

		broadcastGame(gameId)
	});

	socket.on('enter-game', (msg) => {
		let payload = JSON.parse(msg)
		let pId = parseInt(payload.pId)
		let gameId = parseInt(payload.gameId)
		if (GameState.enterGame(pId, gameId)) {
			// successfully entered, send the gamestate
			socket.join(String(gameId))
			broadcastGame(gameId)
		}
		else {
			console.log('failed to enter game')
		}
	})

	socket.on('try-reconnect', (msg) => {
		let payload = JSON.parse(msg)
		let pId = parseInt(payload.pId)
		let found = false
		for (let i = 0; i < GameState.OpenGameIds.length; i++) {
			let game = GameState.Games[GameState.OpenGameIds[i]]
			if (game.Player0 === pId || game.Player1 === pId) {
				let gameId = game.GameId
				socket.join(String(gameId))
				broadcastGame(gameId)
				found = true
				break
			}
		}
		if(!found){
			// The player is in no game, send command to wipe the cookies
			// and start a new session
			// this should be a failsafe for when the backend crashes but the users
			// still think they are logged in.
			socket.emit('reconnect-failed', JSON.stringify({pId: pId}))

		}

	})

	socket.on('leave-game', (msg) => {
		let payload = JSON.parse(msg)
		let pId = parseInt(payload.pId)
		let gameId = parseInt(payload.gameId)
		// if the player is the owner, delete the game
		// if the player only joined, just remove him from the game
		if(GameState.leaveGame(gameId, pId)){
			// remove the socket from the room
			io.to(String(gameId)).emit('game-state', JSON.stringify(null))
			io.in(String(gameId)).socketsLeave(String(gameId))
		}
	})

	socket.on('place', (msg) => {
		let payload = JSON.parse(msg)
		let pId = parseInt(payload.pId)
		let gameId = parseInt(payload.gameId)
		console.log(payload)
		if (GameState.makeMove(payload.x, payload.y, gameId, pId)) {
			// successfully entered, send the gamestate
			broadcastGame(gameId)
		}
		else {
			console.log('Error setting this cell')
		}
	})

});

process.env.PORT = 3000
server.listen(process.env.PORT, () => {
	console.log('Server started and listening on port ' + process.env.PORT)
})
