class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dom Elements
        this.mainMenu = document.getElementById('main-menu');
        this.levelSelect = document.getElementById('level-select');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.hud = document.getElementById('hud');
        
        // Buttons
        document.getElementById('play-btn').onclick = () => { this.playBtnClick(); };
        document.getElementById('level-back-btn').onclick = () => { this.showMainMenu(); };
        document.getElementById('pause-btn').onclick = () => { this.pauseGame(); };
        document.getElementById('resume-btn').onclick = () => { this.resumeGame(); };
        document.getElementById('restart-btn').onclick = () => { this.restartLevel(); };
        document.getElementById('exit-btn').onclick = () => { this.exitToMenu(); };
        document.getElementById('retry-btn').onclick = () => { this.restartLevel(); };
        document.getElementById('go-exit-btn').onclick = () => { this.exitToMenu(); };
        document.getElementById('victory-ok-btn').onclick = () => { this.exitToMenu(); };

        // Color Customizer Setup
        this.playerColor1 = '#00ffcc';
        this.playerColor2 = '#000000';
        this.setupCustomizer();

        // Level cards click binding
        const cards = document.querySelectorAll('.level-card');
        cards.forEach(card => {
            card.onclick = () => {
                const idx = parseInt(card.getAttribute('data-level'));
                this.startLevel(idx);
            };
        });

        // Game state
        this.state = 'menu'; // menu, level_select, playing, paused, game_over, victory
        this.currentLevelIdx = 0;
        this.attempt = 1;
        
        // Physics constants
        this.gravity = 0.9;
        this.jumpForce = -13.5;
        this.shipThrust = -0.7;
        this.shipGravity = 0.55;
        
        // Player properties
        this.player = {
            x: 100,
            y: 0,
            vy: 0,
            w: 40,
            h: 40,
            rotation: 0,
            mode: 'cube', // cube, ship
            isGrounded: false,
            trail: []
        };
        
        // Input state
        this.keys = {};
        this.isMouseDown = false;
        
        // Camera / World properties
        this.cameraX = 0;
        this.groundY = 400; // 540 - 140 (ground is 140px high)
        this.levelWidth = 4500;
        
        // Particles array
        this.particles = [];
        
        // Setup Keyboard & Mouse Listeners
        this.setupInput();
        
        // LocalStorage progress
        this.loadProgress();

        // Start Loop
        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    playBtnClick() {
        window.audioEngine.playClick();
        this.mainMenu.classList.add('hidden');
        this.levelSelect.classList.remove('hidden');
        this.state = 'level_select';
    }

    showMainMenu() {
        window.audioEngine.playClick();
        this.levelSelect.classList.add('hidden');
        this.mainMenu.classList.remove('hidden');
        this.state = 'menu';
    }

    setupCustomizer() {
        const preview = document.getElementById('skin-preview');
        preview.style.backgroundColor = this.playerColor1;
        preview.style.border = `4px solid ${this.playerColor2}`;
        preview.style.color = this.playerColor1;

        // Color 1 selection
        const dots1 = document.querySelectorAll('[data-color]');
        dots1.forEach(dot => {
            dot.onclick = () => {
                window.audioEngine.playClick();
                dots1.forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                this.playerColor1 = dot.getAttribute('data-color');
                preview.style.backgroundColor = this.playerColor1;
                preview.style.color = this.playerColor1;
            };
        });

        // Color 2 selection
        const dots2 = document.querySelectorAll('[data-color2]');
        dots2.forEach(dot => {
            dot.onclick = () => {
                window.audioEngine.playClick();
                dots2.forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                this.playerColor2 = dot.getAttribute('data-color2');
                preview.style.border = `4px solid ${this.playerColor2}`;
            };
        });
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this.keys[e.code] = true;
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this.keys[e.code] = false;
            }
        });

        // Mouse/Touch triggers for controls
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state === 'playing') {
                this.isMouseDown = true;
            }
        });
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state === 'playing') {
                this.isMouseDown = true;
                e.preventDefault();
            }
        }, { passive: false });
        window.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });
    }

    startLevel(index) {
        window.audioEngine.playClick();
        this.currentLevelIdx = index;
        this.attempt = 1;
        this.resetGameVariables();
        
        this.levelSelect.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.state = 'playing';

        window.audioEngine.startMusic(this.currentLevelIdx);
    }

    resetGameVariables() {
        const level = LEVELS[this.currentLevelIdx];
        this.player.x = 100;
        this.player.y = this.groundY - this.player.h; // absolute canvas y (on the ground)
        this.player.vy = 0;
        this.player.rotation = 0;
        this.player.mode = 'cube';
        this.player.isGrounded = true;
        this.player.trail = [];
        this.cameraX = 0;
        this.particles = [];
        this.isMouseDown = false;
        this.keys = {};
        
        // Calc end point based on last obstacle
        const lastObstacle = level.obstacles[level.obstacles.length - 1];
        this.levelWidth = lastObstacle ? lastObstacle.x + 800 : 4000;

        document.getElementById('hud-attempt').innerText = this.attempt;
        this.hideAllScreens();
    }

    hideAllScreens() {
        this.mainMenu.classList.add('hidden');
        this.levelSelect.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
    }

    pauseGame() {
        if (this.state !== 'playing') return;
        window.audioEngine.playClick();
        window.audioEngine.stopMusic();
        this.state = 'paused';
        this.pauseScreen.classList.remove('hidden');
    }

    resumeGame() {
        window.audioEngine.playClick();
        this.pauseScreen.classList.add('hidden');
        this.state = 'playing';
        window.audioEngine.startMusic(this.currentLevelIdx);
    }

    restartLevel() {
        window.audioEngine.playClick();
        this.attempt++;
        this.resetGameVariables();
        this.state = 'playing';
        window.audioEngine.startMusic(this.currentLevelIdx);
    }

    exitToMenu() {
        window.audioEngine.playClick();
        window.audioEngine.stopMusic();
        this.hideAllScreens();
        this.hud.classList.add('hidden');
        this.levelSelect.classList.remove('hidden');
        this.state = 'level_select';
        this.loadProgress();
    }

    crashPlayer() {
        window.audioEngine.playCrash();
        window.audioEngine.stopMusic();
        this.state = 'game_over';
        
        // Spawn explosion particles
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: this.player.x + this.player.w / 2,
                y: this.player.y + this.player.h / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 8 + 4,
                color: Math.random() > 0.4 ? this.playerColor1 : this.playerColor2,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.015,
                rotation: Math.random() * Math.PI
            });
        }
        
        setTimeout(() => {
            if (this.state === 'game_over') {
                this.gameOverScreen.classList.remove('hidden');
            }
        }, 600);
    }

    completeLevel() {
        window.audioEngine.stopMusic();
        this.state = 'victory';
        
        // Save Progress
        const key = `neon-dash-progress-${this.currentLevelIdx}`;
        localStorage.setItem(key, '100');
        
        // Show victory screen
        setTimeout(() => {
            if (this.state === 'victory') {
                this.victoryScreen.classList.remove('hidden');
            }
        }, 500);
    }

    loadProgress() {
        for (let i = 0; i < LEVELS.length; i++) {
            const progress = localStorage.getItem(`neon-dash-progress-${i}`) || '0';
            const bar = document.getElementById(`progress-${i}`);
            if (bar) bar.style.width = `${progress}%`;
        }
    }

    checkJumpInput() {
        return this.keys['Space'] || this.keys['ArrowUp'] || this.isMouseDown;
    }

    updatePhysics() {
        const level = LEVELS[this.currentLevelIdx];
        
        // Move camera forward
        this.player.x += level.speed;
        this.cameraX = this.player.x - 200;

        // Mode specific physics
        if (this.player.mode === 'cube') {
            // Apply gravity (positive increases canvas Y, moving player down)
            this.player.vy += this.gravity;

            // Trigger jump (negative decreases canvas Y, moving player up)
            if (this.player.isGrounded && this.checkJumpInput()) {
                this.player.vy = this.jumpForce;
                this.player.isGrounded = false;
                window.audioEngine.playJump();
                
                // Add dust burst on jump
                for (let i = 0; i < 8; i++) {
                    this.particles.push({
                        x: this.player.x,
                        y: this.player.y + this.player.h,
                        vx: -Math.random() * 3 - 1,
                        vy: -Math.random() * 2,
                        size: Math.random() * 4 + 2,
                        color: '#ffffff',
                        alpha: 0.8,
                        decay: 0.05
                    });
                }
            }

            // Apply velocity to position
            this.player.y += this.player.vy;

            // Handle rotation
            if (!this.player.isGrounded) {
                this.player.rotation += 0.09; // Continual rotation in midair
            } else {
                // Snap rotation to nearest 90 degrees on floor landing
                const deg = this.player.rotation * (180 / Math.PI);
                const snappedDeg = Math.round(deg / 90) * 90;
                this.player.rotation = snappedDeg * (Math.PI / 180);
            }
        } else if (this.player.mode === 'ship') {
            // Spaceship mode physics (thrust decreases canvas Y, gravity increases it)
            if (this.checkJumpInput()) {
                this.player.vy += this.shipThrust;
            } else {
                this.player.vy += this.shipGravity;
            }
            
            // Limit ship speed
            this.player.vy = Math.max(-7, Math.min(7, this.player.vy));
            this.player.y += this.player.vy;

            // Align rotation to velocity vector
            this.player.rotation = this.player.vy * 0.05;
        }

        // Add trail points
        this.player.trail.push({ x: this.player.x + 10, y: this.player.y + this.player.h / 2 });
        if (this.player.trail.length > 20) this.player.trail.shift();

        // Floor / Ceiling check
        const floorLimit = this.groundY - this.player.h;
        if (this.player.y >= floorLimit) {
            this.player.y = floorLimit;
            this.player.vy = 0;
            this.player.isGrounded = true;
        }
        
        // Ship ceiling check
        if (this.player.mode === 'ship' && this.player.y <= 0) {
            this.player.y = 0;
            this.player.vy = 0;
        }

        // Progress calc
        const progress = Math.min(100, Math.floor((this.player.x / this.levelWidth) * 100));
        document.getElementById('hud-percent').innerText = `${progress}%`;
        document.getElementById('hud-progress-fill').style.width = `${progress}%`;

        // Victory check
        if (this.player.x >= this.levelWidth) {
            this.completeLevel();
        }

        // Check Collisions
        this.handleObstacleCollisions(level.obstacles);
    }

    handleObstacleCollisions(obstacles) {
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            
            // Convert obstacle height and relative position to absolute canvas Y coordinates
            const obsCanvasY = this.groundY - obs.y - obs.h;
            
            // AABB simple box check
            if (this.player.x < obs.x + obs.w &&
                this.player.x + this.player.w > obs.x &&
                this.player.y < obsCanvasY + obs.h &&
                this.player.y + this.player.h > obsCanvasY) {
                
                // Collision happened! Action depends on object type
                if (obs.type === 'spike') {
                    this.crashPlayer();
                    break;
                } 
                else if (obs.type === 'block') {
                    const p = this.player;
                    const prevX = p.x - 6; // estimate where player was before physics tick
                    
                    // Side collision (death)
                    if (prevX + p.w <= obs.x) {
                        this.crashPlayer();
                        break;
                    } 
                    // Landing on top of block (falling down onto the block)
                    else if (p.vy >= 0 && p.y + p.h - p.vy <= obsCanvasY + 8) {
                        p.y = obsCanvasY - p.h;
                        p.vy = 0;
                        p.isGrounded = true;
                    } 
                    // Ceiling hit (death or bounce depending on cube vs ship)
                    else {
                        if (p.mode === 'cube') {
                            this.crashPlayer(); // Hitting under blocks kills you in cube mode
                            break;
                        } else {
                            p.y = obsCanvasY + obs.h;
                            p.vy = 0.5;
                        }
                    }
                } 
                else if (obs.type === 'pad') {
                    // Jump Pad trigger (boosts player instantly)
                    this.player.vy = this.jumpForce * 1.25;
                    this.player.isGrounded = false;
                    window.audioEngine.playJump();
                    
                    // Spawn pad flash particles
                    for (let j = 0; j < 12; j++) {
                        this.particles.push({
                            x: obs.x + obs.w/2,
                            y: obsCanvasY,
                            vx: (Math.random() - 0.5) * 6,
                            vy: -Math.random() * 4 - 2,
                            size: Math.random() * 5 + 3,
                            color: '#ffdd00',
                            alpha: 1,
                            decay: 0.04
                        });
                    }
                } 
                else if (obs.type === 'orb') {
                    // Jump Orb triggers if jump button was just pressed this frame
                    if (this.checkJumpInput() && !this.orbTriggered) {
                        this.player.vy = this.jumpForce;
                        this.player.isGrounded = false;
                        window.audioEngine.playJump();
                        this.orbTriggered = true; // prevent repeated triggers on same frame

                        // Orb hit particles
                        for (let j = 0; j < 10; j++) {
                            this.particles.push({
                                x: obs.x + obs.w/2,
                                y: obsCanvasY + obs.h/2,
                                vx: (Math.random() - 0.5) * 8,
                                vy: (Math.random() - 0.5) * 8,
                                size: Math.random() * 6 + 2,
                                color: '#ffdd00',
                                alpha: 1,
                                decay: 0.05
                            });
                        }
                    }
                } 
                else if (obs.type === 'portal') {
                    // Mode changing portal
                    if (obs.mode && this.player.mode !== obs.mode) {
                        this.player.mode = obs.mode;
                        
                        // Spawn portal transition particles
                        for (let j = 0; j < 15; j++) {
                            this.particles.push({
                                x: obs.x + obs.w/2,
                                y: obsCanvasY + obs.h/2,
                                vx: (Math.random() - 0.5) * 10,
                                vy: (Math.random() - 0.5) * 10,
                                size: Math.random() * 5 + 2,
                                color: obs.mode === 'ship' ? '#ff007f' : '#00ffcc',
                                alpha: 1,
                                decay: 0.03
                            });
                        }
                    }
                }
            }
        }
        
        // Reset orb trigger state when not pressing jump buttons anymore
        if (!this.checkJumpInput()) {
            this.orbTriggered = false;
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.rotation !== undefined) p.rotation += 0.05;
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        const level = LEVELS[this.currentLevelIdx];
        
        // 1. Clear background & draw sky
        this.ctx.fillStyle = level.skyColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw sky grid lines for rhythm movement effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        const gridSpacing = 80;
        const offsetX = -this.cameraX % gridSpacing;
        for (let x = offsetX; x < this.canvas.width; x += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // 2. Draw ground
        this.ctx.fillStyle = level.groundColor;
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Ground top neon line
        this.ctx.strokeStyle = level.accentColor;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = level.accentColor;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0; // reset shadow

        // 3. Render Trail
        if (this.player.trail.length > 1) {
            this.ctx.strokeStyle = this.playerColor1;
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.trail[0].x - this.cameraX, this.player.trail[0].y);
            for (let i = 1; i < this.player.trail.length; i++) {
                this.ctx.lineTo(this.player.trail[i].x - this.cameraX, this.player.trail[i].y);
            }
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }

        // 4. Draw Obstacles
        obstacles_render:
        for (let i = 0; i < level.obstacles.length; i++) {
            const obs = level.obstacles[i];
            const drawX = obs.x - this.cameraX;
            const drawY = this.groundY - obs.y - obs.h; // absolute canvas coordinate

            // Check if offscreen to skip drawing
            if (drawX + obs.w < 0 || drawX > this.canvas.width) continue;

            if (obs.type === 'spike') {
                // Neon glowing spikes
                this.ctx.fillStyle = '#ff3366';
                this.ctx.shadowColor = '#ff3366';
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.moveTo(drawX, drawY + obs.h);
                this.ctx.lineTo(drawX + obs.w / 2, drawY);
                this.ctx.lineTo(drawX + obs.w, drawY + obs.h);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } 
            else if (obs.type === 'block') {
                // Futuristic neon-bordered block
                this.ctx.fillStyle = '#1e1e38';
                this.ctx.strokeStyle = level.accentColor;
                this.ctx.lineWidth = 2;
                this.ctx.fillRect(drawX, drawY, obs.w, obs.h);
                this.ctx.strokeRect(drawX, drawY, obs.w, obs.h);
            } 
            else if (obs.type === 'pad') {
                // Jump booster pad
                this.ctx.fillStyle = '#ffdd00';
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.fillRect(drawX, drawY, obs.w, obs.h);
                
                // Draw arrow/glow
                this.ctx.fillStyle = 'rgba(255, 221, 0, 0.4)';
                this.ctx.shadowColor = '#ffdd00';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(drawX - 2, drawY - 5, obs.w + 4, 3);
                this.ctx.shadowBlur = 0;
            } 
            else if (obs.type === 'orb') {
                // Floating Jump Orb
                const centerX = drawX + obs.w / 2;
                const centerY = drawY + obs.h / 2;
                
                this.ctx.fillStyle = 'rgba(0, 188, 255, 0.7)';
                this.ctx.strokeStyle = '#00ffcc';
                this.ctx.shadowColor = '#00ffcc';
                this.ctx.shadowBlur = 12;
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, obs.w/2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.shadowBlur = 0;
            } 
            else if (obs.type === 'portal') {
                // Transmutation Portal (Ship / Cube)
                const isShip = obs.mode === 'ship';
                const portalColor = isShip ? '#ff007f' : '#00ffcc';
                
                this.ctx.strokeStyle = portalColor;
                this.ctx.lineWidth = 3;
                this.ctx.shadowColor = portalColor;
                this.ctx.shadowBlur = 15;
                
                // Draw oval portal frame
                this.ctx.beginPath();
                this.ctx.ellipse(drawX + obs.w/2, drawY + obs.h/2, obs.w/2, obs.h/2, 0, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Wave inside portal
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.beginPath();
                this.ctx.ellipse(drawX + obs.w/2, drawY + obs.h/2, obs.w/4, obs.h/2.5, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.shadowBlur = 0;
            }
        }

        // 5. Draw Particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.translate(p.x - this.cameraX, p.y);
            if (p.rotation !== undefined) {
                this.ctx.rotate(p.rotation);
                this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        // 6. Draw Player Character
        if (this.state !== 'game_over') {
            const playerDrawX = this.player.x - this.cameraX;
            const playerDrawY = this.player.y;

            this.ctx.save();
            
            // Neon glow matching skin primary
            this.ctx.shadowColor = this.playerColor1;
            this.ctx.shadowBlur = 10;
            
            // Translate to center of player for rotation
            this.ctx.translate(playerDrawX + this.player.w / 2, playerDrawY + this.player.h / 2);
            this.ctx.rotate(this.player.rotation);

            if (this.player.mode === 'cube') {
                // Geometry cube skin
                this.ctx.fillStyle = this.playerColor1;
                this.ctx.fillRect(-this.player.w / 2, -this.player.h / 2, this.player.w, this.player.h);

                // Inner core/border face
                this.ctx.strokeStyle = this.playerColor2;
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(-this.player.w / 2.5, -this.player.h / 2.5, this.player.w * 0.8, this.player.h * 0.8);
                
                // Eyes/Face details
                this.ctx.fillStyle = this.playerColor2;
                this.ctx.fillRect(-this.player.w / 5, -this.player.h / 4, 6, 8);
                this.ctx.fillRect(this.player.w / 15, -this.player.h / 4, 6, 8);
                this.ctx.fillRect(-this.player.w / 4, this.player.h / 10, this.player.w / 2, 4);
            } else if (this.player.mode === 'ship') {
                // Spaceship skin
                this.ctx.fillStyle = this.playerColor1;
                this.ctx.beginPath();
                this.ctx.moveTo(-this.player.w / 2, -this.player.h / 4);
                this.ctx.lineTo(this.player.w / 2, 0); // nose
                this.ctx.lineTo(-this.player.w / 2, this.player.h / 4);
                this.ctx.closePath();
                this.ctx.fill();

                // Canopy / Cockpit
                this.ctx.fillStyle = this.playerColor2;
                this.ctx.beginPath();
                this.ctx.moveTo(-this.player.w / 8, -this.player.h / 12);
                this.ctx.lineTo(this.player.w / 4, 0);
                this.ctx.lineTo(-this.player.w / 8, this.player.h / 12);
                this.ctx.closePath();
                this.ctx.fill();
            }

            this.ctx.restore();
        }
    }

    convertY(physicsY) {
        return this.groundY - physicsY;
    }

    loop(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;

        if (this.state === 'playing') {
            this.updatePhysics();
            this.updateParticles();
            this.render();
        } else if (this.state === 'game_over') {
            this.updateParticles();
            this.render();
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Initialise the game
window.onload = () => {
    new Game();
};
