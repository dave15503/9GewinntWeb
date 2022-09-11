// Static class that holds all open sessions

class Game {

	GameId
	Player0 // Owner of the instance, can invite another player
	Player1
	CurrentPlayer // Keeps track of who can move next
	Winner

	gameGrid;
	bigGrid;

	constructor(ownerId) {
		this.GameId = 0
		this.gameGrid = []
		for (let i = 0; i < 9; i++) {
			this.gameGrid[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0]
		}

		this.bigGrid = []
		for (let i = 0; i < 3; i++) {
			this.bigGrid[i] = [0, 0, 0]
		}

		this.Player0 = ownerId
		this.Player1 = 0
		this.CurrentPlayer = ownerId;
		this.Winner = 0
	}

	setCell(x, y, playerId) {


		let mark = 1
		if (playerId === this.Player1) {
			mark = 2
		}

		// test if the field is already set
		if (this.gameGrid[x][z] !== 0) {
			return false
		}
		// test if the big field here is already blocking
		let bigX = x / 3;
		let bigY = y / 3;
		if (this.bigGrid[bigX][bigY] !== 0) {
			return false
		}

		// allowed to place:
		this.gameGrid[x][y] = mark

		this.calculateBigCells()
		this.Winner = this.checkForVictory()

		// set the next player
		if (playerId === this.Player1) {
			this.CurrentPlayer = this.Player0
		}
		else {
			this.CurrentPlayer = this.Player1
		}

	}

	calculateBigCells() {
		// check winning status for all 9 3x3 small fields
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				this.bigGrid[i][j] = this.checkSmallGrid(i* 3, j * 3)
			}
		}
	}

	checkSmallGrid(x, y) {
		// x and y the top left coordinates
		let winner = 0;
		for(let i = 0; i < 3; i++) {
			// row equal?
			if(this.tripleEqual(this.gameGrid[x + i][y], this.gameGrid[x + i][y + 1],this.gameGrid[x + i][y+ 2])){
				winner = this.gameGrid[x + i][y]
			}
			if(this.tripleEqual(this.gameGrid[x][y + i], this.gameGrid[x + 1][y + i],this.gameGrid[x + 2][y+ i])){
				winner = this.gameGrid[x][y + i]
			}
		}
		if(winner !== 0) return winner

		// check the diagonals now
		if(this.tripleEqual(this.gameGrid[x][y], this.gameGrid[x + 1][y + 1],this.gameGrid[x + 2][y+ 2])){
			winner = this.gameGrid[x][y]
		}
		if(this.tripleEqual(this.gameGrid[x + 2][y], this.gameGrid[x + 1][y + 1],this.gameGrid[x][y+ 2])){
			winner = this.gameGrid[x+1][y+1]
		}
		return winner

	}

	tripleEqual(a, b, c) {

		if(a === 0) return false
		if(a === b && b === c) return true
		else return false
	}

	checkForVictory() {
		// x and y the top left coordinates
		let winner = 0;
		for(let i = 0; i < 3; i++) {
			// row equal?
			if(this.tripleEqual(this.bigGrid[i][0], this.bigGrid[i][1],this.bigGrid[i][2])){
				winner = this.bigGrid[i][0]
			}
			if(this.tripleEqual(this.bigGrid[0][i], this.bigGrid[1][i],this.bigGrid[2][i])){
				winner = this.bigGrid[0][i]
			}
		}
		if(winner !== 0) return winner

		// check the diagonals now
		if(this.tripleEqual(this.bigGrid[0][0], this.bigGrid[1][1],this.bigGrid[2][2])){
			winner = this.bigGrid[0][0]
		}
		if(this.tripleEqual(this.gameGrid[2][0], this.bigGrid[1][1],this.bigGrid[0][2])){
			winner = this.bigGrid[1][1]
		}
		return winner
	}
}

class GameState {
	static PlayerIds;
	static OpenGameIds;
	static Games;


	static init() {
		this.PlayerIds = [];
		this.OpenGameIds = []
		this.Games = {}; // Will work as a dictionary
	}

	// Adds a player to the registered Id's and returns the Id to the client
	static registerPlayer() {
		let nextId = Math.floor(Math.random() * 10000);
		while (this.PlayerIds.includes(nextId)) {
			nextId = Math.floor(Math.random() * 10000);
		}

		this.PlayerIds.push(nextId)
		return nextId
	}

	static getGame(gameId, playerId) {
		// Check for ownership & if the game exists
		if (!this.checkOwnership(gameId, playerId)) {
			// Access denied
			return null
		}

		// Game exists and the player owns it
		return game
	}

	// Creates a new game Instance owned by the player, return the games' Id and an invitation token
	static startGame(playerId) {
		let nextId = Math.floor(Math.random() * 10000);
		while (this.OpenGameIds.includes(nextId)) {
			nextId = Math.floor(Math.random() * 10000);
		}

		let g = new Game(playerId)
		g.GameId = nextId
		this.OpenGameIds.push(nextId)
		this.Games[nextId] = g
		return nextId
	}

	static enterGame(playerId, gameId) {
		// Check if game and playerExist
		if (!this.checkGameExists(gameId) || !this.checkPlayerExists(playerId)) {
			return false
		}
		// check if player2 spot is still empty
		if (this.Games[gameId].Player1 === 0) {
			this.Games[gameId].Player1 = playerId
			return true
		}
		return false

	}

	static makeMove(x, y, gameId, playerId) {
		// Can only play if: Game is owned, has already started, and the player
		// moving is the currently active player
		if (!this.checkOwnership(gameId, playerId)) {
			return false
		}
		let game = this.Games[gameId]
		if (game.Player1 === -1 || game.CurrentPlayer !== playerId) {
			// Game not yet ready or the player is not allowed
			return false
		}

		// Player can place a mark!
		return this.Games[gameId].markCell(x, y, playerId)
	}

	static checkOwnership(gameId, playerId) {
		// Check if game and playerExist
		if (!this.checkGameExists(gameId) || !this.checkPlayerExists(playerId)) {
			return false
		}
		let game = this.Games[gameId]
		if (game.Player0 !== playerId || game.Player1 !== playerId) {
			// Access denied
			return false
		}
		return true
	}

	static checkGameExists(gameId) {
		return this.OpenGameIds.includes(gameId)
	}

	static checkPlayerExists(playerId) {
		return this.PlayerIds.includes(playerId)
	}

}

module.exports = { GameState, Game };
