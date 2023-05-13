import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Board from "./Board";
import JoinButton from "./JoinButton";

const socket = io("http://localhost:8080", { autoConnect: false }); // note: we should change this into a useContext

function App() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [isAccepted, setIsAccepted] = useState(false);
	useEffect(() => {
		if (isPlaying) {
			socket.connect();

			socket.on("connect", () => {
				setIsConnected(true);
			});

			socket.emit("join_game", "ready");

			socket.on("game_status", (arg) => {
				console.log(arg);
			});
		}

		return () => {
			if (socket.connected) {
				socket.disconnect();
				setIsConnected(false);
			}
		};
	}, [isPlaying]);

	const handlePress = () => {
		if (isConnected) {
			socket.emit("newgame", "player1");
		}
	};

	const startPlaying = () => {
		setIsPlaying(true);
	};
	return (
		<div className="App">
			{isConnected ? <Board /> : <JoinButton handleClick={startPlaying} />}
		</div>
	);
}

export default App;
