function startGame(mode) {
            localStorage.setItem('gameMode', mode);
            if (mode === 'pvp') {
                window.location.href = '../hvh/pvp-setup.html';
            } else if (mode === 'ai') {
                window.location.href = '../hvai/ai-setup.html';
            }
        }