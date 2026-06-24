/* ========================================
   MOMENTUM — analytics.js
   Animated canvas charts (no libs)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    drawWeeklyChart();
    drawSubjectChart();
  }, 600);
});

/* ========================================
   WEEKLY STUDY HOURS BAR CHART
   ======================================== */
function drawWeeklyChart() {
  const canvas = document.getElementById('weekly-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Build last 7 days data from tasks
  const days = [];
  const hours = [];
  const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = labels[d.getDay()];
    days.push(dayName);

    // Count tasks completed that day (estimate 1hr per task)
    const dayTasks = tasks.filter(t => t.date === dateStr && t.completed);
    const subHours = subjectData ? subjectData.reduce((a, s) => a + (s.hours / 30), 0) : 0;
    hours.push(dayTasks.length + (i === 0 ? subHours : 0));
  }

  const W = canvas.offsetWidth || 400;
  const H = 180;
  canvas.width = W;
  canvas.height = H;

  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;
  const maxVal = Math.max(...hours, 5);
  const barW = (chartW / days.length) * 0.55;
  const gap = (chartW / days.length) * 0.45;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
  }

  // Y axis labels
  ctx.fillStyle = 'rgba(148,163,184,0.7)';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = Math.round(maxVal - (maxVal / 4) * i);
    const y = padding.top + (chartH / 4) * i;
    ctx.fillText(`${val}h`, padding.left - 5, y + 4);
  }

  // Bars (animated)
  let animFrame = 0;
  const FRAMES = 40;

  function animateBars() {
    ctx.clearRect(0, 0, W, H);

    // Redraw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxVal - (maxVal / 4) * i);
      const y = padding.top + (chartH / 4) * i;
      ctx.fillText(`${val}h`, padding.left - 5, y + 4);
    }

    const progress = Math.min(animFrame / FRAMES, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    days.forEach((day, i) => {
      const x = padding.left + i * (chartW / days.length) + gap / 2;
      const barH = (hours[i] / maxVal) * chartH * ease;
      const y = padding.top + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (i === 6) { // today
        grad.addColorStop(0, '#06B6D4');
        grad.addColorStop(1, '#4F46E5');
      } else {
        grad.addColorStop(0, 'rgba(79,70,229,0.8)');
        grad.addColorStop(1, 'rgba(79,70,229,0.3)');
      }

      ctx.fillStyle = grad;
      const radius = 4;
      roundRect(ctx, x, y, barW, barH, radius);
      ctx.fill();

      // Day label
      ctx.fillStyle = 'rgba(148,163,184,0.8)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, x + barW / 2, H - 8);

      // Value on top
      if (hours[i] > 0 && ease > 0.9) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(`${hours[i].toFixed(1)}`, x + barW / 2, y - 4);
      }
    });

    animFrame++;
    if (animFrame <= FRAMES) requestAnimationFrame(animateBars);
  }

  requestAnimationFrame(animateBars);
}

/* ========================================
   SUBJECT DISTRIBUTION DONUT CHART
   ======================================== */
function drawSubjectChart() {
  const canvas = document.getElementById('subject-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const subjects = (typeof subjectData !== 'undefined') ? subjectData : [];
  const total = subjects.reduce((a, s) => a + s.hours, 0);
  const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'];

  const W = canvas.offsetWidth || 300;
  const H = 180;
  canvas.width = W;
  canvas.height = H;

  const cx = W / 2 - 40;
  const cy = H / 2;
  const R = Math.min(cx, cy) - 15;
  const r = R * 0.55;

  ctx.clearRect(0, 0, W, H);

  if (total === 0) {
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Log study hours to', cx, cy - 8);
    ctx.fillText('see distribution', cx, cy + 12);
    return;
  }

  let startAngle = -Math.PI / 2;
  let animFrame = 0;
  const FRAMES = 50;

  function animateDonut() {
    ctx.clearRect(0, 0, W, H);
    const progress = Math.min(animFrame / FRAMES, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    subjects.forEach((sub, i) => {
      if (sub.hours === 0) return;
      const slice = (sub.hours / total) * 2 * Math.PI * ease;
      const endAngle = startAngle + slice;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Inner circle cutout
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(15,23,42,0.98)';
      ctx.fill();

      startAngle += slice;
    });

    startAngle = -Math.PI / 2; // reset for next frame

    // Center text
    if (ease > 0.8) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `bold 16px Poppins, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${total.toFixed(1)}h`, cx, cy + 2);
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('total', cx, cy + 16);
    }

    // Legend
    const legendX = W - 90;
    const legendStartY = 20;
    subjects.forEach((sub, i) => {
      const ly = legendStartY + i * 28;
      ctx.fillStyle = colors[i % colors.length];
      roundRect(ctx, legendX, ly, 12, 12, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(241,245,249,0.8)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(sub.name, legendX + 18, ly + 9);
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(`${sub.hours}h`, legendX + 18, ly + 20);
    });

    animFrame++;
    if (animFrame <= FRAMES) requestAnimationFrame(animateDonut);
  }

  requestAnimationFrame(animateDonut);
}

/* ---- Rounded Rect helper ---- */
function roundRect(ctx, x, y, w, h, r) {
  if (h < 0) return;
  if (h < r * 2) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}