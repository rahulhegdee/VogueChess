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

let playerCount = 0;

io.on("connection", (socket) => {
	console.log("connected");

	socket.on("newgame", (arg) => {
		console.log(arg);
	});

	socket.on("join_game", (arg) => {
		console.log(arg);
		socket.emit("game_status", playerCount === 2 ? "full" : "joined");
		if (playerCount !== 2) {
			playerCount += 1;
		}
	});

	socket.on("disconnect", () => {
		console.log("disconnected");
	});
});

server.listen(port);
