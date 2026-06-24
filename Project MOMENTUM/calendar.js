/* ========================================
   MOMENTUM — calendar.js
   Monthly calendar with task highlighting
   ======================================== */

let calYear, calMonth;

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
});

function renderCalendar() {
  const monthLabel = document.getElementById('cal-month-label');
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  monthLabel.textContent = `${months[calMonth]} ${calYear}`;

  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();

  grid.innerHTML = '';

  // Build set of dates with tasks
  const taskDates = new Set(tasks.map(t => t.date));
  const studiedDates = new Set(streakData.studiedDates || []);

  // Previous month padding
  for (let i = 0; i < firstDay; i++) {
    const day = daysInPrev - firstDay + 1 + i;
    const cell = createDayCell(day, true, false, false, false, null);
    grid.appendChild(cell);
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear());
    const hasTasks = taskDates.has(dateStr);
    const studied = studiedDates.has(dateStr);
    const cell = createDayCell(d, false, isToday, hasTasks, studied, dateStr);
    grid.appendChild(cell);
  }

  // Next month padding
  const totalCells = grid.children.length;
  const remaining = 42 - totalCells;
  for (let i = 1; i <= remaining; i++) {
    const cell = createDayCell(i, true, false, false, false, null);
    grid.appendChild(cell);
  }
}

function createDayCell(day, otherMonth, isToday, hasTasks, studied, dateStr) {
  const cell = document.createElement('div');
  cell.className = `cal-day${otherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}${hasTasks ? ' has-tasks' : ''}${studied ? ' studied' : ''}`;
  cell.textContent = day;
  if (dateStr) {
    cell.onclick = () => showDayTasks(dateStr, day);
    cell.title = hasTasks ? 'Click to view tasks' : '';
  }
  return cell;
}

function showDayTasks(dateStr, day) {
  const popup = document.getElementById('day-popup');
  const title = document.getElementById('day-popup-title');
  const body = document.getElementById('day-popup-body');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const [y, m, d] = dateStr.split('-').map(Number);
  title.textContent = `${months[m-1]} ${d}, ${y}`;

  const dayTasks = tasks.filter(t => t.date === dateStr);
  if (dayTasks.length === 0) {
    body.innerHTML = '<p style="color:var(--text-muted);font-size:0.82rem">No tasks scheduled for this day.</p>';
  } else {
    body.innerHTML = dayTasks.map(t => `
      <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0;border-bottom:1px solid var(--glass-border)">
        <span style="font-size:0.7rem;padding:2px 8px;border-radius:20px;background:rgba(79,70,229,0.15);color:#A5B4FC">${t.priority}</span>
        <span style="font-size:0.85rem;font-weight:500;${t.completed ? 'text-decoration:line-through;opacity:0.5':''}">${escHtml(t.subject)}</span>
        ${t.startTime ? `<span style="font-size:0.72rem;color:var(--text-muted);margin-left:auto">${t.startTime}</span>` : ''}
        <span>${t.completed ? '✅' : '⏳'}</span>
      </div>
    `).join('');
  }

  popup.classList.remove('hidden');
}

function closeDayPopup() {
  document.getElementById('day-popup').classList.add('hidden');
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
  closeDayPopup();
}