import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./App";
import { Link } from "react-router-dom";
import CreateGame from "./CreateGame";
function Lobby() {
	const [games, setGames] = useState<
		{ whiteuser: string; blackuser: string; fen: string; datetime: any }[]
	>([]);
	const [showCreateGame, setShowCreateGame] = useState(false);
	const socket = useContext(SocketContext);
	useEffect(() => {
		function displayGames(data: []) {
			console.log(data);
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
								{`${game.whiteuser} vs. ${game.blackuser}`}
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
