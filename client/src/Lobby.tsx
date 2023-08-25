import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./App";
import { useNavigate } from "react-router-dom";
import CreateGame from "./CreateGame";
function Lobby() {
	const [games, setGames] = useState<{}>({});
	const [showCreateGame, setShowCreateGame] = useState(false);
	const socket = useContext(SocketContext);
	const navigate = useNavigate();
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

	function joinGame(id: string) {
		navigate(`/game/${id}`);
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
			<button onClick={() => setShowCreateGame(!showCreateGame)}>
				Create Game
			</button>
			{showCreateGame && <CreateGame />}
		</div>
	);
}

export default Lobby;
