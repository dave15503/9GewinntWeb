// Static class that holds all open sessions

class Game {
  
  Player0 // Owner of the instance, can invite another player
  Player1
  CurrentPlayer // Keeps track of who can move next
  
  gameGrid;
  bigGrid;
  
  constructor(ownerId) {
    this.gameGrid = []
    for(let i = 0; i < 9; i++) {
      this.gameGrid[i] = [0,0,0,0,0,0,0,0,0]
    }
    
    this.bigGrid = []
    for(let i =0; i < 3; i++){
      this.bigGrid[i] = [0, 0, 0]
    }
    
    this.Player0 = ownerId
    this.Player1 = 0
    this.CurrentPlayer = ownerId; 
  }
  
  setCell(x, y, playerId) {
    let mark = 1
    if(playerId === this.Player1){
      mark = 2
    }
    
    this.gameGrid[x][y] = mark
    
    // set the big cells, check them for victory
    // TOMORROW. its 2:30AM already... 
    
    
  }
  
  checkForVictory() {
    
  }
}

class GameState {
  static PlayerIds;
  static OpenGameIds;
  static Games;
  
  static InviteCodes

  static init() {
    this.PlayerIds = [];
    this.OpenGameIds = []
    this.Games = {}; // Will work as a dictionary
    this.InviteCodes = [] // Hold Objects {inviteCode, gameId}
  }
  
  // Adds a player to the registered Id's and returns the Id to the client
  static registerPlayer() {
    let nextId = Math.floor(Math.rand() * 10000);
    while(this.PlayerIds.includes(nextId)) {
      nextId = Math.floor(Math.rand() * 10000);
    }
    
    this.PlayerIds.push(nextId)
    return nextId
  }
  
  static getGame(gameId, playerId) {
    // Check for ownership & if the game exists
    if(!this.checkOwnership(gameId, playerId)) {
      // Access denied
      return null
    }
    
    // Game exists and the player owns it
    return game
  }
  
  // Creates a new game Instance owned by the player, return the games' Id and an invitation token
  static startGame(playerId) {
    
  }
  
  static enterGame(playerId, token) {
    
  }
  
  static makeMove(x, y, gameId, playerId){
    // Can only play if: Game is owned, has already started, and the player
    // moving is the currently active player
    if(!this.checkOwnership(gameId, playerId)){
      return null
    }
    let game = this.Games[gameId]
    if(game.Player1 === -1 || game.CurrentPlayer !== playerId) {
      // Game not yet ready or the player is not allowed
      return null
    }
    
    // Player can place a mark!
    this.Games[gameId].markCell(x, y, playerId)
    
  }
  
  static checkOwnership(gameId, playerId) {
    // Check if game and playerExist
    if(!this.OpenGameIds.includes(gameId) || !this.PlayerIds.includes(playerId)){
      return false
    }
    let game = this.Games[gameId]
    if(game.Player0 !== playerId || game.Player1 !== playerId) {
      // Access denied
      return false
    }
    return true
  }
  
}

module.exports = { GameState, Game };
