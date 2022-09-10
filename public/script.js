function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	let name = cname + "=";
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}



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
	const uId = getCookie('userId')

	const [gamestate, setGameState] = useState(null)

	if(uId === ''){
		//  register the client with the server
	}



	const onCellClick = (x, y) => {

	}

	const renderSmallGrid = () => {
		let cells = []

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {

				cells.push(<GridCell x={i} y={j} state={1} onClick={() => onCellClick(i, j)}></GridCell>)
			}
		}

		return cells

	}

	const renderBigGrid = () => {
		let cells = [];

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {

				cells.push(<BigGridCell x={i} y={j} state={2}></BigGridCell>)
			}
		}

		return cells;

	}

	return <div>
		<h1>9 Gewinnt</h1>



		<div className='game-grid'>
			{renderSmallGrid()}
			{renderBigGrid()}
		</div>
	</div>
}

ReactDOM.render(<AppView></AppView>, document.getElementById("root"));
