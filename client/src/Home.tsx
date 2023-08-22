import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Lobby from "./Lobby";
import Board from "./Board";

function Home() {
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

	return <RouterProvider router={router} />;
}

export default Home;
