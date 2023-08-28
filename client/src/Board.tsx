import { Chessboard } from "react-chessboard";
import {
	PromotionPieceOption,
	Square,
} from "react-chessboard/dist/chessboard/types";
import { useState, useMemo, useEffect, useContext, useCallback } from "react";
import { Chess } from "chess.js";
import { SocketContext } from "./App";
import { useLocation } from "react-router-dom";
import { GameInfo } from "./utils/types";
import { UserContext } from "./App";

function Board() {
	const path = useLocation();
	const gameId = useMemo(() => {
		return path.pathname.substring(6);
	}, [path]);
	const socket = useContext(SocketContext);
	const username = useContext(UserContext);
	const [selectedSquare, setSelectedSquare] = useState<Square | null>();
	const [possibleMoves, setPossibleMoves] = useState<any[]>();
	const [showPromotionDialog, setShowPromotionDialog] = useState(false);
	const [promotionSquare, setPromotionSquare] = useState<Square | null>();
	const [animationDuration, setAnimationDuration] = useState<number>(0);
	const [isInitialUpdate, setIsInitialUpdate] = useState<boolean>(true);
	const [game, setGame] = useState<Chess>(new Chess());
	const [gameInfo, setGameInfo] = useState<GameInfo>();

	const updateGame = useCallback((modifier?: (g: Chess) => void) => {
		setGame((prevGame) => {
			const newState = new Chess(prevGame.fen());
			if (modifier != null) {
				modifier(newState);
			}
			return newState;
		});
	}, []);

	const loadGameState = useCallback(
		(newState: string) => {
			updateGame((g: Chess) => {
				g.load(newState);
			});

			// If this is the initial update, set animationDuration to 0
			if (isInitialUpdate) {
				setAnimationDuration(0);
				setIsInitialUpdate(false); // Set it to false after the initial update
			} else {
				setAnimationDuration(250);
			}
		},
		[isInitialUpdate, updateGame]
	);

	useEffect(() => {
		function addGameInfo(gameInfo: GameInfo) {
			setGameInfo(gameInfo);
			loadGameState(gameInfo.fen);
		}

		socket.emit("SEND_JOIN_GAME", gameId);
		socket.on("GAME_INFO", addGameInfo);

		return () => {
			socket.emit("SEND_LEAVE_GAME", gameId);
			socket.off("GAME_INFO", addGameInfo);
		};
	}, [socket, gameId, loadGameState]);

	useEffect(() => {
		socket.on("UPDATE_GAME", loadGameState);

		return () => {
			socket.off("UPDATE_GAME", loadGameState);
		};
	}, [socket, isInitialUpdate, loadGameState]);

	function squareSelectionHandler(square: Square) {
		setSelectedSquare(square);
		const color = username === gameInfo?.white ? "w" : "b";
		const moves = game
			.moves({
				square,
				verbose: true,
			})
			.filter((move) => move.color === color);
		setPossibleMoves(moves);
	}

	function onSquareClick(square: Square) {
		if (selectedSquare == null) {
			squareSelectionHandler(square);
			return;
		}

		if (possibleMoves?.find((move) => move.to === square)) {
			const pieceInfo = game.get(selectedSquare);
			// if promotion move
			if (
				(pieceInfo.color === "w" &&
					pieceInfo.type === "p" &&
					square[1] === "8") ||
				(pieceInfo.color === "b" && pieceInfo.type === "p" && square[1] === "1")
			) {
				setPromotionSquare(square);
				setShowPromotionDialog(true);
				return;
			}

			game.move({ from: selectedSquare, to: square });
			updateGame(() => {
				if (animationDuration === 0) {
					setAnimationDuration(250);
				}
			});
			socket.emit("MAKE_MOVE", [gameId, game.fen()]);

			setSelectedSquare(null);
			setPossibleMoves([]);
		} else {
			squareSelectionHandler(square);
		}
	}

	function onPromotionPieceSelect(piece: PromotionPieceOption | undefined) {
		// if no piece passed then user has cancelled dialog, don't make move and reset
		if (piece && selectedSquare != null && promotionSquare != null) {
			game.move({
				from: selectedSquare,
				to: promotionSquare,
				promotion: piece[1].toLowerCase() ?? "q",
			});
			updateGame(() => {
				if (animationDuration === 0) {
					setAnimationDuration(250);
				}
			});
			socket.emit("MAKE_MOVE", [gameId, game.fen()]);
		}

		setSelectedSquare(null);
		setPromotionSquare(null);
		setShowPromotionDialog(false);
		setPossibleMoves([]);
		return true;
	}

	return (
		<div>
			{gameInfo == null ? (
				<p>Loading...</p>
			) : (
				<Chessboard
					boardWidth={500}
					onSquareClick={onSquareClick}
					animationDuration={animationDuration}
					position={game.fen()}
					promotionToSquare={promotionSquare}
					showPromotionDialog={showPromotionDialog}
					onPromotionPieceSelect={onPromotionPieceSelect}
				/>
			)}
		</div>
	);
}

export default Board;
