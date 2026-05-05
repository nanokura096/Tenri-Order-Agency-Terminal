/* =========================
   DATABASE & STATE
========================= */
const database = {
  personnel: [
    { id: 'AP-000000', name: '鳴瀬 可楚', status: 'ACTIVE', secret: true, record: '機密：因果律崩壊リスク。' }
  ],
  objects: []
};

let currentFile = null;
let secretAttempts = 0;
const MAX_ATTEMPTS = 3;

/* =========================
   SCREEN CONTROL
========================= */
function showScreen(mode) {
  const ids = ['startupScreen', 'loginScreen', 'bootScreen', 'mainTerminal', 'clearanceAuth', 'amnesticOverlay'];
  ids.forEach(id => document.getElementById(id).style.display = 'none');

  if (['startup', 'login', 'auth'].includes(mode)) {
    const el = document.getElementById(mode === 'auth' ? 'clearanceAuth' : mode + 'Screen');
    el.style.display = 'flex';
  } else {
    document.getElementById(mode === 'main' ? 'mainTerminal' : mode + 'Screen').style.display = 'block';
  }
}

/* =========================
   CORE LOGIC
========================= */
function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (u === 'admin' && p === '226227') {
    showScreen('boot');
    startBoot();
  } else {
    document.getElementById('loginError').innerText = 'ACCESS DENIED';
  }
}

function startBoot() {
  const boot = document.getElementById('bootScreen');
  boot.innerHTML = '';
  const lines = ['KERNEL_INIT...', 'DB_CONNECTING...', 'READY.'];
  let i = 0;
  const itv = setInterval(() => {
    if (i >= lines.length) { clearInterval(itv); showScreen('main'); return; }
    boot.innerHTML += `<div>> ${lines[i]}</div>`;
    i++;
  }, 500);
}

function unlockRecord() {
  showScreen('auth');
  const input = document.getElementById('authInput');
  const err = document.getElementById('authError');
  input.value = ''; err.innerText = '';
  input.focus();

  document.getElementById('authConfirmBtn').onclick = () => {
    if (input.value === currentFile.id || input.value === '226227') {
      secretAttempts = 0;
      showScreen('main');
      document.getElementById('result').innerHTML = `<div class="glitch-bg">DECRYPTED:</div><br>${currentFile.record}`;
    } else {
      secretAttempts++;
      if (secretAttempts >= MAX_ATTEMPTS) executeAmnestic();
      else err.innerText = `ERR: ${secretAttempts}/${MAX_ATTEMPTS}`;
    }
  };
  document.getElementById('authCancelBtn').onclick = () => showScreen('main');
}

function executeAmnestic() {
  const o = document.getElementById('amnesticOverlay');
  o.style.display = 'flex';
  o.style.backgroundColor = '#fff';
  setTimeout(() => {
    o.style.backgroundColor = '#000';
    o.innerHTML = '<div style="color:white; text-align:center;">AMNESTIC PROTOCOL EXECUTED.</div>';
    setTimeout(() => location.reload(), 2500);
  }, 100);
}

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', () => {
  showScreen('startup');
  setTimeout(() => showScreen('login'), 1500);
  document.getElementById('loginBtn').onclick = login;
  document.getElementById('searchBtn').onclick = () => {
    const id = document.getElementById('staffId').value;
    currentFile = database.personnel.find(x => x.id === id);
    if (!currentFile) { document.getElementById('result').innerText = 'NOT FOUND'; return; }
    document.getElementById('tabs').style.display = 'flex';
    document.getElementById('result').innerHTML = `NAME: ${currentFile.name}<br><button onclick="unlockRecord()">> ACCESS SECRET</button>`;
  };
});