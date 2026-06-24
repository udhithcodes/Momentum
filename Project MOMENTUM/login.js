/* ========================================
   MOMENTUM — login.js
   Loading screen, particles, auth logic
   ======================================== */

/* ---- Loading Screen ---- */
window.addEventListener('DOMContentLoaded', () => {
  createLoaderParticles();
  createBgParticles();

  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 700);
  }, 2400);
});

function createLoaderParticles() {
  const container = document.getElementById('loader-particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      bottom:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*4+3}s;
      animation-delay:${Math.random()*3}s;
    `;
    container.appendChild(p);
  }
}

function createBgParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 1;
    const colors = ['#4F46E5', '#7C3AED', '#06B6D4'];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      bottom:-10px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*10+8}s;
      animation-delay:${Math.random()*8}s;
      animation-name:float-particle;
    `;
    container.appendChild(p);
  }
}

/* ---- Tab Switcher ---- */
function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  }
  clearErrors();
}

/* ---- Password Toggle ---- */
function togglePassword(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

/* ---- Validation Helpers ---- */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['login-email-err','login-pw-err','signup-name-err','signup-email-err','signup-pw-err']
    .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---- Toast ---- */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ---- Login Handler ---- */
function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;
  let valid = true;

  if (!email) { showError('login-email-err', 'Email is required'); valid = false; }
  else if (!isValidEmail(email)) { showError('login-email-err', 'Enter a valid email'); valid = false; }

  if (!password) { showError('login-pw-err', 'Password is required'); valid = false; }
  else if (password.length < 6) { showError('login-pw-err', 'Minimum 6 characters'); valid = false; }

  if (!valid) return;

  // Check if user exists in localStorage
  const users = JSON.parse(localStorage.getItem('momentum_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showToast('Invalid email or password', 'error');
    return;
  }

  // Show loading state
  const btn = document.getElementById('login-btn');
  btn.querySelector('.btn-text').style.display = 'none';
  btn.querySelector('.btn-loader').style.display = 'inline';
  btn.disabled = true;

  localStorage.setItem('momentum_current_user', JSON.stringify(user));
  if (remember) localStorage.setItem('momentum_remember', email);
  else localStorage.removeItem('momentum_remember');

  setTimeout(() => {
    showToast('Welcome back! Redirecting...');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  }, 1000);
}

/* ---- Signup Handler ---- */
function handleSignup(e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  let valid = true;

  if (!name) { showError('signup-name-err', 'Name is required'); valid = false; }
  if (!email) { showError('signup-email-err', 'Email is required'); valid = false; }
  else if (!isValidEmail(email)) { showError('signup-email-err', 'Enter a valid email'); valid = false; }
  if (!password) { showError('signup-pw-err', 'Password is required'); valid = false; }
  else if (password.length < 6) { showError('signup-pw-err', 'Minimum 6 characters'); valid = false; }

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem('momentum_users') || '[]');
  if (users.find(u => u.email === email)) {
    showError('signup-email-err', 'Email already registered');
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    avatar: null,
    joined: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('momentum_users', JSON.stringify(users));
  localStorage.setItem('momentum_current_user', JSON.stringify(newUser));

  showToast('Account created! Redirecting...');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
}

/* ---- Demo Login ---- */
function demoLogin() {
  const demoUser = {
    id: 'demo',
    name: 'Udhith',
    email: 'demo@momentum.app',
    password: 'demo123',
    avatar: null,
    joined: new Date().toISOString()
  };

  // Ensure demo user exists
  const users = JSON.parse(localStorage.getItem('momentum_users') || '[]');
  if (!users.find(u => u.id === 'demo')) {
    users.push(demoUser);
    localStorage.setItem('momentum_users', JSON.stringify(users));
  }

  localStorage.setItem('momentum_current_user', JSON.stringify(demoUser));
  showToast('Demo login successful! Redirecting...');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

/* ---- Forgot Password Modal ---- */
function showForgotModal() {
  document.getElementById('forgot-modal').classList.remove('hidden');
}

function closeForgotModal() {
  document.getElementById('forgot-modal').classList.add('hidden');
}

function sendReset() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!isValidEmail(email)) {
    alert('Please enter a valid email');
    return;
  }
  closeForgotModal();
  showToast('Reset link sent! (Check your email)');
}

/* ---- Auto-fill remembered email ---- */
window.addEventListener('load', () => {
  const remembered = localStorage.getItem('momentum_remember');
  if (remembered) {
    const emailField = document.getElementById('login-email');
    if (emailField) emailField.value = remembered;
    const rememberBox = document.getElementById('remember-me');
    if (rememberBox) rememberBox.checked = true;
  }

  // If already logged in, skip to dashboard
  const currentUser = localStorage.getItem('momentum_current_user');
  if (currentUser) {
    // Uncomment the line below to enable auto-redirect:
    // window.location.href = 'dashboard.html';
  }
});