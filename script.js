// === Minimal Dodge Simple ===
// Esquiva los obstáculos que caen.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const restart = document.getElementById("restart");

// Ajuste básico del canvas
canvas.width = 600;
canvas.height = 500;

// --- Jugador ---
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 40,
  w: 50,
  h: 15,
  speed: 5,
};

// --- Estado del juego ---
let obstacles = [];
let score = 0;
let running = true;
let spawnTimer = 0;

// --- Controles ---
let left = false,
  right = false;

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") left = true;
  if (e.key === "ArrowRight" || e.key === "d") right = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") left = false;
  if (e.key === "ArrowRight" || e.key === "d") right = false;
});

// --- Reiniciar ---
restart.onclick = () => reset();

function reset() {
  obstacles = [];
  score = 0;
  running = true;
  player.x = canvas.width / 2 - player.w / 2;
  scoreText.textContent = score;
}

// --- Crear obstáculo ---
function spawnObstacle() {
  const w = 30 + Math.random() * 70;
  const x = Math.random() * (canvas.width - w);
  obstacles.push({ x, y: -20, w, h: 10, speed: 2 + Math.random() * 2 });
}

// --- Detección de colisión ---
function collides(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// --- Actualizar juego ---
function update() {
  if (!running) return;

  // Movimiento del jugador
  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  // Crear obstáculos cada cierto tiempo
  spawnTimer++;
  if (spawnTimer > 40) {
    spawnObstacle();
    spawnTimer = 0;
  }

  // Mover obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += o.speed;

    // Si sale de pantalla → +1 punto
    if (o.y > canvas.height) {
      obstacles.splice(i, 1);
      score++;
      scoreText.textContent = score;
    }

    // Si colisiona con el jugador → Game Over
    if (collides(player, o)) {
      running = false;
    }
  }
}

// --- Dibujar ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.fillStyle = "#00ff44";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Obstáculos
  ctx.fillStyle = "#ff3333";
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }

  // Texto
  if (!running) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }
}

// --- Bucle principal ---
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Iniciar
reset();
loop();
