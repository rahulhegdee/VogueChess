import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { useState } from "react";
import { Chess } from "chess.js";

function Board() {
	const [game, setGame] = useState<any>(new Chess());
	const [moveFrom, setMoveFrom] = useState<Square | null>();
	const [moveTo, setMoveTo] = useState<Square | null>();
	const [showPromotionDialog, setShowPromotionDialog] = useState(false);
	const [rightClickedSquares, setRightClickedSquares] = useState<any>({}); // FIX: add actual type
	const [moveSquares, setMoveSquares] = useState({});
	const [optionSquares, setOptionSquares] = useState({});

	function pieceHandler(piece: any) {
		console.log(piece);
	}

	function getMoveOptions(square: Square) {
		const moves = game.moves({
			square,
			verbose: true,
		});
		if (moves.length === 0) {
			setOptionSquares({});
			return false;
		}

		const newSquares: any = {};
		moves.map((move: any) => {
			newSquares[move.to] = {
				background:
					game.get(move.to) &&
					game.get(move.to).color !== game.get(square).color
						? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
						: "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
				borderRadius: "50%",
			};
			return move;
		});
		newSquares[square] = {
			background: "rgba(255, 255, 0, 0.4)",
		};
		setOptionSquares(newSquares);
		return true;
	}

	function onSquareClick(square: Square) {
		setRightClickedSquares({});

		// from square
		if (moveFrom == null) {
			const hasMoveOptions = getMoveOptions(square);
			if (hasMoveOptions) setMoveFrom(square);
			return;
		}

		// to square
		if (moveTo == null) {
			// check if valid move before showing dialog
			const moves =
				moveFrom == null
					? []
					: game.moves({
							square: moveFrom,
							verbose: true,
					  });
			const foundMove = moves.find(
				(m: any) => m.from === moveFrom && m.to === square
			);
			// not a valid move
			if (!foundMove) {
				// check if clicked on new piece
				const hasMoveOptions = getMoveOptions(square);
				// if new piece, setMoveFrom, otherwise clear moveFrom
				setMoveFrom(hasMoveOptions ? square : null);
				return;
			}

			// valid move
			setMoveTo(square);

			// if promotion move
			if (
				(foundMove.color === "w" &&
					foundMove.piece === "p" &&
					square[1] === "8") ||
				(foundMove.color === "b" &&
					foundMove.piece === "p" &&
					square[1] === "1")
			) {
				setShowPromotionDialog(true);
				return;
			}

			// is normal move
			const gameCopy = { ...game };
			const move = gameCopy.move({
				from: moveFrom,
				to: square,
				promotion: "q",
			});

			// if invalid, setMoveFrom and getMoveOptions
			if (move === null) {
				const hasMoveOptions = getMoveOptions(square);
				if (hasMoveOptions) setMoveFrom(square);
				return;
			}

			setGame(gameCopy);

			setMoveFrom(null);
			setMoveTo(null);
			setOptionSquares({});
			return;
		}
	}

	function onSquareRightClick(square: Square) {
		const colour = "rgba(0, 0, 255, 0.4)";
		setRightClickedSquares({
			...rightClickedSquares,
			[square]:
				rightClickedSquares[square] &&
				rightClickedSquares[square].backgroundColor === colour
					? undefined
					: { backgroundColor: colour },
		});
	}

	return (
		<Chessboard
			boardWidth={500}
			onPieceClick={pieceHandler}
			animationDuration={200}
			// arePiecesDraggable={true}
			position={game.fen()}
			onSquareClick={onSquareClick}
			onSquareRightClick={onSquareRightClick}
			// onPromotionPieceSelect={onPromotionPieceSelect}
			// customBoardStyle={{
			// 	borderRadius: "4px",
			// 	boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
			// }}
			customSquareStyles={{
				...moveSquares,
				...optionSquares,
				...rightClickedSquares,
			}}
			promotionToSquare={moveTo}
			showPromotionDialog={showPromotionDialog}
		/>
	);
}

export default Board;
