import { useEffect, useState } from "react";
import Lobby from "./Lobby";
import { socket, SocketContext } from "./context/socket";

function App() {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		socket.connect();

		socket.on("connect", () => {
			setIsConnected(true);
		});

		return () => {
			setIsConnected(false);
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, []);

	return (
		<SocketContext.Provider value={socket}>
			{isConnected ? <Lobby /> : "Not connected."}
		</SocketContext.Provider>
	);
}

export default App;
