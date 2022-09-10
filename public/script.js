function GridCell({ state, onClick, x, y }) {
  let sign = "";
  if (state == 1) {
    sign = "X";
  } else if (state == 2) {
    sign = "ㅇ";
  }

  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: x + 1 + "/" + (x + 1),
        gridRow: y + 1 + "/" + (y + 1),
      }}
    >
      {sign}
      </button>
  );
}

function AppView() {
  
  var socket = io()
  
  
  
  return <h1>Hello from AppView</h1>;
}

ReactDOM.render(<AppView></AppView>, document.getElementById("root"));
