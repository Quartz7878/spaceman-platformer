import { Player } from './modules/player.js';
import { Level } from './modules/level.js';
import { AudioManager } from './modules/audio.js';
import { InputManager } from './modules/input.js';
import { UIManager } from './modules/ui.js';
import { Background } from './modules/background.js';
import { ObjectPool } from './modules/objects.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvasWidth = 800;
        this.canvasHeight = 480;
        this.lastTime = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gamePaused = false;
        this.score = 0;
        this.cameraShake = 0;

        // Initialize modules
        this.player = new Player(this);
        this.level = new Level(this);
        this.audio = new AudioManager(this);
        this.input = new InputManager(this);
        this.ui = new UIManager(this);
        this.background = new Background(this);
        this.objectPool = new ObjectPool(this);

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.ui.checkMobile();
        this.resizeCanvas();
        this.ui.initSettings();
        this.ui.loadHighScores();
        this.audio.preInit();
        this.objectPool.init();
        this.background.init();
        this.input.setupEventListeners();
        requestAnimationFrame(this.gameLoop);
    }

    resizeCanvas() {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        let newWidth = 800;
        let newHeight = 480;

        if (containerWidth < 800 || containerHeight < 480) {
            const aspectRatio = 800 / 480;
            if (containerWidth / containerHeight > aspectRatio) {
                newHeight = containerHeight - (this.ui.isMobile ? 100 : 0);
                newWidth = newHeight * aspectRatio;
            } else {
                newWidth = containerWidth;
                newHeight = newWidth / aspectRatio;
            }
        }

        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
    }

    startGame() {
        this.audio.init();
        this.player.reset();
        this.level.create();
        this.gameStarted = true;
        this.gameOver = false;
        this.ui.updateScore(0);
        this.ui.showGameUI();
    }

    gameLoop(timestamp) {
        const deltaTime = Math.min(timestamp - this.lastTime, 100);
        this.lastTime = timestamp;
        const dt = deltaTime / 1000;

        if (this.gameStarted && !this.gameOver && !this.gamePaused) {
            this.update(dt);
        }

        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        this.player.update(dt);
        this.level.update(dt);
        this.objectPool.update(dt);
        if (this.ui.settings.particles) {
            this.objectPool.updateParticles(dt);
        }
        if (this.cameraShake > 0) {
            this.cameraShake -= dt;
            if (this.cameraShake < 0) this.cameraShake = 0;
        }
        this.level.checkCollisions();
        this.ui.update();
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        if (this.cameraShake > 0) {
            const shakeAmount = 5 * this.cameraShake;
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * shakeAmount,
                (Math.random() - 0.5) * shakeAmount
            );
        }

        this.background.render();
        if (this.gameStarted) {
            this.level.render();
            this.player.render();
            this.objectPool.render();
        }

        if (this.cameraShake > 0) {
            this.ctx.restore();
        }
    }

    triggerCameraShake(duration) {
        this.cameraShake = Math.max(this.cameraShake, duration);
    }
}

const game = new Game();
window.addEventListener('load', () => game.init());
