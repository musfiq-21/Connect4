let player1Piece, player2Piece;
let playerRed = 1;
let playerYellow = 2;
let gameOver = false;
let currentPlayer = 1;

let board = [];
let rows = 6;
let columns = 7;

let player1Name = localStorage.getItem('player1Name') || 'Player 1';
let player2Name = localStorage.getItem('player2Name') || 'Player 2';
let player1Color = localStorage.getItem('player1Color') || 'red';
let player2Color = localStorage.getItem('player2Color') || 'yellow';

let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
let audioContext = null;

function getGradientForColor(color) {
    const gradients = {
        'red': 'linear-gradient(135deg, #ff6b6b, #cc0000)',
        'yellow': 'linear-gradient(135deg, #ffff66, #ffaa00)',
        'blue': 'linear-gradient(135deg, #66ccff, #0099ff)',
        'green': 'linear-gradient(135deg, #66ff99, #00cc44)',
        'purple': 'linear-gradient(135deg, #ff66ff, #cc00cc)',
        'pink': 'linear-gradient(135deg, #ff99cc, #ff1493)'
    };
    return gradients[color] || gradients['red'];
}

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(frequency, duration) {
    if (!soundEnabled || !audioContext) return;
    
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.value = frequency;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playMoveSound() {
    playTone(400, 0.1);
}

function playWinSound() {
    playTone(800, 0.3);
    setTimeout(() => playTone(600, 0.3), 150);
    setTimeout(() => playTone(1000, 0.5), 300);
}

function playDrawSound() {
    playTone(300, 0.2);
    setTimeout(() => playTone(200, 0.2), 100);
}

function setGame() {
    board = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            row.push(0);
        }
        board.push(row);
    }
    gameOver = false;
    currentPlayer = playerRed;
    updatePlayerTurn();
    displayPlayerInfo();
    renderBoard();
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            const tile = document.createElement('div');
            tile.id = `${r}-${c}`;
            tile.classList.add('tile');
            
            if (board[r][c] === playerRed) {
                const piece = document.createElement('div');
                piece.classList.add('player-piece');
                piece.style.background = getGradientForColor(player1Color);
                piece.style.boxShadow = `0 0 20px ${player1Color}, inset 0 0 20px rgba(255, 255, 255, 0.3)`;
                tile.appendChild(piece);
            } else if (board[r][c] === playerYellow) {
                const piece = document.createElement('div');
                piece.classList.add('player-piece');
                piece.style.background = getGradientForColor(player2Color);
                piece.style.boxShadow = `0 0 20px ${player2Color}, inset 0 0 20px rgba(255, 255, 255, 0.3)`;
                tile.appendChild(piece);
            }
            
            boardElement.appendChild(tile);
        }
    }
}

function setPiece() {
    if (gameOver) return;
    
    const col = event.target.id.split('-')[1];
    if (col === undefined) return;
    
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = currentPlayer;
            initAudioContext();
            playMoveSound();

            const tile = document.getElementById(`${r}-${col}`);
            const piece = document.createElement('div');
            piece.classList.add('player-piece');
            const playerColor = currentPlayer === playerRed ? player1Color : player2Color;
            piece.style.background = getGradientForColor(playerColor);
            piece.style.boxShadow = `0 0 20px ${playerColor}, inset 0 0 20px rgba(255, 255, 255, 0.3)`;
            tile.appendChild(piece);
            
            if (checkWinner()) {
                gameOver = true;
                const winnerName = currentPlayer === playerRed ? player1Name : player2Name;
                declareWinner(winnerName);
                playWinSound();
            } else if (isBoardFull()) {
                gameOver = true;
                document.getElementById('gameStatus').innerHTML = '🤝 It\'s a Draw!';
                document.getElementById('gameStatus').style.color = '#ffaa00';
                playDrawSound();
            } else {
                currentPlayer = currentPlayer === playerRed ? playerYellow : playerRed;
                updatePlayerTurn();
            }
            break;
        }
    }
}

function checkWinner() {
    // horizontal
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] === currentPlayer &&
                board[r][c + 1] === currentPlayer &&
                board[r][c + 2] === currentPlayer &&
                board[r][c + 3] === currentPlayer) {
                return true;
            }
        }
    }
    
    // vertical
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (board[r][c] === currentPlayer &&
                board[r + 1][c] === currentPlayer &&
                board[r + 2][c] === currentPlayer &&
                board[r + 3][c] === currentPlayer) {
                return true;
            }
        }
    }
    
    // anti-diagonal (bottom-left to top-right)
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] === currentPlayer &&
                board[r - 1][c + 1] === currentPlayer &&
                board[r - 2][c + 2] === currentPlayer &&
                board[r - 3][c + 3] === currentPlayer) {
                return true;
            }
        }
    }
    
    // diagonal (top-left to bottom-right)
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] === currentPlayer &&
                board[r + 1][c + 1] === currentPlayer &&
                board[r + 2][c + 2] === currentPlayer &&
                board[r + 3][c + 3] === currentPlayer) {
                return true;
            }
        }
    }
    
    return false;
}

function isBoardFull() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c] === 0) {
            return false;
        }
    }
    return true;
}

function declareWinner(playerName) {
    const message = `🎉 ${playerName} Wins! 🎉`;
    document.getElementById('gameStatus').innerHTML = message;
    
    const playerColor = currentPlayer === playerRed ? player1Color : player2Color;
    const colorMap = {
        'red': '#ff6b6b',
        'yellow': '#ffff66',
        'blue': '#66ccff',
        'green': '#66ff99',
        'purple': '#ff66ff',
        'pink': '#ff99cc'
    };
    document.getElementById('gameStatus').style.color = colorMap[playerColor] || '#ff6b6b';
}

function updatePlayerTurn() {
    if (!gameOver) {
        const playerName = currentPlayer === playerRed ? player1Name : player2Name;
        const playerColor = currentPlayer === playerRed ? player1Color : player2Color;
        
        document.getElementById('currentPlayerName').textContent = playerName;
        
        const badge = document.getElementById('playerColorBadge');
        badge.className = 'player-color-badge';
        badge.classList.add(`color-${playerColor}`);
    }
}

function displayPlayerInfo() {
    const colorMap = {
        'red': '#ff6b6b',
        'yellow': '#ffff66',
        'blue': '#66ccff',
        'green': '#66ff99',
        'purple': '#ff66ff',
        'pink': '#ff99cc'
    };
    
    document.getElementById('player1Details').innerHTML = `
        <div style="color: ${colorMap[player1Color]};">${player1Name}</div>
    `;
    
    document.getElementById('player2Details').innerHTML = `
        <div style="color: ${colorMap[player2Color]};">${player2Name}</div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('board').addEventListener('click', setPiece);
    
    const soundBtn = document.getElementById('soundBtn');
    soundBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
    
    soundBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        soundBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
    });
    
    setGame();
});
