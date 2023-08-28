import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Lobby from "./Lobby";
import Board from "./Board";
import CreateUser from "./CreateUser";
import { UserContext } from "./App";
import { useContext } from "react";

type HomeProps = {
	setUsername: (u: string) => void;
};

function Home({ setUsername }: HomeProps) {
	const username = useContext(UserContext);
	const router = createBrowserRouter([
		{
			path: "/",
			element: <Lobby />,
		},
		{
			path: "/lobby",
			element: <Lobby />,
		},
		{ path: "/game/:gameID", element: <Board /> },
	]);

	return username !== "" && username != null ? (
		<RouterProvider router={router} />
	) : (
		<CreateUser setUsername={setUsername} />
	);
}

export default Home;
