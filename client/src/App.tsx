import { createContext, useEffect, useState } from "react";
import Lobby from "./Lobby";
import Board from "./Board";
import Login from "./Login";
import { Socket, io } from "socket.io-client";
import Home from "./Home";

export const SocketContext = createContext<Socket>(io());

function App() {
	const [socket, setSocket] = useState<Socket>(io());
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		console.log(socket);
		socket.connect();

		socket.on("connect", () => {
			setIsConnected(true);
		});

		return () => {
			if (socket.connected) {
				setIsConnected(false);
				socket.disconnect();
			}
		};
	}, [socket]);

	return (
		<div>
			{isConnected ? (
				<SocketContext.Provider value={socket}>
					<Home />
				</SocketContext.Provider>
			) : (
				<Login
					setSocket={(s) => {
						setSocket(s);
					}}
				/>
			)}
		</div>
	);
}

export default App;
