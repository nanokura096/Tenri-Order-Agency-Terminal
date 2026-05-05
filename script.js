/* =========================
   DATABASE
========================= */
const database = {
  personnel: [
    {
      id: 'AP-000000',
      name: '鳴瀬 可楚',
      sex: 'FEMALE',
      age: '██',
      division: '鳴響',
      rank: 'Leader',
      ability: '因報',
      status: 'ACTIVE',
      secret: true,
      secretRecord: '因果律干渉により収容理論無効。単独行動時は監視班を配置。'
    },
    {
      id: 'AP-838383',
      name: '天城 ユウラ',
      sex: 'FEMALE',
      age: '17',
      division: 'Research',
      rank: 'Analyst',
      ability: '情報分解',
      status: 'MISSING',
      secret: true,
      secretRecord: '失踪前にSITE-256機密層への不正アクセス履歴あり。'
    },
    {
      id: 'AP-424242',
      name: '雨宮 レン',
      sex: 'MALE',
      age: '19',
      division: 'Security',
      rank: 'Guard',
      ability: '身体強化',
      status: 'ACTIVE',
      secret: false
    }
  ],
  objects: [
    {
      id: 'OBJ-220001',
      name: '黒箱',
      class: 'Keter',
      danger: 'HIGH',
      detail: '内部時間停止立方体。',
      secret: true,
      secretRecord: '内部に生体反応を検出。開封命令は永久凍結。'
    },
    {
      id: 'OBJ-889100',
      name: '模倣鏡',
      class: 'Euclid',
      danger: 'MEDIUM',
      detail: '映した対象と異なる表情を返す鏡。精神汚染報告あり。',
      secret: false
    },
    {
      id: 'OBJ-443210',
      name: '泣く人形',
      class: 'Safe',
      danger: 'LOW',
      detail: '深夜2時に涙を流す磁器人形。',
      secret: false
    }
  ]
};

const sfx = {
  boot: new Audio("boot.mp3"),
  click: new Audio("click.mp3"),
  error: new Audio("error.mp3"),
};

function playSound(name) {
  const audio = sfx[name];
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

let previousScreen = null;
const wait = (ms) => new Promise(res => setTimeout(res, ms));

/* =========================
   BOOT & LOGIN FLOW
========================= */
async function bootSystem() {
  // ★ここを追加：全音声を一度「空再生」してブラウザの制限を解く
  Object.values(sfx).forEach(a => {
    a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
  });

  document.getElementById('bootScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  await startSequence();
}

async function typeLog(text, isDot = false) {
  const consoleEl = document.getElementById('loginConsole');
  if (!consoleEl) return;
  const div = document.createElement('div');
  consoleEl.appendChild(div);
  const chars = text.match(/<[^>]+>|[^<]/g) || [];

  for (const char of chars) {
    div.innerHTML += char;
    consoleEl.scrollTop = consoleEl.scrollHeight;
    
    if (!char.startsWith('<')) playSound('click');
    
    await wait(15);
  } // ← ループの終わり

  // ★ここから下の処理が関数の「内側」に入っている必要があります
  if (isDot) {
    for (let i = 0; i < 3; i++) {
      await wait(700);
      div.innerHTML += '.';
      playSound('click');
    }
  }
} // ★ここが typeLog 関数の本当の終わり！★関数の終わりはここです


async function startSequence() {
  const consoleEl = document.getElementById('loginConsole');
  if (!consoleEl) return;
  consoleEl.innerHTML = '';

  await typeLog("Welcome to Tenri Network OS");
  await typeLog("Loading Kernel", true);
  await wait(300);
  await typeLog("<br>Enter ID");

  const idInput = document.createElement('input');
  idInput.type = "text";
  idInput.className = "terminal-input";
  consoleEl.appendChild(idInput);
  setTimeout(() => idInput.focus(), 50);

  idInput.addEventListener('input', () => playSound('click'));
  idInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = idInput.value.trim();
      if (!val) return;
      idInput.disabled = true;
      if (val === "admin") {
        await typeLog("<br>ID Verified.");
        await wait(300);
        promptPassword();
      } else {
        playSound('error');
        await typeLog("<br><span style='color:var(--red)'>UNKNOWN ID. REBOOTING...</span>");
        await wait(1500);
        location.reload();
      }
    }
  });
}

async function promptPassword() {
  const consoleEl = document.getElementById('loginConsole');
  await typeLog("<br>Enter PASSWORD");

  const passInput = document.createElement('input');
  passInput.type = "password";
  passInput.className = "terminal-input";
  consoleEl.appendChild(passInput);
  setTimeout(() => passInput.focus(), 50);

  passInput.addEventListener('input', () => playSound('click'));
  passInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = passInput.value.trim();
      passInput.disabled = true;

      if (val === "226227") {
        await typeLog("<br>Checking Credentials", true);
        playSound('boot'); // ★ここに追加
        await typeLog("<span style='color:var(--green);font-weight:bold;'>ACCESS GRANTED.</span>");
        await typeLog("Welcome, Administrator.");
        await wait(1000);

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainTerminal').style.display = 'flex';
        initTerminal();
      } else {
        playSound('error');
        await typeLog("<br><span style='color:var(--red)'>INVALID PASSWORD. ACCESS DENIED.</span>");
        await wait(1500);
        location.reload();
      }
    }
  });
}

/* =========================
   MAIN TERMINAL CORE
========================= */
function setOutput(html) {
  const output = document.getElementById('output');
  if (!output) return;
  output.innerHTML = `<div>${html}</div>`;
  output.scrollTop = 0;
  playSound('click');
}

function initTerminal() {
  previousScreen = null;
  setOutput(`
    Tenri Network OS initialized.<br>
    Administrator session connected.<br><br>
    Select command from buttons above.
  `);
}

function withBackButton(content) {
  return `
    ${content}
    <br><br>
    <button class="data-btn" onclick="goBack()">← BACK</button>
  `;
}

function goBack() {
  playSound('click');
  if (previousScreen) {
    previousScreen();
  } else {
    initTerminal();
  }
}

/* =========================
   COMMANDS
========================= */
function helpCommand() {
  previousScreen = initTerminal;
  setOutput(withBackButton(`
    === SYSTEM HELP ===<br>
    - PERSONNEL : View staff records<br>
    - OBJECTS   : View contained objects<br>
    - SECRET    : Access high-clearance data<br>
    - LOGOUT    : Termination session
  `));
}

function showPersonnelButtons() {
  previousScreen = initTerminal;
  let html = `=== PERSONNEL DATABASE ===<br>`;
  database.personnel.forEach(p => {
    html += `<button class="data-btn" onclick="searchDatabase('${p.id}')">${p.id} : ${p.name}</button><br>`;
  });
  setOutput(withBackButton(html));
}

function showObjectButtons() {
  previousScreen = initTerminal;
  let html = `=== OBJECT DATABASE ===<br>`;
  database.objects.forEach(o => {
    html += `<button class="data-btn" onclick="searchDatabase('${o.id}')">${o.id} : ${o.name}</button><br>`;
  });
  setOutput(withBackButton(html));
}

function searchDatabase(keyword) {
  const p = database.personnel.find(x => x.id === keyword);
  if (p) {
    previousScreen = showPersonnelButtons;
    setOutput(withBackButton(`
      <div class="info-panel">
        ID: ${p.id}<br>
        NAME: ${p.name}<br>
        DIVISION: ${p.division}<br>
        RANK: ${p.rank}<br>
        STATUS: ${p.status}
      </div>
      ${p.secret ? '<div class="secret-detected">[ SECRET RECORD AVAILABLE IN SECRET TAB ]</div>' : ''}
    `));
    return;
  }

  const o = database.objects.find(x => x.id === keyword);
  if (o) {
    previousScreen = showObjectButtons;
    setOutput(withBackButton(`
      <div class="info-panel">
        ID: ${o.id}<br>
        NAME: ${o.name}<br>
        CLASS: ${o.class}<br>
        DANGER: ${o.danger}<br>
        DETAIL: ${o.detail}
      </div>
      ${o.secret ? '<div class="secret-detected">[ SECRET RECORD AVAILABLE IN SECRET TAB ]</div>' : ''}
    `));
    return;
  }
}

/* =========================
   SECRET SYSTEM
========================= */
function openSecretAuth() {
  playSound('click');
  document.getElementById('secretAuth').style.display = 'flex';
  document.getElementById('secretPassInput').value = '';
  document.getElementById('secretError').innerHTML = '';
  setTimeout(() => document.getElementById('secretPassInput').focus(), 50);
}

function closeSecretAuth() {
  playSound('click');
  document.getElementById('secretAuth').style.display = 'none';
}

function confirmSecretAccess() {
  const val = document.getElementById('secretPassInput').value.trim();
  if (val === "LEVEL4") {
    playSound('boot');
    document.getElementById('secretAuth').style.display = 'none';
    showSecretMenu();
  } else {
    playSound('error');
    document.getElementById('secretError').innerHTML = 'ACCESS DENIED.';
  }
}

function showSecretMenu() {
  previousScreen = initTerminal;
  setOutput(withBackButton(`
    === CLASSIFIED RECORDS ===<br>
    <button class="data-btn" onclick="showSecretPersonnel()">SECRET PERSONNEL</button><br>
    <button class="data-btn" onclick="showSecretObjects()">SECRET OBJECTS</button>
  `));
}

function showSecretPersonnel() {
  previousScreen = showSecretMenu;
  let html = `=== TOP SECRET PERSONNEL ===<br>`;
  database.personnel.filter(p => p.secret).forEach(p => {
    html += `<button class="data-btn" onclick="openSecretFile('P','${p.id}')">${p.name}</button><br>`;
  });
  setOutput(withBackButton(html));
}

function showSecretObjects() {
  previousScreen = showSecretMenu;
  let html = `=== TOP SECRET OBJECTS ===<br>`;
  database.objects.filter(o => o.secret).forEach(o => {
    html += `<button class="data-btn" onclick="openSecretFile('O','${o.id}')">${o.name}</button><br>`;
  });
  setOutput(withBackButton(html));
}

function openSecretFile(type, id) {
  playSound('click');
  const target = type === 'P' ? database.personnel.find(x => x.id === id) : database.objects.find(x => x.id === id);
  previousScreen = type === 'P' ? showSecretPersonnel : showSecretObjects;
  setOutput(withBackButton(`
    <div style="color:var(--red)">[ CLASSIFIED RECORD ]</div><br>
    TARGET: ${target.name}<br><br>
    ${target.secretRecord}
  `));
}

/* =========================
   LOGOUT
========================= */
function openLogoutConfirm() {
  playSound('click');
  document.getElementById('logoutConfirm').style.display = 'flex';
}

function closeLogoutConfirm() {
  playSound('click');
  document.getElementById('logoutConfirm').style.display = 'none';
}

async function confirmLogout() {
  playSound('click');
  const box = document.querySelector('#logoutConfirm .terminal-box');
  box.innerHTML = `<div id="rebootLog"></div>`;
  const rebootLog = document.getElementById('rebootLog');

  async function rbType(text) {
    const d = document.createElement('div');
    d.innerHTML = text;
    rebootLog.appendChild(d);
    playSound('click');
    await wait(500);
  }

  await rbType("Closing session...");
  await rbType("Clearing cache...");
  await rbType("Rebooting...");
  await wait(500);
  location.reload();
}

/* =========================
   INITIALIZE
========================= */
window.addEventListener('DOMContentLoaded', () => {
  const bootBtn = document.getElementById('bootScreen');
  if (bootBtn) {
    // ↓ ここに async を追加！
    bootBtn.addEventListener('click', async () => { 
      await bootSystem(); 
    }, { once: true });
  }
});