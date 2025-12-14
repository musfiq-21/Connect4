let playerRed = 1;
let playerYellow = 2;
let gameOver = false;
let currentPlayer = 1;
let isAIThinking = false;

let board = [];
let rows = 6;
let columns = 7;

// Player settings (would come from setup page or in-memory storage)
let player1Name = 'Player 1';
let player2Name = 'AI';
let player1Color = 'red';
let player2Color = 'yellow';
let soundEnabled = true;
let audioContext = null;

// AI Configuration
const AI_PLAYER = playerYellow; // AI is player 2
const HUMAN_PLAYER = playerRed; // Human is player 1
const AI_MOVE_DELAY = 500; // Delay before AI makes move (ms)
const API_ENDPOINT = 'http://localhost:8000/ai-move'; // Replace with your actual API endpoint

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
    currentPlayer = HUMAN_PLAYER;
    isAIThinking = false;
    document.getElementById('gameStatus').innerHTML = '';
    hideThinkingIndicator();
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

function setPiece(event) {
    // Don't allow moves if game is over or AI is thinking
    if (gameOver || isAIThinking) return;

    // Only allow human player to click
    if (currentPlayer !== HUMAN_PLAYER) return;

    const col = event.target.id.split('-')[1];
    if (col === undefined) return;

    // Make the move
    const moveSuccess = makeMove(parseInt(col), currentPlayer);

    if (moveSuccess) {
        // Check game state after human move
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
            // Switch to AI
            currentPlayer = AI_PLAYER;
            updatePlayerTurn();

            // Trigger AI move after a delay
            setTimeout(() => {
                getAIMove();
            }, AI_MOVE_DELAY);
        }
    }
}

function makeMove(col, player) {
    // Find the lowest empty row in the column
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = player;
            initAudioContext();
            playMoveSound();

            // Add the piece visually
            const tile = document.getElementById(`${r}-${col}`);
            const piece = document.createElement('div');
            piece.classList.add('player-piece');
            const playerColor = player === playerRed ? player1Color : player2Color;
            piece.style.background = getGradientForColor(playerColor);
            piece.style.boxShadow = `0 0 20px ${playerColor}, inset 0 0 20px rgba(255, 255, 255, 0.3)`;
            tile.appendChild(piece);

            return true;
        }
    }
    return false; // Column is full
}

async function getAIMove() {
    if (gameOver) return;

    isAIThinking = true;
    showThinkingIndicator();

    const difficulty = localStorage.getItem('aiLevel') ?? 'easy';

    try {
        // Send board state to backend
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                board: board,
                difficulty: difficulty
            })
        });

        console.log("new diffic: " + difficulty);
        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        const aiColumn = data.col; // Backend returns { column: 2 } or { column: 4 }

        // Validate the column
        if (aiColumn === undefined || aiColumn < 0 || aiColumn >= columns) {
            throw new Error('Invalid column from API');
        }

        // Make the AI move
        hideThinkingIndicator();
        const moveSuccess = makeMove(aiColumn, AI_PLAYER);

        if (moveSuccess) {
            // Check game state after AI move
            if (checkWinner()) {
                gameOver = true;
                const winnerName = AI_PLAYER === playerRed ? player1Name : player2Name;
                declareWinner(winnerName);
                playWinSound();
            } else if (isBoardFull()) {
                gameOver = true;
                document.getElementById('gameStatus').innerHTML = '🤝 It\'s a Draw!';
                document.getElementById('gameStatus').style.color = '#ffaa00';
                playDrawSound();
            } else {
                // Switch back to human
                currentPlayer = HUMAN_PLAYER;
                updatePlayerTurn();
            }
        } else {
            console.error('AI tried to play in a full column');
            // Fallback: try a random valid column
            makeRandomAIMove();
        }

    } catch (error) {
        console.error('Error getting AI move:', error);
        hideThinkingIndicator();

        // Fallback: make a random valid move
        makeRandomAIMove();
    } finally {
        isAIThinking = false;
    }
}

function makeRandomAIMove() {
    // Fallback: find a random valid column
    const validColumns = [];
    for (let c = 0; c < columns; c++) {
        if (board[0][c] === 0) {
            validColumns.push(c);
        }
    }

    if (validColumns.length > 0) {
        const randomCol = validColumns[Math.floor(Math.random() * validColumns.length)];
        const moveSuccess = makeMove(randomCol, AI_PLAYER);

        if (moveSuccess) {
            if (checkWinner()) {
                gameOver = true;
                declareWinner(player2Name);
                playWinSound();
            } else if (isBoardFull()) {
                gameOver = true;
                document.getElementById('gameStatus').innerHTML = '🤝 It\'s a Draw!';
                document.getElementById('gameStatus').style.color = '#ffaa00';
                playDrawSound();
            } else {
                currentPlayer = HUMAN_PLAYER;
                updatePlayerTurn();
            }
        }
    }
}

function showThinkingIndicator() {
    const indicator = document.getElementById('thinkingIndicator');
    if (indicator) {
        indicator.style.display = 'block';
    }
}

function hideThinkingIndicator() {
    const indicator = document.getElementById('thinkingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
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

    // anti-diagonal
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

    // diagonal
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('board').addEventListener('click', setPiece);

    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
        soundBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';

        soundBtn.addEventListener('click', function() {
            soundEnabled = !soundEnabled;
            soundBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            setGame();
        });
    }

    setGame();
});