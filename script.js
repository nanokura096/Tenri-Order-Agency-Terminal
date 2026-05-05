/* =========================
   CONFIG & STATE
========================= */
const database = {
  personnel: [
    { id: 'AP-000000', name: '鳴瀬 可楚', secret: true, record: '機密：因果律崩壊リスク。' }
  ]
};

const wait = (ms) => new Promise(res => setTimeout(res, ms));

/* =========================
   ANIMATION HELPERS
========================= */
async function typeLog(text, isDot = false) {
  const consoleEl = document.getElementById('loginConsole');
  if (!consoleEl) return; // 要素がなければ何もしない

  const div = document.createElement('div');
  div.innerHTML = text;
  consoleEl.appendChild(div);
  
  if (isDot) {
    for (let i = 0; i < 3; i++) {
      await wait(1000);
      div.innerHTML += '.';
    }
  }
}

/* =========================
   LOGIN SEQUENCE
========================= */
async function startSequence() {
  const consoleEl = document.getElementById('loginConsole');
  if (!consoleEl) return;
  consoleEl.innerHTML = ''; 

  // 1. Welcome & Loading
  await typeLog("Welcome to Tenri Network OS");
  await typeLog("Now Loading", true);
  await wait(500);

  // 2. ID Input
  await typeLog("<br>Enter ID");
  const idInput = document.createElement('input');
  idInput.type = "text";
  idInput.className = "terminal-input";
  idInput.autocomplete = "off"; // 拡張機能の干渉を防ぐ
  consoleEl.appendChild(idInput);
  
  // 50ミリ秒待ってからフォーカス（接続エラー対策）
  setTimeout(() => idInput.focus(), 50);

  idInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = idInput.value.trim();
      if (!val) return;
      
      idInput.disabled = true;
      await typeLog("<br>Checking with database", true);
      
      if (val === "admin") {
        await typeLog("<br>Welcome Naruse Kaso!");
        await wait(800);
        promptPassword();
      } else {
        await typeLog("<br><span style='color:var(--red)'>UNKNOWN ID. REBOOTING...</span>");
        await wait(2000);
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
  passInput.autocomplete = "off";
  consoleEl.appendChild(passInput);
  
  setTimeout(() => passInput.focus(), 50);

  passInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = passInput.value.trim();
      passInput.disabled = true;

      if (val === "226227") {
        await typeLog("<br>Checking with database..."); await wait(800);
        await typeLog("Loading System..."); await wait(600);
        await typeLog("Accessing to Database..."); await wait(600);
        await typeLog("Scanning Your Information..."); await wait(1000);
        await typeLog("<span style='color:var(--green); font-weight:bold;'>Success!</span>");
        await typeLog("Welcome to Tenri Network OS!");
        await wait(1500);
        
        // 画面切り替え
        const loginScreen = document.getElementById('loginScreen');
        const mainTerminal = document.getElementById('mainTerminal');
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainTerminal) mainTerminal.style.display = 'block';
      } else {
        await typeLog("<br><span style='color:var(--red)'>INVALID PASSWORD.</span>");
        await wait(2000);
        location.reload();
      }
    }
  });
}

/* =========================
   INITIALIZE
========================= */
// ページの読み込み状態を確認してから実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startSequence().catch(e => console.warn("Sequence Error:", e));
  });
} else {
  startSequence().catch(e => console.warn("Sequence Error:", e));
}