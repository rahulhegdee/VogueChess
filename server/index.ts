import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { verify } from "./auth";
import { TokenPayload } from "google-auth-library";

const port = process.env.PORT || 8080;
const app = express();
const server = createServer(app);

interface SocketData {
	user: TokenPayload;
}

interface ClientToServerEvents {
	SEND_REQUEST_GAMES: () => void;
	SEND_CREATE_GAME: () => void;
	SEND_JOIN_GAME: (gameId: string) => void;
	SEND_LEAVE_GAME: (gameId: string) => void;
	MAKE_MOVE: (gameInfo: string[2]) => void;
}

interface ServerToClientEvents {
	GAMES_FOUND: (games: { [key: string]: any }) => void;
	UPDATE_GAME: (gameState: any) => void;
}

interface InterServerEvents {}

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

io.on("connection", (socket) => {
	console.log("connected");

	socket.on("SEND_REQUEST_GAMES", () => {
		socket.emit("GAMES_FOUND", games);
	});

	socket.on("SEND_CREATE_GAME", () => {
		games[id] = { players: 0, spectators: 0, state: startPosition };
		id += 1;
		socket.emit("GAMES_FOUND", games);
	});

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
