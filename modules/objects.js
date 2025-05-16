import { COLORS } from './constants.js';

export class ObjectPool {
    constructor(game) {
        this.game = game;
        this.bulletPool = [];
        this.bullets = [];
        this.particles = [];
    }

    init() {
        for (let i = 0; i < 20; i++) {
            this.bulletPool.push({
                x: 0,
                y: 0,
                width: 10,
                height: 6,
                velX: 0,
                velY: 0,
                active: false
            });
        }
    }

    shootBullet(player) {
        let bullet = this.bulletPool.find(b => !b.active);
        if (!bullet) {
            bullet = { x: 0, y: 0, width: 10, height: 6, velX: 0, velY: 0, active: false };
            this.bulletPool.push(bullet);
        }
        bullet.active = true;
        bullet.x = player.facingRight ? player.x + player.width : player.x - bullet.width;
        bullet.y = player.y + player.height / 2 - bullet.height / 2;
        bullet.velX = player.facingRight ? 12 : -12;
        this.bullets.push(bullet);
        this.game.audio.play('shoot');
    }

    createJetpackParticles(player) {
        for (let i = 0; i < 2; i++) {
            const offsetX = player.facingRight ? 2 : player.width - 2;
            this.particles.push({
                x: player.x + offsetX,
                y: player.y + player.height - 5,
                size: Math.random() * 4 + 2,
                velX: (Math.random() - 0.5) * 2,
                velY: Math.random() * 2 + 2,
                color: Math.random() > 0.5 ? '#f80' : '#f00',
                alpha: 1,
                life: 0.5
            });
        }
    }

    createCollectParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + 7,
                y: y + 7,
                size: Math.random() * 5 + 1,
                velX: (Math.random() - 0.5) * 6,
                velY: (Math.random() - 0.5) * 6,
                color,
                alpha: 1,
                life: 0.5
            });
        }
    }

    createExplosionParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.particles.push({
                x,
                y,
                size: Math.random() * 6 + 2,
                velX: Math.cos(angle) * speed,
                velY: Math.sin(angle) * speed,
                color: Math.random() > 0.5 ? '#f55' : '#ff0',
                alpha: 1,
                life: Math.random() * 0.5 + 0.3
            });
        }
    }

    update(dt) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.velX;
            if (bullet.x < 0 || bullet.x > this.game.canvasWidth) {
                bullet.active = false;
                this.bullets.splice(i, 1);
            }
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.life -= dt;
            particle.alpha = particle.life;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        const { ctx } = this.game;
        ctx.fillStyle = COLORS.bullet;
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        this.particles.forEach(particle => {
            ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
