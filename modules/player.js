import { COLORS, GRAVITY, JUMP_FORCE, MOVE_SPEED } from './modules/constants.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.x = 100;
        this.y = 300;
        this.width = 24;
        this.height = 32;
        this.velX = 0;
        this.velY = 0;
        this.isJumping = false;
        this.health = 100;
        this.facingRight = true;
        this.blinkTime = 0;
        this.invulnerable = false;
        this.jetpackActive = false;
        this.jetpackFuel = 0;
        this.maxJetpackFuel = 200;
        this.jetpackRechargeTimer = 0;
        this.jetpackRechargeDelay = 3;
        this.canShoot = true;
    }

    update(dt) {
        this.velX = 0;

        const { input, objectPool, audio } = this.game;
        if (input.keyState['ArrowLeft'] || input.keyState['KeyA']) {
            this.velX = -MOVE_SPEED;
            this.facingRight = false;
        }
        if (input.keyState['ArrowRight'] || input.keyState['KeyD']) {
            this.velX = MOVE_SPEED;
            this.facingRight = true;
        }
        if ((input.keyState['ArrowUp'] || input.keyState['KeyW'] || input.keyState['Space']) && !this.isJumping) {
            this.velY = JUMP_FORCE;
            this.isJumping = true;
            audio.play('jump');
        }

        if (this.jetpackActive && this.jetpackFuel > 0) {
            if (input.keyState['ArrowUp'] || input.keyState['KeyW'] || input.keyState['Space']) {
                this.velY -= 1;
                this.jetpackFuel -= 1;
                this.jetpackRechargeTimer = 0;
                if (this.game.ui.settings.particles) {
                    objectPool.createJetpackParticles(this);
                }
                if (Math.random() > 0.8) audio.play('jetpack');
            }
        }

        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;

        // Boundaries
        this.x = Math.max(0, Math.min(this.x, this.game.canvasWidth - this.width));
        if (this.y < 0) this.y = 0;
        if (this.y > this.game.canvasHeight) {
            this.takeDamage(20);
            this.y = this.game.canvasHeight - this.height;
            this.velY = JUMP_FORCE / 2;
        }

        // Shooting
        if ((input.keyState['KeyZ'] || input.keyState['ControlLeft']) && this.canShoot) {
            objectPool.shootBullet(this);
            this.canShoot = false;
            setTimeout(() => (this.canShoot = true), 300);
        }

        // Invulnerability
        if (this.invulnerable) {
            this.blinkTime += dt;
            if (this.blinkTime >= 2) {
                this.invulnerable = false;
                this.blinkTime = 0;
            }
        }

        // Jetpack recharge
        if (this.jetpackActive && this.jetpackFuel < this.maxJetpackFuel && !input.keyState['ArrowUp'] && !input.keyState['KeyW'] && !input.keyState['Space']) {
            this.jetpackRechargeTimer += dt;
            if (this.jetpackRechargeTimer >= this.jetpackRechargeDelay) {
                this.jetpackFuel = Math.min(this.jetpackFuel + dt * 30, this.maxJetpackFuel);
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnerable) return;
        this.health = Math.max(0, this.health - amount);
        this.invulnerable = true;
        this.blinkTime = 0;
        this.game.triggerCameraShake(0.3);
        this.game.audio.play(this.health <= 0 ? 'gameOver' : 'hit');

        if (this.health <= 0) {
            this.game.gameOver = true;
            this.game.ui.showGameOver();
        }
    }

    render() {
        if (this.invulnerable && Math.floor(this.blinkTime * 10) % 2 === 0) return;

        const { ctx } = this.game;
        ctx.save();
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#88f';
        ctx.fillRect(this.x + (this.facingRight ? 8 : 4), this.y + 4, 12, 8);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(this.x + (this.facingRight ? 2 : 16), this.y + 8, 6, 16);
        if (this.jetpackActive) {
            ctx.fillStyle = COLORS.jetpack;
            ctx.fillRect(this.x + (this.facingRight ? -2 : this.width - 4), this.y + 10, 6, 18);
        }
        ctx.restore();
    }
}
