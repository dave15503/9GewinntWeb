
const { useState, useRef } = React

function GridCell({ state, onClick, x, y }) {
	let sign = "";
	if (state == 1) {
		sign = (<svg height='28' width='28'>
			<line x1='0' y1='0' x2='28' y2='28' stroke='black' stroke-width='1'></line>
			<line x1='28' y1='0' x2='0' y2='28' stroke='black' stroke-width='1'></line>
		</svg>);// x
	} else if (state == 2) {
		sign = (<svg height='28' width='28'>
			<circle cx='14' cy='14' r='10' fill='transparent' stroke='black' stroke-width='1'></circle>
		</svg>);// o
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

function BigGridCell({ x, y, state, isForcing }) {

	let sign = "";
	if (state == 1) {
		sign = (<svg height='86' width='86'>
			<line x1='0' y1='0' x2='86' y2='86' stroke='black' stroke-width='5'></line>
			<line x1='86' y1='0' x2='0' y2='86' stroke='black' stroke-width='5'></line>
		</svg>);// x
	} else if (state == 2) {
		sign = (<svg height='86' width='86'>
			<circle cx='43' cy='43' r='40' fill='transparent' stroke='black' stroke-width='5'></circle>
		</svg>);// o
	}

	const startCellX = (3 * x) + 1
	const startCellY = (3 * y) + 1

	return (<div
		className={'big-cell ' + (isForcing ? ' highlighted' : '')}
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

				cells.push(<GridCell x={i} y={j}  state={gamestate.gameGrid[i][j]} onClick={() => onCellClick(i, j)}></GridCell>)
			}
		}

		return cells

	}

	const renderBigGrid = () => {
		let cells = [];

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				let allowed = gamestate.CurrentPlayer === pId &&(gamestate.forceBigCell === null || (gamestate.forceBigCell[0] === i && gamestate.forceBigCell[1] === j))

				cells.push(<BigGridCell x={i} y={j} isForcing={allowed} state={gamestate.bigGrid[i][j]}></BigGridCell>)
			}
		}

		return cells;

	}

	const leaveGame = () => {
		console.log('Leave called')
		let payload = { pId: pId, gameId: gamestate.GameId }
		socket.emit('leave-game', JSON.stringify(payload))
	}

	return <div className='main-view'>
		<h1 id='headline'>9 Gewinnt</h1>

		{
			gamestate == null ?
				<React.Fragment>
					<button onClick={() => onStartGame()}>Start new Game</button>

					<div className="enter-form">
						<textarea ref={tkEditor} spellCheck="false" placeholder='enter GameId...'></textarea>
						<button onClick={() => onEnterGame()}>Enter Game</button>
					</div>

				</React.Fragment>
				: <React.Fragment>
					<h2>Currently in Game {gamestate.GameId}</h2>
					<span className='horizontal-line'></span>
					{
						gamestate.Player1 === -1 ? <React.Fragment>
							<div>
								Waiting for Player to join
							</div>
							<button>
								Let the AI take over. (Not implemented yet)
							</button>
						</React.Fragment>
						: ''
					}
					<span className='horizontal-line'></span>
					{
						gamestate.Winner > 0 ? <div>
							Game Over; Winner: {gamestate.Winner === 1 ? "X" :"◯"}
						</div> : <div>
							Game in Progress
						</div>
					}
					<div>Currently moving: {gamestate.CurrentPlayer === pId ? 'You' : 'Enemy'}</div>
					<button onClick={() => leaveGame()}>Leave Game</button>
					<span className='horizontal-line'></span>
				</React.Fragment>
		}

		{
			gamestate == null ?
				''
				:
				<div className='game-grid'>
					{renderBigGrid()}
					{renderSmallGrid()}
				</div>
		}
	</div>
}

ReactDOM.render(<AppView></AppView>, document.getElementById("root"));
