export class InputManager {
    constructor(game) {
        this.game = game;
        this.keyState = {};
        this.isMobile = false;
    }

    setupEventListeners() {
        window.addEventListener('keydown', e => {
            this.keyState[e.code] = true;
            if ((e.code === 'Escape' || e.code === 'KeyP') && this.game.gameStarted && !this.game.gameOver) {
                this.game.ui.togglePause();
            }
        });

        window.addEventListener('keyup', e => {
            this.keyState[e.code] = false;
        });

        window.addEventListener('resize', () => this.game.resizeCanvas());

        const buttons = {
            startButton: () => this.game.startGame(),
            restartButton: () => this.game.ui.restartGame(),
            resumeButton: () => this.game.ui.resumeGame(),
            quitButton: () => this.game.ui.quitToMenu(),
            pauseBtn: () => this.game.ui.togglePause(),
            pauseMobileBtn: () => this.game.ui.togglePause(),
            settingsBtn: () => this.game.ui.showSettings(),
            closeSettings: () => this.game.ui.closeSettings()
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            document.getElementById(id).addEventListener('click', handler);
        });

        this.setupTouchControls();
    }

    setupTouchControls() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
        const touchButtons = {
            leftBtn: { code: 'ArrowLeft' },
            rightBtn: { code: 'ArrowRight' },
            jumpBtn: { code: 'Space' },
            shootBtn: { code: 'KeyZ' }
        };

        Object.entries(touchButtons).forEach(([id, button]) => {
            const element = document.getElementById(id);
            element.addEventListener('touchstart', e => {
                e.preventDefault();
                this.keyState[button.code] = true;
                element.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            });
            element.addEventListener('touchend', e => {
                e.preventDefault();
                this.keyState[button.code] = false;
                element.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            element.addEventListener('mousedown', () => {
                this.keyState[button.code] = true;
                element.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            });
            element.addEventListener('mouseup', () => {
                this.keyState[button.code] = false;
                element.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            element.addEventListener('contextmenu', e => e.preventDefault());
        });
    }
}
