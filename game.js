const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game settings
const GRID_SIZE = 10; // each block is 10x10 pixels
const TILE_COUNT = canvas.width / GRID_SIZE;
let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let speed = 100; // lower is faster
let gameLoopId = null;
let isPlaying = false;
let directionQueue = []; // to prevent rapid inputs causing self-collisions

// deus colors
const COLOR_DARK = '#182613';

// Init
function resetGame() {
    snake = [
        { x: Math.floor(TILE_COUNT / 2), y: Math.floor(TILE_COUNT / 2) },
        { x: Math.floor(TILE_COUNT / 2) - 1, y: Math.floor(TILE_COUNT / 2) },
        { x: Math.floor(TILE_COUNT / 2) - 2, y: Math.floor(TILE_COUNT / 2) }
    ];
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.innerText = '000';
    directionQueue = [];
    speed = 120;
    placeFood();
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        valid = true;
        // make sure food isn't on a snake segment
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                valid = false;
                break;
            }
        }
    }
}

function update() {
    if (!isPlaying) return;

    if (directionQueue.length > 0) {
        const nextDir = directionQueue.shift();
        dx = nextDir.dx;
        dy = nextDir.dy;
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Walls collision (wrap around screen - classic snake behavior or death behavior)
    // We will do Death behavior for a challenge
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.innerText = score.toString().padStart(3, '0');
        if (speed > 50) speed -= 2; // getting faster
        placeFood();
    } else {
        snake.pop(); // remove tail
    }
}

function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid border (optional, deus snake had a simple rect)
    ctx.strokeStyle = COLOR_DARK;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    // Draw food (diamond or simple square)
    ctx.fillStyle = COLOR_DARK;
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        if (i === 0) {
            // Head is fully filled
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        } else {
            // Body has a little gap to simulate pixels
            ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        }
    }
}

function gameLoop() {
    update();
    draw();
    if (isPlaying) {
        setTimeout(gameLoop, speed);
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    resetGame();
    isPlaying = true;
    gameLoop();
}

function gameOver() {
    isPlaying = false;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// Input Handling
function setDirection(newDx, newDy) {
    if (!isPlaying) return;

    // Prevent 180 degree turns
    const lastDir = directionQueue.length > 0
        ? directionQueue[directionQueue.length - 1]
        : { dx, dy };

    if (newDx !== 0 && lastDir.dx === newDx) return;
    if (newDy !== 0 && lastDir.dy === newDy) return;
    if (newDx !== 0 && lastDir.dx === -newDx) return; // inverse
    if (newDy !== 0 && lastDir.dy === -newDy) return; // inverse

    directionQueue.push({ dx: newDx, dy: newDy });
}

// Keyboard input
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            setDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            setDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            setDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            setDirection(1, 0);
            break;
    }
});

// Mobile Controls
document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(0, -1); });
document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(0, 1); });
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(-1, 0); });
document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(1, 0); });

// Make buttons work with mouse clicks too
document.getElementById('btn-up').addEventListener('mousedown', () => setDirection(0, -1));
document.getElementById('btn-down').addEventListener('mousedown', () => setDirection(0, 1));
document.getElementById('btn-left').addEventListener('mousedown', () => setDirection(-1, 0));
document.getElementById('btn-right').addEventListener('mousedown', () => setDirection(1, 0));

// Swipe Support
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

document.addEventListener('touchmove', e => {
    // Prevent default scrolling on game container swipe
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, { passive: false });

function handleSwipe(startX, startY, endX, endY) {
    if (!isPlaying) return;

    const diffX = endX - startX;
    const diffY = endY - startY;

    // Threshold for swipe
    if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) setDirection(1, 0);
        else setDirection(-1, 0);
    } else {
        // Vertical swipe
        if (diffY > 0) setDirection(0, 1);
        else setDirection(0, -1);
    }
}

startBtn.addEventListener('click', startGame);
startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); });

restartBtn.addEventListener('click', startGame);
restartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); });

// Initial render
draw();
