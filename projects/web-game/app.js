/* CosmicBlast - Game Engine */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W, H;
function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W; canvas.height = H;
}
resize();
window.addEventListener('resize', resize);

// Game State
let game = {
    state: 'menu', // menu, playing, paused, gameover
    score: 0, lives: 3, level: 1, kills: 0,
    highScore: parseInt(localStorage.getItem('cb_highscore')) || 0,
    leaderboard: JSON.parse(localStorage.getItem('cb_leaderboard')) || []
};

// Player
let player = { x: 0, y: 0, w: 40, h: 40, speed: 5, shootCooldown: 0, invincible: 0 };
let bullets = [], enemies = [], particles = [], stars = [], powerups = [];
let keys = {};
let spawnTimer = 0, levelTimer = 0;

// Init stars
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * W, y: Math.random() * H,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1 + 0.3,
            brightness: Math.random() * 0.5 + 0.3
        });
    }
}

// DOM
const DOM = {
    menuScreen: document.getElementById('menuScreen'),
    pauseScreen: document.getElementById('pauseScreen'),
    gameoverScreen: document.getElementById('gameoverScreen'),
    mobileControls: document.getElementById('mobileControls'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    livesDisplay: document.getElementById('livesDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    highScoreDisplay: document.getElementById('highScoreDisplay'),
    goScore: document.getElementById('goScore'),
    goLevel: document.getElementById('goLevel'),
    goKills: document.getElementById('goKills'),
    playerName: document.getElementById('playerName'),
    leaderboardList: document.getElementById('leaderboardList')
};

// Events
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; keys[e.code] = false; });

document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p' && game.state === 'playing') togglePause();
    if (e.key.toLowerCase() === 'p' && game.state === 'paused') togglePause();
});

document.getElementById('playBtn').addEventListener('click', startGame);
document.getElementById('retryBtn').addEventListener('click', startGame);
document.getElementById('menuBtn').addEventListener('click', showMenu);
document.getElementById('resumeBtn').addEventListener('click', togglePause);

// Mobile controls
const isMobile = 'ontouchstart' in window;
if (isMobile) {
    document.querySelectorAll('.dpad-btn, .fire-btn').forEach(btn => {
        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            const key = btn.dataset.key;
            if (key === 'up') keys['w'] = true;
            if (key === 'down') keys['s'] = true;
            if (key === 'left') keys['a'] = true;
            if (key === 'right') keys['d'] = true;
            if (key === 'fire') keys['Space'] = true;
        });
        btn.addEventListener('touchend', e => {
            e.preventDefault();
            const key = btn.dataset.key;
            if (key === 'up') keys['w'] = false;
            if (key === 'down') keys['s'] = false;
            if (key === 'left') keys['a'] = false;
            if (key === 'right') keys['d'] = false;
            if (key === 'fire') keys['Space'] = false;
        });
    });
}

function startGame() {
    game.state = 'playing';
    game.score = 0; game.lives = 3; game.level = 1; game.kills = 0;
    player = { x: W / 2, y: H - 80, w: 40, h: 40, speed: 5, shootCooldown: 0, invincible: 60 };
    bullets = []; enemies = []; particles = []; powerups = [];
    spawnTimer = 0; levelTimer = 0;
    initStars();
    DOM.menuScreen.style.display = 'none';
    DOM.gameoverScreen.style.display = 'none';
    DOM.pauseScreen.style.display = 'none';
    if (isMobile) DOM.mobileControls.style.display = 'flex';
    updateHUD();
}

function showMenu() {
    game.state = 'menu';
    DOM.menuScreen.style.display = 'flex';
    DOM.gameoverScreen.style.display = 'none';
    DOM.pauseScreen.style.display = 'none';
    if (isMobile) DOM.mobileControls.style.display = 'none';
    renderLeaderboard();
}

function togglePause() {
    if (game.state === 'playing') {
        game.state = 'paused';
        DOM.pauseScreen.style.display = 'flex';
    } else if (game.state === 'paused') {
        game.state = 'playing';
        DOM.pauseScreen.style.display = 'none';
    }
}

function gameOver() {
    game.state = 'gameover';
    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('cb_highscore', game.highScore);
    }
    DOM.goScore.textContent = game.score;
    DOM.goLevel.textContent = game.level;
    DOM.goKills.textContent = game.kills;
    DOM.gameoverScreen.style.display = 'flex';
    if (isMobile) DOM.mobileControls.style.display = 'none';

    // Save to leaderboard
    const name = DOM.playerName.value.trim() || 'Player';
    game.leaderboard.push({ name, score: game.score, level: game.level });
    game.leaderboard.sort((a, b) => b.score - a.score);
    game.leaderboard = game.leaderboard.slice(0, 10);
    localStorage.setItem('cb_leaderboard', JSON.stringify(game.leaderboard));
}

function updateHUD() {
    DOM.scoreDisplay.textContent = game.score;
    DOM.livesDisplay.textContent = game.lives;
    DOM.levelDisplay.textContent = game.level;
    DOM.highScoreDisplay.textContent = game.highScore;
}

function renderLeaderboard() {
    DOM.highScoreDisplay.textContent = game.highScore;
    const ranks = ['gold', 'silver', 'bronze'];
    DOM.leaderboardList.innerHTML = game.leaderboard.length === 0
        ? '<p style="color:var(--text3);font-size:0.85rem;padding:8px">Belum ada skor</p>'
        : game.leaderboard.slice(0, 5).map((item, i) =>
            `<div class="lb-item"><span class="lb-rank ${ranks[i] || 'normal'}">${i + 1}</span><span class="lb-name">${item.name}</span><span class="lb-score">${item.score}</span></div>`
        ).join('');
}

// Game Loop
function gameLoop() {
    if (game.state === 'playing') {
        update();
        draw();
    } else if (game.state === 'menu') {
        drawMenuBg();
    } else if (game.state === 'paused') {
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    // Player movement
    if (keys['a'] || keys['arrowleft']) player.x -= player.speed;
    if (keys['d'] || keys['arrowright']) player.x += player.speed;
    if (keys['w'] || keys['arrowup']) player.y -= player.speed;
    if (keys['s'] || keys['arrowdown']) player.y += player.speed;

    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
    player.y = Math.max(player.h / 2, Math.min(H - player.h / 2, player.y));

    // Shoot
    if ((keys['Space'] || keys[' ']) && player.shootCooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - player.h / 2, w: 4, h: 12, speed: 8, type: 'player' });
        player.shootCooldown = 10;
        spawnParticles(player.x, player.y - player.h / 2, '#00e5c3', 3, 2);
    }
    if (player.shootCooldown > 0) player.shootCooldown--;
    if (player.invincible > 0) player.invincible--;

    // Bullets
    bullets.forEach(b => {
        if (b.type === 'player') b.y -= b.speed;
        else b.y += b.speed;
    });
    bullets = bullets.filter(b => b.y > -20 && b.y < H + 20);

    // Stars
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    });

    // Spawn enemies
    spawnTimer++;
    const spawnRate = Math.max(20, 60 - game.level * 5);
    if (spawnTimer >= spawnRate) {
        spawnTimer = 0;
        spawnEnemy();
    }

    // Level up
    levelTimer++;
    if (levelTimer >= 600) { // every ~10 seconds
        levelTimer = 0;
        game.level++;
        updateHUD();
    }

    // Enemy update
    enemies.forEach(e => {
        e.y += e.speed;
        e.x += Math.sin(e.wave) * e.amplitude;
        e.wave += e.waveSpeed;

        // Enemy shooting
        if (e.canShoot) {
            e.shootTimer--;
            if (e.shootTimer <= 0) {
                e.shootTimer = 60 + Math.random() * 60;
                bullets.push({ x: e.x, y: e.y + e.h / 2, w: 4, h: 10, speed: 4, type: 'enemy' });
            }
        }
    });

    // Collision: player bullets vs enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].type !== 'player') continue;
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (collides(bullets[i], enemies[j])) {
                enemies[j].hp--;
                spawnParticles(bullets[i].x, bullets[i].y, '#00e5c3', 5, 3);
                bullets.splice(i, 1);
                if (enemies[j].hp <= 0) {
                    game.score += enemies[j].points;
                    game.kills++;
                    spawnParticles(enemies[j].x, enemies[j].y, enemies[j].color, 15, 5);
                    // Drop powerup
                    if (Math.random() < 0.1) {
                        powerups.push({ x: enemies[j].x, y: enemies[j].y, type: 'life', w: 16, h: 16 });
                    }
                    enemies.splice(j, 1);
                    updateHUD();
                }
                break;
            }
        }
    }

    // Collision: enemy bullets vs player
    if (player.invincible <= 0) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i].type !== 'enemy') continue;
            if (collides(bullets[i], player)) {
                bullets.splice(i, 1);
                hitPlayer();
                break;
            }
        }

        // Collision: enemies vs player
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (collides(enemies[i], player)) {
                spawnParticles(enemies[i].x, enemies[i].y, enemies[i].color, 10, 4);
                enemies.splice(i, 1);
                hitPlayer();
                break;
            }
        }
    }

    // Powerups
    powerups.forEach(p => p.y += 1.5);
    for (let i = powerups.length - 1; i >= 0; i--) {
        if (collides(powerups[i], player)) {
            if (powerups[i].type === 'life') { game.lives = Math.min(game.lives + 1, 5); updateHUD(); }
            spawnParticles(powerups[i].x, powerups[i].y, '#4ade80', 10, 3);
            powerups.splice(i, 1);
        }
    }
    powerups = powerups.filter(p => p.y < H + 20);

    // Remove off-screen enemies
    enemies = enemies.filter(e => e.y < H + 50);

    // Particles
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        p.vx *= 0.98; p.vy *= 0.98;
    });
    particles = particles.filter(p => p.life > 0);
}

function hitPlayer() {
    game.lives--;
    player.invincible = 90;
    spawnParticles(player.x, player.y, '#ef4444', 20, 5);
    updateHUD();
    if (game.lives <= 0) gameOver();
}

function spawnEnemy() {
    const types = [
        { w: 30, h: 30, hp: 1, speed: 2, points: 10, color: '#ef4444', canShoot: false, amplitude: 0 },
        { w: 36, h: 36, hp: 2, speed: 1.5, points: 25, color: '#f59e0b', canShoot: true, amplitude: 1 },
        { w: 40, h: 40, hp: 3, speed: 1, points: 50, color: '#a855f7', canShoot: true, amplitude: 2 }
    ];
    const levelBonus = Math.min(game.level - 1, types.length - 1);
    const type = types[Math.floor(Math.random() * (1 + levelBonus))];
    enemies.push({
        x: Math.random() * (W - 60) + 30,
        y: -40,
        ...type,
        wave: Math.random() * Math.PI * 2,
        waveSpeed: 0.03 + Math.random() * 0.02,
        shootTimer: 60 + Math.random() * 120,
        speed: type.speed + game.level * 0.1
    });
}

function spawnParticles(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * speed;
        particles.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            size: Math.random() * 3 + 1,
            color,
            life: 1,
            decay: 0.02 + Math.random() * 0.02
        });
    }
}

function collides(a, b) {
    return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}

// Drawing
function draw() {
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
        ctx.fill();
    });

    // Powerups
    powerups.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#4ade80';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', 0, 6);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(74,222,128,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    });

    // Bullets
    bullets.forEach(b => {
        if (b.type === 'player') {
            const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            grad.addColorStop(0, '#00e5c3');
            grad.addColorStop(1, 'rgba(0,229,195,0.2)');
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = '#ef4444';
        }
        ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    });

    // Enemies
    enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        drawShip(ctx, e.w, e.h, e.color, true);
        ctx.restore();
    });

    // Player
    if (player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0) {
        // Blink
    } else {
        ctx.save();
        ctx.translate(player.x, player.y);
        drawShip(ctx, player.w, player.h, '#00e5c3', false);
        // Engine glow
        ctx.beginPath();
        ctx.moveTo(-8, player.h / 2);
        ctx.lineTo(0, player.h / 2 + 10 + Math.random() * 5);
        ctx.lineTo(8, player.h / 2);
        ctx.fillStyle = 'rgba(0,229,195,0.6)';
        ctx.fill();
        ctx.restore();
    }

    // Particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawShip(ctx, w, h, color, isEnemy) {
    ctx.beginPath();
    if (isEnemy) {
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-w / 2, -h / 2);
        ctx.lineTo(-w / 4, -h / 4);
        ctx.lineTo(0, -h / 2 + 5);
        ctx.lineTo(w / 4, -h / 4);
        ctx.lineTo(w / 2, -h / 2);
        ctx.closePath();
    } else {
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.lineTo(-w / 4, h / 4);
        ctx.lineTo(0, h / 2 - 5);
        ctx.lineTo(w / 4, h / 4);
        ctx.lineTo(w / 2, h / 2);
        ctx.closePath();
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawMenuBg() {
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);
    if (stars.length === 0) initStars();
    stars.forEach(s => {
        s.y += s.speed * 0.5;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
        ctx.fill();
    });
}

// Init
renderLeaderboard();
initStars();
gameLoop();
