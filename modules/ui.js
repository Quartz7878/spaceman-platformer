export class UIManager {
    constructor(game) {
        this.game = game;
        this.settings = { difficulty: 'normal', sound: true, particles: true };
        this.highScores = [];
        this.isMobile = false;
    }

    checkMobile() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
        document.getElementById('mobileControls').style.display = this.isMobile ? 'flex' : 'none';
        document.getElementById('controlsInfo').innerHTML = this.isMobile
            ? 'Use on-screen controls to play'
            : 'CONTROLS:<br>Arrow keys or WASD to move<br>SPACE to jump<br>Z or CTRL to shoot<br>ESC or P to pause';
    }

    initSettings() {
        const savedSettings = localStorage.getItem('spacemanSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            document.getElementById('difficultySelect').value = this.settings.difficulty;
            document.getElementById('soundToggle').checked = this.settings.sound;
            document.getElementById('particlesToggle').checked = this.settings.particles;
        }
    }

    saveSettings() {
        this.settings.difficulty = document.getElementById('difficultySelect').value;
        this.settings.sound = document.getElementById('soundToggle').checked;
        this.settings.particles = document.getElementById('particlesToggle').checked;
        localStorage.setItem('spacemanSettings', JSON.stringify(this.settings));
    }

    loadHighScores() {
        const savedScores = localStorage.getItem('spacemanHighScores');
        if (savedScores) {
            this.highScores = JSON.parse(savedScores);
            this.updateHighScoresDisplay();
        }
    }

    saveHighScore(score) {
        this.highScores.push(score);
        this.highScores.sort((a, b) => b - a).slice(0, 5);
        localStorage.setItem('spacemanHighScores', JSON.stringify(this.highScores));
        this.updateHighScoresDisplay();
    }

    updateHighScoresDisplay() {
        const scoresList = document.getElementById('highScoresList');
        scoresList.innerHTML = this.highScores.length === 0
            ? 'No scores yet'
            : this.highScores.map((score, i) => `<div>${i + 1}. ${score}</div>`).join('');
    }

    updateScore(score) {
        this.game.score = score;
        document.getElementById('score').textContent = `SCORE: ${score}`;
    }

    update() {
        document.getElementById('healthFill').style.width = `${this.game.player.health}%`;
        if (this.game.player.jetpackActive) {
            document.getElementById('jetpackBar').style.display = 'block';
            document.getElementById('jetpackFill').style.width = `${(this.game.player.jetpackFuel / this.game.player.maxJetpackFuel) * 100}%`;
        }
    }

    showGameUI() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'block';
        document.getElementById('healthFill').style.width = '100%';
        document.getElementById('jetpackBar').style.display = 'none';
        document.getElementById('jetpackFill').style.width = '0%';
    }

    showGameOver() {
        document.getElementById('gameOverScreen').style.display = 'flex';
        document.getElementById('finalScore').textContent = this.game.score;
        document.getElementById('pauseBtn').style.display = 'none';
    }

    restartGame() {
        this.saveHighScore(this.game.score);
        this.game.score = 0;
        this.game.player.reset();
        this.game.level.create();
        this.game.gameOver = false;
        this.showGameUI();
        document.getElementById('gameOverScreen').style.display = 'none';
    }

    togglePause() {
        this.game.gamePaused = !this.game.gamePaused;
        document.getElementById('pauseScreen').style.display = this.game.gamePaused ? 'flex' : 'none';
        if (this.game.gamePaused) {
            this.game.audio.audioCtx.suspend();
        } else {
            this.game.audio.audioCtx.resume();
            this.game.lastTime = performance.now();
        }
    }

    resumeGame() {
        this.togglePause();
    }

    quitToMenu() {
        this.game.gamePaused = false;
        this.game.gameStarted = false;
        this.game.gameOver = false;
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
    }

    showSettings() {
        document.getElementById('settingsMenu').style.display = 'flex';
        if (this.game.gameStarted && !this.game.gameOver) {
            this.togglePause();
        }
    }

    closeSettings() {
        document.getElementById('settingsMenu').style.display = 'none';
        this.saveSettings();
        if (this.game.gameStarted && !this.game.gameOver && this.game.gamePaused) {
            if (document.getElementById('startScreen').style.display === 'none') {
                this.resumeGame();
            }
        }
    }
}
