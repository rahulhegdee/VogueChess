import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const port = process.env.PORT || 8080;
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
	},
});

let id = 0;
let games: { [key: string]: any } = {};

io.on("connection", (socket) => {
	console.log("connected");

	socket.on("SEND_REQUEST_GAMES", () => {
		socket.emit("GAMES_FOUND", games);
	});

	socket.on("SEND_CREATE_GAME", () => {
		games[id] = { players: 0, spectators: 0 };
		id += 1;
		socket.emit("GAMES_FOUND", games);
	});

	socket.on("SEND_JOIN_GAME", (gameId: string) => {
		if (gameId in games) {
			games[gameId].players === 2
				? (games[gameId].spectators += 1)
				: (games[gameId].players += 1);
			socket.join(`game${gameId}`);
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
