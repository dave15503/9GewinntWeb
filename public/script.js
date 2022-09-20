
const { useState, useRef } = React

function GridCell({ state, onClick, x, y }) {
	let sign = "";
	if (state == 1) {
		sign = "X";
	} else if (state == 2) {
		sign = "◯";
	}

	return (
		<button
			className='small-cell'
			onClick={onClick}
			style={{
				gridColumn: x + 1 + "/" + (x + 1),
				gridRow: y + 1 + "/" + (y + 1),
			}}>
			{sign}
		</button>
	);
}

function BigGridCell({ x, y, state }) {

	let sign = "";
	if (state == 1) {
		sign = "X";
	} else if (state == 2) {
		sign = "◯";
	}

	const startCellX = (3 * x) + 1
	const startCellY = (3 * y) + 1

	return (<div
		className='big-cell'
		style={{
			gridColumn: startCellX + "/" + (startCellX + 3),
			gridRow: startCellY + "/" + (startCellY + 3)
		}}>
		{sign}
	</div>)
}

function AppView() {

	var socket = io()

	// will save the userId in a cookie.
	// when there is none we need to connect to the socket to get one	
	let pId = Cookies.get('pId')
	let sId = Cookies.get('sId')

	const [gamestate, setGameState] = useState(null)

	const tkEditor = useRef()



	socket.on('registered', (msg) => {
		let payload = JSON.parse(msg)
		Cookies.remove('pId')
		Cookies.remove('sId')
		pId = String(payload.pId)
		sId = payload.sId
		Cookies.set('pId', pId, { expires: 1 })
		Cookies.set('sId', sId, { expires: 1 })
	})

	socket.on('game-state', (msg) => {
		let payload = JSON.parse(msg)
		console.log(payload)
		setGameState(payload)
	})

	
	socket.on('reconnect-failed', (msg) => {
		// when reconnecting failed, remove cookies and try to register anew
		let payload = JSON.parse(msg)
		if (payload.pId === pId) {
			Cookies.remove('pId')
			Cookies.remove('sId')
			socket.emit('register')
		}
	})

	if (pId == null || pId === 'undefined') {
		//  register the client with the server
		console.log(pId)
		socket.emit('register')
	}
	else {
		pId = parseInt(Cookies.get('pId'))
		sId = Cookies.get('sId')

		if (gamestate == null) {
			let payload = { pId: pId }
			// try to reconnect
			// host will issue game-state message when the pId is found in a game
			socket.emit('try-reconnect', JSON.stringify(payload))
		}
	}


	const onStartGame = () => {
		let payload = { pId: pId }
		socket.emit('start-game', JSON.stringify(payload))
	}

	const onEnterGame = () => {

		if (tkEditor.current.value === '') {
			alert('please enter a value!')
			return
		}

		let payload = { pId: pId, gameId: parseInt(tkEditor.current.value) }
		socket.emit('enter-game', JSON.stringify(payload))

	}

	const onCellClick = (x, y) => {
		console.log('Cell click at (' + x + '/' + y + ')')
		let payload = { x: x, y: y, pId: pId, gameId: gamestate.GameId }
		socket.emit('place', JSON.stringify(payload))
	}

	const renderSmallGrid = () => {
		let cells = []

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {

				cells.push(<GridCell x={i} y={j} state={gamestate.gameGrid[i][j]} onClick={() => onCellClick(i, j)}></GridCell>)
			}
		}

		return cells

	}

	const renderBigGrid = () => {
		let cells = [];

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				cells.push(<BigGridCell x={i} y={j} state={gamestate.bigGrid[i][j]}></BigGridCell>)
			}
		}

		return cells;

	}

	return <div>
		<h1>9 Gewinnt</h1>

		{
			gamestate == null ?
				<div>
					<div>
						<button onClick={() => onStartGame()}>Start new Game</button>
					</div>

					<div>
						<textarea ref={tkEditor}></textarea><button onClick={() => onEnterGame()}>Enter Game</button>
					</div>


				</div>
				: <div>
					<h2>Currently in Game {gamestate.GameId}</h2>
					<div>Currently moving: {gamestate.CurrentPlayer === pId ? 'You' : 'Enemy'}</div>
					<button>Leave Game</button>
				</div>
		}

		{
			gamestate == null ?
				<div>Join a game</div>
				:
				<div className='game-grid'>
					{renderBigGrid()}
					{renderSmallGrid()}
				</div>
		}
	</div>
}

ReactDOM.render(<AppView></AppView>, document.getElementById("root"));
