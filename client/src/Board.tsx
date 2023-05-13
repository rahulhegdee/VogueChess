import { Chessboard } from "react-chessboard";
import { Piece } from "react-chessboard/dist/chessboard/types";

function Board() {
	function pieceHandler(piece: Piece) {
		console.log(piece);
	}
	return <Chessboard boardWidth={500} onPieceClick={pieceHandler} />;
}

export default Board;
