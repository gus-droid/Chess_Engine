let game = new Chess();
let board = null;
let userColor = 'w'; // Default to White
let promotionPiece = 'q'; // Default to Queen for promotion

// Initialize the chessboard
function initializeBoard() {
  const config = {
    draggable: true,
    dropOffBoard: 'snapback', // Pieces returned to original positions if dropped off the board
    sparePieces: true,
    position: 'start', // The starting position for the chessboard
    orientation: userColor === 'w' ? 'white' : 'black', // Set orientation based on user color
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  };

  board = Chessboard('myBoard', config);
  game.reset();
  if (userColor === 'b') {
    window.setTimeout(makeRandomMove, 250); // If user plays as black, computer moves first
  }
}

// Function to handle piece drag start (prevents dragging after game over or on opponent's pieces)
function onDragStart (source, piece, position, orientation) {
  // Do not pick up pieces if the game is over
  if (game.isGameOver()) return false;

  // Only allow the player to move their own pieces (White pieces for user)
  if ((userColor === 'w' && piece.search(/^b/) !== -1) || (userColor === 'b' && piece.search(/^w/) !== -1)) {
    return false; // Don't allow the user to drag opponent's pieces
  }
}

// Handle when a piece is dropped
function onDrop(source, target) {
  // If the source and target squares are the same, the piece is just being "unclicked" and returned to its original position
  if (source === target) {
    return; // Don't move the piece if it was dropped back in the same place
  }

  // Perform the move
  var move = game.move({
    from: source,
    to: target,
    promotion: promotionPiece // Use the selected promotion piece
  });

  // If the move is invalid, return the piece to its original position
  if (move === null) {
    return 'snapback'; // Invalid move, snap it back
  }

  // Check for game over
  if (game.isGameOver()) {
    updateGameResult();
  } else {
    // After the player's move, make a random move for the computer
    window.setTimeout(makeRandomMove, 250);
  }
}

// Promotion options when pawn reaches the last rank
function showPromotionOptions(square) {
  const rank = square.charAt(1); // Extract the rank (second character of the square)
  const piece = game.get(square).type; // Get the piece type at the square

  if (piece === 'p' && (rank === '8' || rank === '1')) {
    // Show the promotion UI for the user
    const promotionContainer = document.getElementById('promotion-container');
    promotionContainer.style.display = 'block';
    promotionContainer.setAttribute('data-square', square); // Store the square for later use
  }
}

// Handle promotion piece selection
document.getElementById('promotion-options').addEventListener('change', function (event) {
  promotionPiece = event.target.value;
  document.getElementById('promotion-container').style.display = 'none'; // Hide promotion options after selection
  const square = document.getElementById('promotion-container').getAttribute('data-square');
  // Complete the move with the selected promotion piece
  game.move({ from: square, to: square, promotion: promotionPiece });
  board.position(game.fen());
  if (game.isGameOver()) {
    updateGameResult();
  } else {
    window.setTimeout(makeRandomMove, 250); // Make random move for AI after user's turn
  }
});

// Make a random move for the opponent (AI)
function makeRandomMove() {
  const possibleMoves = game.moves();

  // If there are no moves, the game is over
  if (possibleMoves.length === 0) return;

  const randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen()); // Update board with the new move
}

// Update the board after a move or promotion
function onSnapEnd() {
  board.position(game.fen());
  // If promotion happens, show the promotion options
  showPromotionOptions(game.history({ verbose: true }).pop().to);
}

// Handle mouseover on a square (highlight the square)
function onMouseoverSquare(square) {
  const moves = game.moves({ square: square, verbose: true });
  renderMoveHistory(moves);
}

// Handle mouseout from a square (reset highlighting)
function onMouseoutSquare(square) {
  renderMoveHistory([]);
}

// Update the game result message
function updateGameResult() {
  const resultElement = document.getElementById('game-result');
  if (game.isCheckmate()) {
    resultElement.innerText = `${game.turn() === 'w' ? 'Black' : 'White'} Wins by Checkmate`;
  } else if (game.isStalemate()) {
    resultElement.innerText = 'Draw by Stalemate';
  } else if (game.isInsufficientMaterial()) {
    resultElement.innerText = 'Draw by Insufficient Material';
  } else if (game.isDraw()) {
    resultElement.innerText = 'Draw by 50-move Rule';
  } else if (game.isThreefoldRepetition()) {
    resultElement.innerText = 'Draw by Threefold Repetition';
  }
}

// Initialize the chessboard with color selection
document.getElementById('white-button').addEventListener('click', () => {
  userColor = 'w';
  initializeBoard();
});

document.getElementById('black-button').addEventListener('click', () => {
  userColor = 'b';
  initializeBoard();
});
