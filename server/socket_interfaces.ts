import { TokenPayload } from "google-auth-library";
import { ColorOptions } from "./types";

export interface SocketData {
	user: TokenPayload;
	username: string;
}

export interface ClientToServerEvents {
	REQUEST_GAMES: (username?: string) => void;
	CREATE_GAME: ({
		opponent,
		userColor,
	}: {
		opponent: string;
		userColor: ColorOptions;
	}) => void;
	SEND_JOIN_GAME: (gameId: string) => void;
	SEND_LEAVE_GAME: (gameId: string) => void;
	MAKE_MOVE: (gameInfo: string[2]) => void;
	CREATE_USER: (username: string) => void;
}

export interface ServerToClientEvents {
	GAME_INFO: (gameInfo: any) => void;
	GAMES_FOUND: (games: any) => void;
	UPDATE_GAME: (gameState: any) => void;
	USERNAME_INFO: (user: string) => void;
}

export interface InterServerEvents {}
