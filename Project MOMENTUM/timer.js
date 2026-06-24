/* ========================================
   MOMENTUM — timer.js
   Pomodoro Timer with animated ring
   ======================================== */

let pomoTotalSecs = 25 * 60;
let pomoRemaining = 25 * 60;
let pomoInterval = null;
let pomoRunning = false;
let pomoMode = 'focus';
let pomoSessionsToday = parseInt(localStorage.getItem('momentum_pomo_sessions') || '0');
let pomoAudioCtx = null;

const POMO_CIRCUMFERENCE = 2 * Math.PI * 85; // r=85

document.addEventListener('DOMContentLoaded', () => {
  updatePomoDisplay();
  updatePomoRing(1);
  updatePomoDots();
});

/* ---- Mode Switch ---- */
function setPomoMode(mode, minutes, button) {
  if (pomoRunning) { showToast('Stop the timer before switching modes', 'warning'); return; }
  pomoMode = mode;
  pomoTotalSecs = minutes * 60;
  pomoRemaining = pomoTotalSecs;
  document.querySelectorAll('.pomo-mode').forEach(b => b.classList.remove('active'));
  if (button) button.classList.add('active');

  const statuses = { focus: 'Focus Session', short: 'Short Break', long: 'Long Break' };
  document.getElementById('pomo-status').textContent = statuses[mode];
  updatePomoDisplay();
  updatePomoRing(1);
  showBtns('start');
}

/* ---- Controls ---- */
function startPomo() {
  if (pomoRunning) return;
  pomoRunning = true;
  showBtns('pause');
  tick();
  pomoInterval = setInterval(tick, 1000);
}

function pausePomo() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  showBtns('resume');
}

function resumePomo() {
  if (pomoRunning) return;
  pomoRunning = true;
  showBtns('pause');
  pomoInterval = setInterval(tick, 1000);
}

function resetPomo() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoRemaining = pomoTotalSecs;
  updatePomoDisplay();
  updatePomoRing(1);
  showBtns('start');
}

function showBtns(state) {
  const startBtn  = document.getElementById('pomo-start-btn');
  const pauseBtn  = document.getElementById('pomo-pause-btn');
  const resumeBtn = document.getElementById('pomo-resume-btn');
  startBtn.style.display  = state === 'start'  ? '' : 'none';
  pauseBtn.style.display  = state === 'pause'  ? '' : 'none';
  resumeBtn.style.display = state === 'resume' ? '' : 'none';
}

function tick() {
  if (pomoRemaining <= 0) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    onPomoComplete();
    return;
  }
  pomoRemaining--;
  updatePomoDisplay();
  updatePomoRing(pomoRemaining / pomoTotalSecs);
}

function updatePomoDisplay() {
  const mins = Math.floor(pomoRemaining / 60);
  const secs = pomoRemaining % 60;
  const timeEl = document.getElementById('pomo-time');
  if (timeEl) timeEl.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function updatePomoRing(fraction) {
  const ring = document.getElementById('pomo-ring');
  if (!ring) return;
  const offset = POMO_CIRCUMFERENCE - fraction * POMO_CIRCUMFERENCE;
  ring.style.strokeDashoffset = offset;
  ring.style.transition = pomoRunning ? 'stroke-dashoffset 1s linear' : 'none';
}

function onPomoComplete() {
  playDing();
  if (pomoMode === 'focus') {
    pomoSessionsToday++;
    localStorage.setItem('momentum_pomo_sessions', pomoSessionsToday);
    updatePomoDots();
    showToast('🍅 Focus session complete! Take a break!', 'success');
    document.getElementById('pomo-status').textContent = 'Session Complete!';
  } else {
    showToast('Break over! Time to focus 💪', 'info');
    setPomoMode('focus', 25);
    return;
  }
  showBtns('start');
  pomoRemaining = 0;
  updatePomoRing(0);
}

function updatePomoDots() {
  const dotsEl = document.getElementById('pomo-dots');
  if (!dotsEl) return;
  const dots = ['○','○','○','○'];
  for (let i = 0; i < Math.min(pomoSessionsToday, 4); i++) {
    dots[i] = '🍅';
  }
  dotsEl.textContent = dots.join(' ');
}

/* ---- Simple beep using Web Audio API ---- */
function playDing() {
  try {
    if (!pomoAudioCtx) pomoAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = pomoAudioCtx.createOscillator();
    const gain = pomoAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(pomoAudioCtx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, pomoAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, pomoAudioCtx.currentTime + 1.5);
    osc.start(pomoAudioCtx.currentTime);
    osc.stop(pomoAudioCtx.currentTime + 1.5);
  } catch(e) { /* audio not available */ }
}