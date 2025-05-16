export class AudioManager {
    constructor(game) {
        this.game = game;
        this.audioCtx = null;
        this.sfx = {};
    }

    preInit() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.audioCtx.suspend();
        } catch (e) {
            console.log('Audio initialization deferred to first interaction');
        }
    }

    init() {
        if (this.audioCtx && this.audioCtx.state !== 'closed') {
            this.audioCtx.resume();
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        const createSound = (type, frequency, duration, volume = 0.2) => () => {
            if (!this.game.ui.settings.sound || !this.audioCtx) return;
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + duration);
        };

        this.sfx.jump = createSound('square', 220, 0.1);
        this.sfx.shoot = createSound('sawtooth', 440, 0.1, 0.1);
        this.sfx.hit = createSound('square', 110, 0.15);
        this.sfx.collect = createSound('sine', 660, 0.15);
        this.sfx.explode = createSound('sawtooth', 100, 0.3);
        this.sfx.gameOver = createSound('square', 49, 1, 0.3);
        this.sfx.jetpack = createSound('sawtooth', 220, 0.1, 0.05);
    }

    play(sound) {
        if (this.sfx[sound]) this.sfx[sound]();
    }
}
