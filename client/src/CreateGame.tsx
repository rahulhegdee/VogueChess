import { FormEvent, useState, useContext } from "react";
import { SocketContext } from "./App";

function CreateGame() {
	const socket = useContext(SocketContext);
	const [opponent, setOpponent] = useState("");
	const [userColor, setUserColor] = useState("random");

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		socket.emit("CREATE_GAME", { opponent, userColor });
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Opponent Username:
				<input
					type="text"
					value={opponent}
					name="opponent"
					onChange={(e) => setOpponent(e.target.value)}
				/>
			</label>
			<label>
				User Color:
				<select
					value={userColor}
					name="userColor"
					onChange={(e) => setUserColor(e.target.value)}
				>
					<option value="white">White</option>
					<option value="black">Black</option>
					<option value="random">Random</option>
				</select>
			</label>
			<input type="submit" value="Submit" />
		</form>
	);
}

export default CreateGame;
