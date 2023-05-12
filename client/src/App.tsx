import React from "react";
import { io } from "socket.io-client";

function App() {
	const socket = io("http://localhost:8080");
	socket.on("connect", () => {
		console.log(socket.id);
	});

	socket.on("disconnect", () => {
		console.log(socket.id);
	});

	const handlePress = () => {
		socket.emit("newgame", "player1");
	};
	return (
		<div className="App">
			<button onClick={handlePress} />
		</div>
	);
}

export default App;
