import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { verify } from "./auth";
import {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData,
} from "./socket_interfaces";
import {
	getUsername,
	getUserId,
	addOrUpdateUser,
	addGame,
	getUserGames,
	updateGame,
	getGame,
} from "./database";
import { ColorOptions } from "./types";

const port = process.env.PORT || 8080;
const app = express();
const server = createServer(app);

const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(server, {
	cors: {
		origin: "http://localhost:3000",
	},
});

let games: { [key: string]: any } = {};

io.use(async (socket, next) => {
	const token = socket.handshake.auth.token;
	const verification = await verify(token);
	if (verification.user != null && verification?.error == null) {
		socket.data.user = verification.user;
		next();
	} else {
		next(new Error(verification.error));
	}
});

io.on("connection", async (socket) => {
	console.log("connected");

	const user = await getUsername(socket.data.user.sub);
	socket.data.username = user;
	socket.emit("USERNAME_INFO", user);

	socket.on("CREATE_USER", (username: string) => {
		if (socket.data.username == "") {
			addOrUpdateUser(socket.data.user.sub, username);
		}
	});

	socket.on("REQUEST_GAMES", async (username?: string) => {
		let userId = socket.data.user.sub;
		if (username != null) {
			userId = await getUserId(username);
		}
		const res = await getUserGames(userId);
		socket.emit("GAMES_FOUND", res);
	});

	socket.on(
		"CREATE_GAME",
		async ({
			opponent,
			userColor,
		}: {
			opponent: string;
			userColor: ColorOptions;
		}) => {
			if (opponent === "" || opponent === socket.data.username) {
				return;
			}

			const opponentId = await getUserId(opponent);
			if (opponentId === "") {
				return;
			}

			let whiteUser = socket.data.user.sub;
			let blackUser = opponentId;
			const randColor = Math.floor(Math.random() * 2);
			if (
				userColor === "black" ||
				(userColor === "random" && randColor === 1)
			) {
				whiteUser = opponentId;
				blackUser = socket.data.user.sub;
			}

			addGame(whiteUser, blackUser);

			const res = await getUserGames(socket.data.user.sub);
			socket.emit("GAMES_FOUND", res);
		}
	);

	socket.on("SEND_JOIN_GAME", async (gameId: string) => {
		const res = await getGame(gameId);
		if (res.error == null) {
			socket.join(`game${gameId}`);
			//necessary if the game is ongoing and the client disconnects and reconnects
			socket.emit("GAME_INFO", res);
		}
	});

	socket.on("SEND_LEAVE_GAME", (gameId: string) => {
		if (gameId in games) {
			games[gameId].spectators -= 1; //replace with sensible code in the future
			socket.leave(`game${gameId}`);
		}
	});

	socket.on("MAKE_MOVE", async (gameInfo: string[2]) => {
		const gameId = gameInfo[0];
		const gameState = gameInfo[1];
		const isGameUpdated = await updateGame(gameId, gameState);
		if (isGameUpdated === true) {
			socket.to(`game${gameId}`).emit("UPDATE_GAME", gameState);
		}
	});

	socket.on("disconnect", () => {
		console.log("disconnected");
	});
});

server.listen(port);
