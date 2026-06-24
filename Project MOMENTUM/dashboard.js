/* ========================================
   MOMENTUM — dashboard.js
   Dashboard UI, task state, streaks, subjects, notifications
   ======================================== */

let tasks = JSON.parse(localStorage.getItem('momentum_tasks') || '[]');
let subjectData = JSON.parse(localStorage.getItem('momentum_subjects') || '[]');
let streakData = JSON.parse(localStorage.getItem('momentum_streak') || '{"current":0,"best":0,"daysStudied":0,"studiedDates":[]}');

const quotes = [
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Small daily improvements are the key to staggering long-term results.', author: 'James Clear' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Consistency is what transforms average into excellence.', author: 'Unknown' }
];

const badgeRules = [
  { label: 'Task Starter', icon: '📝', description: 'Added your first task', condition: () => tasks.length > 0 },
  { label: 'Task Finisher', icon: '✅', description: 'Completed at least one task', condition: () => tasks.some(t => t.completed) },
  { label: 'Streak Keeper', icon: '🔥', description: 'Maintained a study streak', condition: () => streakData.current >= 3 },
  { label: 'Pomodoro Pro', icon: '🍅', description: 'Completed 1+ pomodoro sessions', condition: () => parseInt(localStorage.getItem('momentum_pomo_sessions') || '0') > 0 }
];

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('momentum_current_user') || 'null');
}

function saveState() {
  localStorage.setItem('momentum_tasks', JSON.stringify(tasks));
  localStorage.setItem('momentum_subjects', JSON.stringify(subjectData));
  localStorage.setItem('momentum_streak', JSON.stringify(streakData));
}

function createBgParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 1;
    const colors = ['#4F46E5', '#7C3AED', '#06B6D4'];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*10+10}s;
      animation-delay:${Math.random()*8}s;
      animation-name:float-particle;
    `;
    container.appendChild(p);
  }
}

function initDashboard() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById('welcome-msg').textContent = `Good Morning, ${user.name.split(' ')[0] || user.email} 👋`;
    document.getElementById('pm-name').textContent = user.name || 'Momentum User';
    document.getElementById('pm-email').textContent = user.email || '';
    document.getElementById('profile-avatar-hdr').textContent = user.name ? user.name[0].toUpperCase() : '😊';
  }
  updateDateTime();
  renderAll();
}

function renderAll() {
  renderTasks();
  renderSubjects();
  renderBadges();
  renderProgress();
  renderStreak();
  newQuote(true);
}

function updateDateTime() {
  const now = new Date();
  const dateEl = document.getElementById('header-date');
  const clockEl = document.getElementById('header-clock');
  if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  if (clockEl) clockEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('global-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `global-toast show ${type}`;
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('dash-main');
  if (!sidebar || !main) return;
  const opened = sidebar.classList.contains('open');
  if (opened) {
    // Closing sidebar: hide it and allow main to expand
    sidebar.classList.remove('open');
    sidebar.classList.add('collapsed');
    main.classList.add('full-width');
  } else {
    // Opening sidebar: show it and push main content
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('open');
    main.classList.remove('full-width');
  }
}

function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  const avatar = document.querySelector('.profile-btn');
  if (!menu || !avatar) return;
  // Ensure menu is attached to body to avoid parent stacking context/clipping
  if (menu.parentElement !== document.body) {
    document.body.appendChild(menu);
    menu.style.position = 'fixed';
    menu.style.zIndex = '99999';
  }

  const rect = avatar.getBoundingClientRect();
  // Position menu below avatar and align right edge
  const top = Math.round(rect.bottom + 8);
  // Default left aligns menu's right edge with avatar's right edge
  const left = Math.round(rect.right - menu.offsetWidth);
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

  menu.classList.toggle('hidden');
}

// Reposition profile menu on resize to keep it aligned
window.addEventListener('resize', () => {
  const menu = document.getElementById('profile-menu');
  const avatar = document.querySelector('.profile-btn');
  if (!menu || !avatar || menu.classList.contains('hidden')) return;
  const rect = avatar.getBoundingClientRect();
  menu.style.top = `${Math.round(rect.bottom + 8)}px`;
  menu.style.left = `${Math.round(rect.right - menu.offsetWidth)}px`;
});

function smoothNav(event, link) {
  if (event) event.preventDefault();
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
  const target = document.querySelector(link.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('dash-main');
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (sidebar && main && sidebar.classList.contains('open') && isMobile) {
    sidebar.classList.remove('open');
    sidebar.classList.add('collapsed');
    main.classList.add('full-width');
  }
}

function openTaskModal() {
  const modal = document.getElementById('task-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.getElementById('task-subject').value = '';
  document.getElementById('task-start').value = '';
  document.getElementById('task-end').value = '';
  document.getElementById('task-notes').value = '';
  document.querySelectorAll('.pri-btn').forEach(btn => btn.classList.remove('active'));
  const firstBtn = document.querySelector('.pri-btn');
  if (firstBtn) firstBtn.classList.add('active');
}

function closeTaskModal() {
  const modal = document.getElementById('task-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function selectPriority(button) {
  document.querySelectorAll('.pri-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}

function saveTask() {
  const subject = document.getElementById('task-subject')?.value.trim();
  const startTime = document.getElementById('task-start')?.value;
  const endTime = document.getElementById('task-end')?.value;
  const notes = document.getElementById('task-notes')?.value.trim();
  const activePriority = document.querySelector('.pri-btn.active');
  const priority = activePriority ? activePriority.dataset.pri : 'Medium';

  if (!subject) {
    showToast('Please enter a subject name.', 'warning');
    return;
  }

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const newTask = {
    id: Date.now(),
    subject,
    startTime: startTime || '',
    endTime: endTime || '',
    priority,
    notes,
    completed: false,
    date
  };

  tasks.unshift(newTask);
  saveState();
  renderAll();
  closeTaskModal();
  showToast('Task added to your schedule.');
}

function renderTasks() {
  const list = document.getElementById('tasks-list');
  const empty = document.getElementById('tasks-empty');
  if (!list || !empty) return;

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const todaysTasks = tasks.filter(task => task.date === date);

  list.innerHTML = '';
  if (todaysTasks.length === 0) {
    list.appendChild(empty);
    return;
  }

  todaysTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    card.innerHTML = `
      <button class="task-check ${task.completed ? 'done' : ''}" onclick="toggleTaskComplete(${task.id})">
        ${task.completed ? '✓' : ''}
      </button>
      <div class="task-info">
        <div class="task-subject">${escapeHtml(task.subject)}</div>
        <div class="task-meta">
          ${task.startTime ? `<span class="task-time">${task.startTime}</span>` : ''}
          <span class="task-priority ${task.priority}">${task.priority}</span>
        </div>
        ${task.notes ? `<div class="task-notes-txt">${escapeHtml(task.notes)}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="task-btn" onclick="toggleTaskComplete(${task.id})">${task.completed ? 'Undo' : 'Done'}</button>
        <button class="task-btn del" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  saveState();
  renderAll();
  showToast(task.completed ? 'Task marked complete.' : 'Task marked incomplete.', 'success');
}

function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  saveState();
  renderAll();
  showToast('Task removed.', 'info');
}

function renderSubjects() {
  const grid = document.getElementById('subjects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (subjectData.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'subject-card glass-card';
    empty.innerHTML = `
      <div class="sub-icon">📘</div>
      <div class="sub-name">No logged subjects</div>
      <div class="sub-hours">Log hours to start tracking</div>
    `;
    grid.appendChild(empty);
    return;
  }

  subjectData.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card glass-card';
    const pct = Math.min(100, Math.round((sub.hours / 30) * 100));
    card.innerHTML = `
      <div class="sub-icon">📘</div>
      <div class="sub-name">${escapeHtml(sub.name)}</div>
      <div class="sub-hours">${sub.hours.toFixed(1)}h logged</div>
      <div class="sub-progress-track"><div class="sub-progress-fill" style="width:${pct}%"></div></div>
      <div class="sub-pct">${pct}% of goal</div>
    `;
    grid.appendChild(card);
  });
}

function saveSubjectHours() {
  const raw = document.getElementById('sub-hours')?.value;
  const hours = parseFloat(raw);
  if (Number.isNaN(hours) || hours <= 0) {
    showToast('Enter a valid number of hours.', 'warning');
    return;
  }

  const name = 'General Study';
  let subject = subjectData.find(s => s.name === name);
  if (!subject) {
    subject = { id: Date.now(), name, hours: 0 };
    subjectData.push(subject);
  }
  subject.hours += hours;
  saveState();
  closeSubjectModal();
  renderAll();
  showToast('Study hours logged successfully.');
}

function closeSubjectModal() {
  const modal = document.getElementById('subject-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function renderProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const remaining = total - completed;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = completed;
  document.getElementById('stat-remaining').textContent = remaining;
  document.getElementById('stat-score').textContent = `${score}`;

  const ring = document.getElementById('progress-ring-circle');
  const pct = score / 100;
  if (ring) {
    const circumference = 2 * Math.PI * 50;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference - circumference * pct}`;
  }
}

function renderStreak() {
  document.getElementById('streak-current').textContent = streakData.current;
  document.getElementById('best-streak').textContent = streakData.best;
  document.getElementById('days-studied').textContent = streakData.daysStudied;
}

function markStudied() {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (streakData.studiedDates.includes(todayKey)) {
    showToast('You already marked today studied.', 'info');
    return;
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
  streakData.current = streakData.studiedDates.includes(yesterdayKey) ? streakData.current + 1 : 1;
  streakData.best = Math.max(streakData.best, streakData.current);
  streakData.daysStudied += 1;
  streakData.studiedDates.push(todayKey);
  saveState();
  renderStreak();
  renderCalendar();
  showToast('Nice! Study streak updated.', 'success');
}

function renderBadges() {
  const grid = document.getElementById('badges-grid');
  if (!grid) return;
  grid.innerHTML = '';
  badgeRules.forEach(badge => {
    if (badge.condition()) {
      const card = document.createElement('div');
      card.className = 'badge-card glass-card';
      card.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div>
          <div class="badge-name">${badge.label}</div>
          <div class="badge-desc">${badge.description}</div>
        </div>
      `;
      grid.appendChild(card);
    }
  });
  if (!grid.children.length) {
    const empty = document.createElement('div');
    empty.className = 'badge-card glass-card';
    empty.innerHTML = '<div class="badge-icon">✨</div><div><div class="badge-name">No badges yet</div><div class="badge-desc">Complete tasks to earn achievements.</div></div>';
    grid.appendChild(empty);
  }
}

function newQuote(force = false) {
  const quoteCard = document.getElementById('quote-card');
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  if (!textEl || !authorEl) return;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  if (!force && quote.text === textEl.textContent) {
    return newQuote(true);
  }
  textEl.textContent = quote.text;
  authorEl.textContent = `— ${quote.author}`;
}

function logout() {
  localStorage.removeItem('momentum_current_user');
  window.location.href = 'index.html';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  createBgParticles();
  setInterval(updateDateTime, 1000);
});
