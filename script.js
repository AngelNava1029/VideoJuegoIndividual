// === Minimal Dodge con Sonidos ===

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const restart = document.getElementById("restart");

// --- Configuración Canvas ---
canvas.width = 600;
canvas.height = 500;

// --- Jugador ---
const player = { x: canvas.width / 2 - 25, y: canvas.height - 40, w: 50, h: 15, speed: 5 };

// --- Estado del juego ---
let obstacles = [];
let score = 0;
let running = true;
let spawnTimer = 0;

// --- Controles ---
let left = false, right = false;
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") left = true;
  if (e.key === "ArrowRight" || e.key === "d") right = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") left = false;
  if (e.key === "ArrowRight" || e.key === "d") right = false;
});

restart.onclick = () => reset();

// --- Sonidos básicos ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(freq = 440, duration = 0.1, type = "sine", volume = 0.2) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// --- Música de fondo (simple bucle) ---
let musicOsc;
function startMusic() {
  if (musicOsc) return;
  musicOsc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  musicOsc.type = "sine";
  musicOsc.frequency.value = 220;
  gain.gain.value = 0.05;
  musicOsc.connect(gain);
  gain.connect(audioCtx.destination);
  musicOsc.start();
}
function stopMusic() {
  if (musicOsc) {
    musicOsc.stop();
    musicOsc = null;
  }
}

// --- Reinicio del juego ---
function reset() {
  obstacles = [];
  score = 0;
  running = true;
  player.x = canvas.width / 2 - player.w / 2;
  scoreText.textContent = score;
  startMusic();
}

// --- Crear obstáculo ---
function spawnObstacle() {
  const w = 30 + Math.random() * 70;
  const x = Math.random() * (canvas.width - w);
  obstacles.push({ x, y: -20, w, h: 10, speed: 2 + Math.random() * 2 });
}

// --- Detección de colisión ---
function collides(a, b) {
  return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}

// --- Actualización del juego ---
function update() {
  if (!running) return;

  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  spawnTimer++;
  if (spawnTimer > 40) {
    spawnObstacle();
    spawnTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += o.speed;

    if (o.y > canvas.height) {
      obstacles.splice(i, 1);
      score++;
      scoreText.textContent = score;
      playBeep(800, 0.08, "square", 0.15); // sonido al ganar punto
    }

    if (collides(player, o)) {
      running = false;
      playBeep(120, 0.5, "sawtooth", 0.4); // sonido de choque
      stopMusic();
    }
  }
}

// --- Dibujar ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff44";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "#ff3333";
  for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);

  if (!running) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
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

// --- Iniciar ---
reset();
loop();
