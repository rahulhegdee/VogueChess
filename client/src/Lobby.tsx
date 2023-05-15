import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./context/socket";
function Lobby() {
	const [games, setGames] = useState<{}>({});
	const socket = useContext(SocketContext);
	useEffect(() => {
		function displayGames(data: {}) {
			console.log(data);
			setGames(data);
		}

		socket.emit("SEND_REQUEST_GAMES");
		socket.on("GAMES_FOUND", displayGames);

		return () => {
			socket.off("GAMES_FOUND", displayGames);
		};
	}, [socket]);

	function createGame() {
		// add the ability to set time control, color, game type, etc. here
		socket.emit("SEND_CREATE_GAME");
	}

	function joinGame(id: string) {
		socket.emit("SEND_JOIN_GAME", id);
	}

	return (
		<div>
			{Object.keys(games).length > 0 ? (
				<div>
					{Object.keys(games).map((game) => {
						return (
							<button key={game} onClick={() => joinGame(game)}>
								{game}
							</button>
						);
					})}
				</div>
			) : (
				<p>No Games.</p>
			)}
			<button onClick={createGame}>Create Game</button>
		</div>
	);
}

export default Lobby;
