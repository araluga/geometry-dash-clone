class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlayingMusic = false;
        this.musicInterval = null;
        this.tempo = 130; // BPM
        this.stepTime = 60 / this.tempo / 4; // 16th notes
        this.step = 0;
        this.currentScale = [130.81, 146.83, 164.81, 196.00, 220.00]; // C pentatonic (low)
        this.leadScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
        this.masterVolume = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.masterVolume.connect(this.ctx.destination);
    }

    playJump() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playCrash() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // Synthesize explosion noise
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noiseNode.start();
        noiseNode.stop(this.ctx.currentTime + 0.4);
    }

    playClick() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.setValueAtTime(400, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    startMusic(levelIndex) {
        this.init();
        if (this.isPlayingMusic) this.stopMusic();
        this.isPlayingMusic = true;
        this.step = 0;

        // Sequence definitions based on levels
        const melodyPattern = this.getMelodyPattern(levelIndex);
        const bassPattern = this.getBassPattern(levelIndex);

        const nextTick = () => {
            if (!this.isPlayingMusic) return;
            const lookAhead = 0.1;
            const time = this.ctx.currentTime;
            
            this.playSynthStep(time, this.step, melodyPattern, bassPattern);
            
            this.step = (this.step + 1) % 32;
            this.musicInterval = setTimeout(nextTick, this.stepTime * 1000);
        };

        nextTick();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    }

    getMelodyPattern(levelIndex) {
        // 32-step sequence
        const melodies = [
            // Level 1: Simple pentatonic jumpy melody
            [0, -1, 2, -1, 3, -1, 4, 3, 2, -1, 0, -1, 4, -1, 3, 2, 0, 1, 2, 3, 4, -1, 2, -1, 0, -1, 3, -1, 1, -1, 0, -1],
            // Level 2: Flight themed arpeggios
            [4, 5, 6, 7, 5, 6, 7, 8, 6, 7, 8, 9, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5, 6, 4, -1, 6, -1, 7, -1, 8, -1],
            // Level 3: Faster syncopated rhythm
            [2, -1, 4, -1, 7, 5, -1, 2, -1, 4, 7, 5, -1, 9, -1, 7, 2, -1, 4, -1, 7, 5, -1, 2, -1, 9, -1, 8, -1, 7, -1, 5]
        ];
        return melodies[levelIndex] || melodies[0];
    }

    getBassPattern(levelIndex) {
        const basses = [
            [0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 4, 4, 4, 4, 3, 3, 3, 3],
            [3, 3, 3, 3, 4, 4, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4],
            [0, -1, 0, -1, 2, -1, 2, -1, 3, -1, 3, -1, 1, -1, 1, -1, 0, -1, 0, -1, 3, -1, 3, -1, 4, -1, 4, -1, 2, -1, 2, -1]
        ];
        return basses[levelIndex] || basses[0];
    }

    playSynthStep(time, step, melody, bass) {
        // Kick drum on quarter notes (steps 0, 4, 8, 12, 16, 20, 24, 28)
        if (step % 4 === 0) {
            this.playKick(time);
        }

        // Snare / Hi-hat sound
        if (step % 8 === 4) {
            this.playSnare(time);
        } else if (step % 2 === 0) {
            this.playHihat(time);
        }

        // Bassline
        const bassNote = bass[step];
        if (bassNote !== -1) {
            const freq = this.currentScale[bassNote % this.currentScale.length];
            this.playBassOsc(time, freq);
        }

        // Lead Melody
        const leadNote = melody[step];
        if (leadNote !== -1) {
            const freq = this.leadScale[leadNote % this.leadScale.length];
            this.playLeadOsc(time, freq);
        }
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.12);

        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start(time);
        osc.stop(time + 0.12);
    }

    playSnare(time) {
        // Synthesise noise snare
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);
        noise.start(time);
        noise.stop(time + 0.1);
    }

    playHihat(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(8000, time);

        gain.gain.setValueAtTime(0.04, time);
        gain.gain.linearRampToValueAtTime(0.001, time + 0.03);

        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start(time);
        osc.stop(time + 0.03);
    }

    playBassOsc(time, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.linearRampToValueAtTime(0.01, time + this.stepTime * 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);
        osc.start(time);
        osc.stop(time + this.stepTime * 1.5);
    }

    playLeadOsc(time, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.linearRampToValueAtTime(0.001, time + this.stepTime * 0.9);

        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start(time);
        osc.stop(time + this.stepTime * 0.9);
    }
}

const audio = new AudioEngine();
window.audioEngine = audio;
