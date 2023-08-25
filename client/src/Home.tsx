import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Lobby from "./Lobby";
import Board from "./Board";
import CreateUser from "./CreateUser";

type HomeProps = {
	username: string;
	setUsername: (u: string) => void;
};

function Home({ username, setUsername }: HomeProps) {
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

	return username !== "" ? (
		<RouterProvider router={router} />
	) : (
		<CreateUser setUsername={setUsername} />
	);
}

export default Home;
