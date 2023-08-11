import { Chessboard } from "react-chessboard";
import {
	PromotionPieceOption,
	Square,
} from "react-chessboard/dist/chessboard/types";
import { useState, useMemo } from "react";
import { Chess } from "chess.js";

function Board() {
	const game = useMemo(() => {
		return new Chess();
	}, []);
	const [selectedSquare, setSelectedSquare] = useState<Square | null>();
	const [possibleMoves, setPossibleMoves] = useState<any[]>();
	const [showPromotionDialog, setShowPromotionDialog] = useState(false);
	const [promotionSquare, setPromotionSquare] = useState<Square | null>();

	function squareSelectionHandler(square: Square) {
		setSelectedSquare(square);
		const moves = game.moves({
			square,
			verbose: true,
		});
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
		}

		setSelectedSquare(null);
		setPromotionSquare(null);
		setShowPromotionDialog(false);
		setPossibleMoves([]);
		return true;
	}

	return (
		<Chessboard
			boardWidth={500}
			onSquareClick={onSquareClick}
			animationDuration={200}
			position={game.fen()}
			promotionToSquare={promotionSquare}
			showPromotionDialog={showPromotionDialog}
			onPromotionPieceSelect={onPromotionPieceSelect}
		/>
	);
}

export default Board;
