import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./App";
import { Link } from "react-router-dom";
import CreateGame from "./CreateGame";
import { GameData } from "./utils/types";
function Lobby() {
	const [games, setGames] = useState<GameData[]>([]);
	const [showCreateGame, setShowCreateGame] = useState(false);
	const socket = useContext(SocketContext);
	useEffect(() => {
		function displayGames(data: []) {
			setGames(data);
		}

		socket.emit("REQUEST_GAMES");
		socket.on("GAMES_FOUND", displayGames);

		return () => {
			socket.off("GAMES_FOUND", displayGames);
		};
	}, [socket]);

	return (
		<div>
			{Object.keys(games).length > 0 ? (
				<div>
					{games.map((game) => {
						return (
							<Link
								to={`/game/${game.whiteuser},${game.datetime}`}
								key={`${game.whiteuser},${game.datetime}`}
							>
								{`${game.white_username} vs. ${game.black_username}`}
							</Link>
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
