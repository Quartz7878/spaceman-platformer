import { COLORS } from './constants.js';

export class Level {
    constructor(game) {
        this.game = game;
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
    }

    create() {
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];

        const { settings } = this.game.ui;
        const enemySpawnChance = settings.difficulty === 'easy' ? 0.4 : settings.difficulty === 'normal' ? 0.6 : 0.8;
        const collectibleSpawnChance = settings.difficulty === 'easy' ? 0.7 : settings.difficulty === 'normal' ? 0.6 : 0.5;
        const enemySpeed = settings.difficulty === 'easy' ? 1 : settings.difficulty === 'normal' ? 2 : 3;

        this.platforms.push({
            x: 0,
            y: this.game.canvasHeight - 30,
            width: this.game.canvasWidth,
            height: 30,
            color: COLORS.ground
        });

        const platformPositions = [
            { x: 200, y: 350, w: 100 },
            { x: 400, y: 300, w: 80 },
            { x: 600, y: 250, w: 120 },
            { x: 300, y: 200, w: 90 },
            { x: 100, y: 150, w: 70 },
            { x: 500, y: 120, w: 100 }
        ];

        platformPositions.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.w,
                height: 15,
                color: COLORS.platform
            });

            if (Math.random() > (1 - collectibleSpawnChance)) {
                this.collectibles.push({
                    x: p.x + p.w / 2,
                    y: p.y - 25,
                    width: 15,
                    height: 15,
                    type: Math.random() > 0.7 ? 'oxygen' : 'coin',
                    collected: false,
                    bounceOffset: 0,
                    bounceDir: 1
                });
            }

            if (Math.random() > (1 - enemySpawnChance)) {
                this.enemies.push({
                    x: p.x + Math.random() * p.w,
                    y: p.y - 30,
                    width: 20,
                    height: 20,
                    velX: Math.random() > 0.5 ? enemySpeed : -enemySpeed,
                    velY: 0,
                    type: Math.random() > 0.5 ? 'blob' : 'ufo',
                    animTime: 0
                });
            }
        });

        this.collectibles.push({
            x: 700,
            y: 400,
            width: 20,
            height: 25,
            type: 'jetpack',
            collected: false,
            bounceOffset: 0,
            bounceDir: 1
        });
    }

    update(dt) {
        this.updateEnemies(dt);
        this.updateCollectibles(dt);
    }

    updateEnemies(dt) {
        this.enemies.forEach(enemy => {
            if (enemy.type === 'blob') {
                enemy.x += enemy.velX;
                enemy.y += enemy.velY;
                enemy.velY += this.game.GRAVITY * 0.5;

                let onPlatform = false;
                let aboutToFall = true;

                this.platforms.forEach(platform => {
                    if (
                        enemy.x + enemy.width > platform.x &&
                        enemy.x < platform.x + platform.width &&
                        enemy.y + enemy.height <= platform.y + 5 &&
                        enemy.y + enemy.height + enemy.velY >= platform.y
                    ) {
                        enemy.y = platform.y - enemy.height;
                        enemy.velY = 0;
                        onPlatform = true;
                        if (
                            (enemy.velX > 0 && enemy.x + enemy.width + enemy.velX < platform.x + platform.width) ||
                            (enemy.velX < 0 && enemy.x + enemy.velX > platform.x)
                        ) {
                            aboutToFall = false;
                        }
                    }
                });

                if (enemy.x <= 0 || enemy.x + enemy.width >= this.game.canvasWidth || (onPlatform && aboutToFall)) {
                    enemy.velX *= -1;
                }
            } else if (enemy.type === 'ufo') {
                enemy.animTime += dt;
                enemy.x += enemy.velX;
                enemy.y += Math.sin(enemy.animTime * 4) * 0.8;
                if (enemy.x <= 0 || enemy.x + enemy.width >= this.game.canvasWidth) {
                    enemy.velX *= -1;
                }
            }
        });
    }

    updateCollectibles(dt) {
        this.collectibles.forEach(item => {
            if (!item.collected) {
                item.bounceOffset += dt * 2 * item.bounceDir;
                if (item.bounceOffset > 3) item.bounceDir = -1;
                else if (item.bounceOffset < -3) item.bounceDir = 1;
            }
        });
    }

    checkCollisions() {
        const { player, objectPool, audio } = this.game;

        // Player-Platform
        player.isJumping = true;
        this.platforms.forEach(platform => {
            if (
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height <= platform.y + 10 &&
                player.y + player.height + player.velY >= platform.y
            ) {
                player.y = platform.y - player.height;
                player.velY = 0;
                player.isJumping = false;
            } else if (
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y <= platform.y + platform.height &&
                player.y + player.velY <= platform.y + platform.height &&
                player.y > platform.y
            ) {
                player.y = platform.y + platform.height;
                player.velY = 0;
            } else if (
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height
            ) {
                if (
                    player.x <= platform.x + platform.width &&
                    player.x + player.velX >= platform.x + platform.width - 5
                ) {
                    player.x = platform.x + platform.width;
                } else if (
                    player.x + player.width >= platform.x &&
                    player.x + player.width + player.velX <= platform.x + 5
                ) {
                    player.x = platform.x - player.width;
                }
            }
        });

        // Player-Enemy
        if (!player.invulnerable) {
            this.enemies.forEach(enemy => {
                if (
                    player.x + player.width > enemy.x &&
                    player.x < enemy.x + enemy.width &&
                    player.y + player.height > enemy.y &&
                    player.y < enemy.y + enemy.height
                ) {
                    player.takeDamage(10);
                }
            });
        }

        // Player-Collectible
        this.collectibles.forEach(item => {
            if (
                !item.collected &&
                player.x + player.width > item.x &&
                player.x < item.x + item.width &&
                player.y + player.height > item.y &&
                player.y < item.y + item.height
            ) {
                item.collected = true;
                if (item.type === 'coin') {
                    this.game.score += 100;
                    audio.play('collect');
                    if (this.game.ui.settings.particles) {
                        objectPool.createCollectParticles(item.x, item.y, '#ff0');
                    }
                } else if (item.type === 'oxygen') {
                    player.health = Math.min(player.health + 20, 100);
                    audio.play('collect');
                    if (this.game.ui.settings.particles) {
                        objectPool.createCollectParticles(item.x, item.y, '#5df');
                    }
                } else if (item.type === 'jetpack') {
                    player.jetpackActive = true;
                    player.jetpackFuel = player.maxJetpackFuel;
                    audio.play('collect');
                    if (this.game.ui.settings.particles) {
                        objectPool.createCollectParticles(item.x, item.y, '#f80');
                    }
                }
            }
        });

        // Bullet-Enemy
        for (let i = objectPool.bullets.length - 1; i >= 0; i--) {
            const bullet = objectPool.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (
                    bullet.x + bullet.width > enemy.x &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.y + bullet.height > enemy.y &&
                    bullet.y < enemy.y + enemy.height
                ) {
                    bullet.active = false;
                    objectPool.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.game.score += 200;
                    audio.play('hit');
                    this.game.triggerCameraShake(0.2);
                    if (this.game.ui.settings.particles) {
                        objectPool.createExplosionParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    }
                    break;
                }
            }
        }
    }

    render() {
        const { ctx } = this.game;

        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(platform.x, platform.y, platform.width, 2);
        });

        this.collectibles.forEach(item => {
            if (!item.collected) {
                ctx.save();
                if (item.type === 'coin') {
                    ctx.fillStyle = COLORS.coin;
                    ctx.beginPath();
                    ctx.arc(
                        item.x + item.width / 2,
                        item.y + item.height / 2 + item.bounceOffset,
                        item.width / 2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.beginPath();
                    ctx.arc(
                        item.x + item.width / 2 - 2,
                        item.y + item.height / 2 - 2 + item.bounceOffset,
                        item.width / 6,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else if (item.type === 'oxygen') {
                    ctx.fillStyle = COLORS.oxygen;
                    ctx.fillRect(item.x, item.y + item.bounceOffset, item.width, item.height);
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(item.x + 2, item.y - 3 + item.bounceOffset, item.width - 4, 3);
                } else if (item.type === 'jetpack') {
                    ctx.fillStyle = COLORS.jetpack;
                    ctx.fillRect(item.x, item.y + item.bounceOffset, item.width, item.height);
                    ctx.fillStyle = '#a50';
                    ctx.fillRect(item.x - 2, item.y + 5 + item.bounceOffset, 3, item.height - 10);
                }
                ctx.restore();
            }
        });

        this.enemies.forEach(enemy => {
            ctx.save();
            if (enemy.type === 'blob') {
                ctx.fillStyle = COLORS.enemy;
                const squishY = Math.sin(Date.now() / 200) * 2;
                const squishX = Math.sin(Date.now() / 300) * 2;
                ctx.beginPath();
                ctx.ellipse(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.width / 2 + squishX,
                    enemy.height / 2 - squishY,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2 - 4, enemy.y + enemy.height / 2 - 2, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2 + 4, enemy.y + enemy.height / 2 - 2, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                const pupilX = enemy.velX < 0 ? -1 : 1;
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2 - 4 + pupilX, enemy.y + enemy.height / 2 - 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2 + 4 + pupilX, enemy.y + enemy.height / 2 - 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (enemy.type === 'ufo') {
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.ellipse(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.width / 2,
                    enemy.height / 3,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.fillStyle = '#bbb';
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 - 3, enemy.width / 3, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 - 3, enemy.width / 5, 0, Math.PI * 2);
                ctx.fill();
                const glowIntensity = (Math.sin(Date.now() / 200) + 1) / 4;
                ctx.fillStyle = `rgba(255, 100, 100, ${glowIntensity})`;
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 - 3, enemy.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }
}
