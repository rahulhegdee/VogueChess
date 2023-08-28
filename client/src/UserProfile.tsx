import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SocketContext } from "./App";
import { GameData } from "./utils/types";

function UserProfile() {
	const path = useLocation();
	const username = useMemo(() => {
		return path.pathname.substring(3);
	}, [path]);
	const socket = useContext(SocketContext);
	const [games, setGames] = useState<GameData[]>([]);

	useEffect(() => {
		function displayGames(data: []) {
			setGames(data);
		}

		socket.emit("REQUEST_GAMES", username);
		socket.on("GAMES_FOUND", displayGames);

		return () => {
			socket.off("GAMES_FOUND", displayGames);
		};
	}, [socket, username]);

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
			;
		</div>
	);
}

export default UserProfile;
