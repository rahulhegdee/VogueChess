import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Board from "./Board";
const socket = io("http://localhost:8080", { autoConnect: false }); // note: we should change this into a useContext

function App() {
	const [isConnected, setIsConnected] = useState(false);
	useEffect(() => {
		socket.connect();

		socket.on("connect", () => {
			setIsConnected(true);
		});

		socket.on("disconnect", () => {
			setIsConnected(false);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handlePress = () => {
		if (isConnected) {
			socket.emit("newgame", "player1");
		}
	};
	return (
		<div className="App">
			{isConnected && <button onClick={handlePress} />}
			<Board />
		</div>
	);
}

export default App;
