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
import { getUsername, getUserId, addOrUpdateUser, addGame } from "./database";
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

let id = 0;
const startPosition =
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let games: { [key: string]: any } = {};

io.use(async (socket, next) => {
	const token = socket.handshake.auth.token;
	console.log(token);
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
	socket.data.username = user.username;
	socket.emit("USERNAME_INFO", user.username);

	socket.on("CREATE_USER", (username: string) => {
		if (socket.data.username == "") {
			addOrUpdateUser(socket.data.user.sub, username);
		}
	});

	socket.on("SEND_REQUEST_GAMES", () => {
		socket.emit("GAMES_FOUND", games);
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
			const opponentId = await getUserId(opponent).then((res) => {
				return res.userid;
			});
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

			games[id] = { players: 0, spectators: 0, state: startPosition };
			id += 1;

			addGame(whiteUser, blackUser);
			socket.emit("GAMES_FOUND", games);
		}
	);

	socket.on("SEND_JOIN_GAME", (gameId: string) => {
		if (gameId in games) {
			games[gameId].players === 2
				? (games[gameId].spectators += 1)
				: (games[gameId].players += 1);
			socket.join(`game${gameId}`);
			const gameState = games[gameId].state;
			//necessary if the game is ongoing and the client disconnects and reconnects
			socket.emit("UPDATE_GAME", gameState);
		}
	});

	socket.on("SEND_LEAVE_GAME", (gameId: string) => {
		if (gameId in games) {
			games[gameId].spectators -= 1; //replace with sensible code in the future
			socket.leave(`game${gameId}`);
		}
	});

	socket.on("MAKE_MOVE", (gameInfo: string[2]) => {
		const gameId = gameInfo[0];
		const gameState = gameInfo[1];
		if (gameId in games) {
			games[gameId].state = gameState;
			socket.to(`game${gameId}`).emit("UPDATE_GAME", gameState);
		}
	});

	socket.on("disconnect", () => {
		console.log("disconnected");
	});
});

server.listen(port);
