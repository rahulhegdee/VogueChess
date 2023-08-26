import postgres from "pg";
import dotenv from "dotenv";
import { ChessColors } from "./types";
dotenv.config();

const { Pool } = postgres;
const pool = new Pool({
	user: process.env.DB_USERNAME,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: 5432,
	host: "localhost",
});

async function addOrUpdateUser(
	userId: string,
	username: string,
	password?: string
) {
	try {
		if (password != null) {
			await pool.query(
				"INSERT INTO users (UserID, Username, Password) VALUES ($1, $2, $3) ON CONFLICT (UserID) DO UPDATE SET Username = $2, Password = $3;",
				[userId, username, password]
			);
		} else {
			await pool.query(
				"INSERT INTO users (UserID, Username) VALUES ($1, $2) ON CONFLICT (UserID) DO UPDATE SET Username = $2;",
				[userId, username]
			);
		}
	} catch (err) {
		console.error(err);
	}
}

async function getUsername(userId: string) {
	try {
		let res = await pool.query("SELECT Username FROM users WHERE UserID = $1", [
			userId,
		]);
		const foundUser = res.rows[0].username;
		return foundUser;
	} catch (err) {
		console.error(err);
		return "";
	}
}

async function getUserId(username: string) {
	try {
		let res = await pool.query("SELECT UserID FROM users WHERE Username = $1", [
			username,
		]);
		const foundUser = res.rows[0].userid;
		return foundUser;
	} catch (err) {
		console.error(err);
		return "";
	}
}

async function addGame(
	whiteUserId: string,
	blackUserId: string,
	timeControl?: number,
	increment?: number
) {
	const dateTime = Date.now();
	const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
	try {
		let res = await pool.query(
			"INSERT INTO games (WhiteUser, BlackUser, TimeControl, Increment, FEN, DateTime) VALUES ($1, $2, $3, $4, $5, DATE_TRUNC('second', CURRENT_TIMESTAMP));",
			[whiteUserId, blackUserId, timeControl, increment, fen]
		);
	} catch (err) {
		console.error(err);
	}
}

async function getUserGames(
	userId: string,
	userColor?: ChessColors,
	isComplete?: boolean,
	winner?: boolean
) {
	try {
		let res = await pool.query(
			"SELECT * FROM games WHERE whiteuser = $1 OR blackuser = $1",
			[userId]
		);
		return res.rows;
	} catch (err) {
		console.error(err);
	}
}

function convertGameIdForDB(gameId: string) {
	const dateTimeStartIndex = gameId.indexOf(",");
	if (dateTimeStartIndex === -1) {
		return ["", null];
	}
	const whiteUser = gameId.substring(0, dateTimeStartIndex);
	const dateTimeOne = new Date(
		gameId.substring(dateTimeStartIndex + 1)
	).toLocaleString();
	console.log(dateTimeOne);
	const dateTime = gameId.substring(dateTimeStartIndex + 1).replace("T", " ");
	return [whiteUser, dateTime];
}

async function getGame(gameId: string) {
	const [whiteUser, dateTime] = convertGameIdForDB(gameId);
	if (whiteUser === "") {
		return { error: "Game not found." };
	}
	console.log(dateTime);
	try {
		let res = await pool.query(
			"SELECT * FROM games WHERE datetime = $1::timestamp(0)",
			[dateTime]
		);
		console.log(res);
		if (res.rowCount === 0) {
			return { error: "Game not found." };
		}
		return res.rows[0];
	} catch (err) {
		console.error(err);
		return { error: "Game not found." };
	}
}

async function updateGame(gameId: string, fen: string) {
	const [whiteUser, dateTime] = convertGameIdForDB(gameId);
	if (whiteUser === "") {
		return;
	}
	try {
		let res = await pool.query(
			"UPDATE games SET fen = $3 WHERE whiteuser = $1 AND datetime = $2",
			[whiteUser, dateTime, fen]
		);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export {
	addOrUpdateUser,
	getUsername,
	getUserId,
	addGame,
	getUserGames,
	updateGame,
	getGame,
};
