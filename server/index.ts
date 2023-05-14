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
let idsRecieved: Number[] = [];

io.on("connection", (socket) => {
	console.log("connected");

	socket.on("game", (id: Number) => {
		console.log("recieved game");
		if (idsRecieved.includes(id)) {
			setTimeout(() => {
				socket.emit("test");
			}, 10000);
		}

		idsRecieved.push(id);
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
