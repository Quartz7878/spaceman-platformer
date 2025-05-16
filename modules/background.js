export class Background {
    constructor(game) {
        this.game = game;
        this.stars = [];
        this.nebula = [];
    }

    init() {
        for (let i = 0; i < 200; i++) {
            const depth = Math.random() * 3 + 1;
            this.stars.push({
                x: Math.random() * this.game.canvasWidth,
                y: Math.random() * this.game.canvasHeight,
                size: Math.random() * 2 + 1,
                depth,
                alpha: Math.random() * 0.5 + 0.5,
                speedFactor: 0.05 / depth
            });
        }

        for (let i = 0; i < 5; i++) {
            this.nebula.push({
                x: Math.random() * this.game.canvasWidth,
                y: Math.random() * this.game.canvasHeight / 2,
                width: Math.random() * 150 + 100,
                height: Math.random() * 100 + 50,
                color: `hsla(${Math.random() * 60 + 240}, 70%, 40%, 0.1)`,
                speed: Math.random() * 0.2 + 0.1
            });
        }
    }

    render() {
        const { ctx, player } = this.game;
        const playerOffset = this.game.gameStarted ? player.velX * 0.2 : 0;

        this.stars.forEach(star => {
            const offsetX = this.game.gameStarted ? playerOffset * star.speedFactor : 0;
            star.x -= offsetX;
            if (star.x < 0) star.x += this.game.canvasWidth;
            if (star.x > this.game.canvasWidth) star.x -= this.game.canvasWidth;
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });

        this.nebula.forEach(nebula => {
            const offsetX = this.game.gameStarted ? playerOffset * 0.05 : 0;
            nebula.x -= offsetX;
            if (nebula.x + nebula.width < 0) nebula.x = this.game.canvasWidth;
            if (nebula.x > this.game.canvasWidth) nebula.x = -nebula.width;
            const gradient = ctx.createRadialGradient(
                nebula.x + nebula.width / 2,
                nebula.y + nebula.height / 2,
                0,
                nebula.x + nebula.width / 2,
                nebula.y + nebula.height / 2,
                nebula.width / 2
            );
            gradient.addColorStop(0, nebula.color.replace('0.1)', '0.2)'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(
                nebula.x - nebula.width / 2,
                nebula.y - nebula.height / 2,
                nebula.width * 2,
                nebula.height * 2
            );
        });
    }
}
