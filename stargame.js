var playerRed = "R";
var playerYellow = "Y";
var currentPlayer = playerRed;

var gameOver = false;
var board;

var row = 6;
var column = 7;
var currColumn;

var restartBtn = document.getElementById("restartBtn");


window.onload = function(){
    setGame();
}

function setGame(){
    board = [];
    currColumn = [5, 5, 5, 5, 5, 5, 5];
    for(let r=0; r<row; r++){
        let rowArray = [];
        for(let c=0; c<column; c++){
            rowArray.push('');
            let cell = document.createElement("div");
            cell.id = r.toString() + "-" + c.toString();
            cell.classList.add("cell");
            cell.addEventListener("click", setPiece);
            document.getElementById("board").appendChild(cell);
        }
        board.push(rowArray);
    }
}

function setPiece() {
    if (gameOver) {
        return;
    }
    let coord = this.id.split("-");
    let r = parseInt(coord[0]);
    let c = parseInt(coord[1]);

    r = currColumn[c];
    if(r < 0){
        return;
    }

    board[r][c] = currentPlayer;
    let piece = document.getElementById(r.toString() + "-" + c.toString());
    if (currentPlayer === playerRed) {
        piece.classList.add("red-piece");
        currentPlayer = playerYellow;
    } else {
        piece.classList.add("yellow-piece");
        currentPlayer = playerRed;
    }

    r -= 1;
    currColumn[c] = r;
    checkWinner();
    if (!gameOver && isDraw()) {
        document.getElementById("winner").innerText = "It's a Draw!";
        gameOver = true;
    }

}

function checkWinner() {
    // Check horizontal, vertical, and diagonal
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < column - 3; c++) {
            if (board[r][c] !== '' &&
                board[r][c] === board[r][c + 1] &&
                board[r][c] === board[r][c + 2] &&
                board[r][c] === board[r][c + 3]) {
                declareWinner(r, c);
                return;
            }  
        }
    }   
    for (let c = 0; c < column; c++) {
        for (let r = 0; r < row - 3; r++) {
            if (board[r][c] !== '' &&
                board[r][c] === board[r + 1][c] &&
                board[r][c] === board[r + 2][c] &&
                board[r][c] === board[r + 3][c]) {
                declareWinner(r, c);
                return;
            }  
        }
    }   
    for (let r = 0; r < row - 3; r++) {
        for (let c = 0; c < column - 3; c++) {
            if (board[r][c] !== '' &&
                board[r][c] === board[r + 1][c + 1] &&
                board[r][c] === board[r + 2][c + 2] &&
                board[r][c] === board[r + 3][c + 3]) {
                declareWinner(r, c);
                return;
            }
        }  
    }
    for (let r = 3; r < row; r++) {
        for (let c = 0; c < column - 3; c++) {
            if (board[r][c] !== '' &&
                board[r][c] === board[r - 1][c + 1] &&
                board[r][c] === board[r - 2][c + 2] &&
                board[r][c] === board[r - 3][c + 3]) {
                declareWinner(r, c);
                return;
            }
        }
    }
}

function isDraw() {
    return currColumn.every(c => c < 0);
}


function declareWinner(r, c) {
    let winner = document.getElementById("winner");
    if (board[r][c] === playerRed) {
        winner.innerText = "Red Player Wins!";
    } else {
        winner.innerText = "Yellow Player Wins!";
    }
    gameOver = true;
    restartBtn.style.display = "inline-block";
}

restartBtn.addEventListener("click", function() {
    location.reload();
});

