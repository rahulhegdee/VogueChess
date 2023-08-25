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
		const foundUser = res.rows[0];
		return foundUser != null ? foundUser : { username: "" };
	} catch (err) {
		console.error(err);
	}
}

async function getUserId(username: string) {
	try {
		let res = await pool.query("SELECT UserID FROM users WHERE Username = $1", [
			username,
		]);
		const foundUser = res.rows[0];
		return foundUser;
	} catch (err) {
		console.error(err);
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
			"INSERT INTO games (WhiteUser, BlackUser, TimeControl, Increment, FEN, DateTime) VALUES ($1, $2, $3, $4, $5, to_timestamp($6));",
			[whiteUserId, blackUserId, timeControl, increment, fen, dateTime]
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
			"SELECT fen FROM games WHERE whiteuser = $1 OR blackuser = $1",
			[userId]
		);
		return res.rows[0];
	} catch (err) {
		console.error(err);
	}
}

export { addOrUpdateUser, getUsername, getUserId, addGame, getUserGames };
