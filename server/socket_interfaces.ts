import { TokenPayload } from "google-auth-library";

export interface SocketData {
	user: TokenPayload;
}

export interface ClientToServerEvents {
	SEND_REQUEST_GAMES: () => void;
	SEND_CREATE_GAME: () => void;
	SEND_JOIN_GAME: (gameId: string) => void;
	SEND_LEAVE_GAME: (gameId: string) => void;
	MAKE_MOVE: (gameInfo: string[2]) => void;
}

export interface ServerToClientEvents {
	GAMES_FOUND: (games: { [key: string]: any }) => void;
	UPDATE_GAME: (gameState: any) => void;
}

export interface InterServerEvents {}
