import { useEffect, useState } from "react";
import Lobby from "./Lobby";
import Board from "./Board";
import { socket, SocketContext } from "./context/socket";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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

	const router = createBrowserRouter([
		{ path: "/", element: <>{isConnected ? <Lobby /> : "Not connected."}</> },
		{ path: "/game", element: <Board /> },
	]);

	return (
		<SocketContext.Provider value={socket}>
			<RouterProvider router={router} />
		</SocketContext.Provider>
	);
}

export default App;
