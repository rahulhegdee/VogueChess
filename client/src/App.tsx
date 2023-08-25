import { createContext, useEffect, useState } from "react";
import Login from "./Login";
import { Socket, io } from "socket.io-client";
import Home from "./Home";
import { useCookies } from "react-cookie";

export const SocketContext = createContext<Socket>(io());

function App() {
	const [socket, setSocket] = useState<Socket>(io());
	const [isConnected, setIsConnected] = useState(false);
	const [cookies, setCookie] = useCookies(["token"]);
	const [username, setUsername] = useState("");

	useEffect(() => {
		console.log(socket);
		socket.connect();

		socket.on("connect", () => {
			setIsConnected(true);
		});

		socket.on("USERNAME_INFO", (name) => {
			setUsername(name);
		});

		return () => {
			if (socket.connected) {
				setIsConnected(false);
				socket.disconnect();
			}
		};
	}, [socket]);

	useEffect(() => {
		const token = cookies.token;

		if (token != null) {
			const newSocket = io("http://localhost:8080", {
				autoConnect: false,
				auth: { token },
			});

			setSocket(newSocket);
		}
	}, [cookies]);

	return (
		<div>
			{isConnected ? (
				<SocketContext.Provider value={socket}>
					<Home
						username={username}
						setUsername={(u: string) => {
							setUsername(u);
						}}
					/>
				</SocketContext.Provider>
			) : (
				<Login
					setToken={(t) => {
						setCookie("token", t);
					}}
				/>
			)}
		</div>
	);
}

export default App;
