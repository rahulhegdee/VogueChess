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

io.on("connection", (socket) => {
	console.log("connected");
	socket.on("newgame", (arg) => {
		console.log(arg);
	});
	socket.on("disconnect", () => {
		console.log("disconnected");
	});
});

server.listen(port);
