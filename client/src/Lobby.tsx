import { useContext, useEffect } from "react";
import { SocketContext } from "./context/socket";
function Lobby() {
	const socket = useContext(SocketContext);
	useEffect(() => {
		socket.emit("game", 1);
		socket.on("test", () => {
			console.log("recieved test");
		});

		return () => {
			socket.off("test");
		};
	}, [socket]);
	return <div>"No Games."</div>;
}

export default Lobby;
