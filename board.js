// Configuration for Chessboard.js
var config = {
  pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',  // pieces png
  position: 'start',  // Set initial position
  draggable: true,  // Make pieces draggable and drop off when taken
  dropOffBoard: 'snapback', // 
  showNotation: true,
  onDrop: handleMove  // Trigger move when piece is dropped
};

// Create chess board with config settings
var board = Chessboard('myBoard', config);

// Initialize chess.js game engine
const chess = new Chess();

// Update the board position based on chess.js game state
function updateBoard() {
  board.position(chess.fen());  // Update board position using FEN string
}

// Move Logic 
function handleMove(source, target) {
  if (!selectedSquare) {
    // Only allow moving your own piece
    if ((chess.turn() === 'w' && chess.get(source).color !== 'w') ||
        (chess.turn() === 'b' && chess.get(source).color !== 'b')) {
      return 'snapback';  // If trying to move the opponent's piece, don't allow the move
    }
    
    selectedSquare = source;  // Store the square of the selected piece
    return 'drag';  // Allow dragging the piece
  }

  // If the same square is clicked again, cancel the move (unclick the piece)
  if (source === selectedSquare) {
    selectedSquare = null;  // Unselect the piece
    return 'snapback';  // Return the piece to its original position
  }

  // Attempt to make the move in the chess.js game engine
  const move = chess.move({ from: source, to: target });

  // If the move is invalid (null), snap the piece back to its original position
  if (move === null) {
    selectedSquare = null;  // Reset the selected square
    return 'snapback';  // If move is invalid, snap piece back
  }

  // If the move is valid, update the board
  updateBoard();
  selectedSquare = null;  // Reset selected square after a valid move

  // Allow further moves after a valid one
  return 'snapback';
}

// // Function to automatically play the game using chess.js
// function playGame() {
//   while (!chess.isGameOver()) {
//     const moves = chess.legalMoves();
//     const move = moves[Math.floor(Math.random() * moves.length)];
//     chess.move(move);
//     updateBoard();  // Update the chessboard after each move
//   }
//   console.log(chess.pgn());  // Output the final game in PGN format
// }

// Start the chessboard with the initial position
updateBoard();  // Display the starting position
