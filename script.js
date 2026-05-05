/* =========================
   CONFIG & STATE
========================= */
const database = {
  users: { "admin": "226227" },
  personnel: [
    { id: 'AP-000000', name: '鳴瀬 可楚', secret: true, record: '機密：因果律崩壊リスク。' }
  ]
};

let currentFile = null;
let secretAttempts = 0;

/* =========================
   ANIMATION HELPERS
========================= */
const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function typeLog(text, targetId = 'loginConsole', isDot = false) {
  const el = document.getElementById(targetId);
  const div = document.createElement('div');
  div.innerHTML = text;
  el.appendChild(div);
  
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
  
  // 1. Welcome & Loading
  await typeLog("Welcome to Tenri Network OS");
  await typeLog("Now Loading", 'loginConsole', true);
  await wait(500);

  // 2. ID Input
  await typeLog("<br>Enter ID");
  const idInput = document.createElement('input');
  idInput.type = "text";
  idInput.className = "terminal-input";
  consoleEl.appendChild(idInput);
  idInput.focus();

  idInput.onkeypress = async (e) => {
    if (e.key === 'Enter') {
      const val = idInput.value;
      idInput.disabled = true;
      await typeLog("<br>Checking with database", 'loginConsole', true);
      
      if (val === "admin") {
        await typeLog("<br>Welcome Naruse Kaso!");
        await wait(500);
        promptPassword();
      } else {
        await typeLog("<br>UNKNOWN ID. REBOOTING...");
        await wait(1500);
        location.reload();
      }
    }
  };
}

async function promptPassword() {
  const consoleEl = document.getElementById('loginConsole');
  await typeLog("<br>Enter PASSWORD");
  const passInput = document.createElement('input');
  passInput.type = "password";
  passInput.className = "terminal-input";
  consoleEl.appendChild(passInput);
  passInput.focus();

  passInput.onkeypress = async (e) => {
    if (e.key === 'Enter') {
      passInput.disabled = true;
      if (passInput.value === "226227") {
        await typeLog("<br>Checking with database...");
        await wait(800);
        await typeLog("Loading System...");
        await wait(600);
        await typeLog("Accessing to Database...");
        await wait(600);
        await typeLog("Scanning Your Information...");
        await wait(1000);
        await typeLog("<span style='color:var(--green)'>Success!</span>");
        await typeLog("Welcome to Tenri Network OS!");
        await wait(1500);
        enterMain();
      } else {
        await typeLog("<br><span style='color:var(--red)'>INVALID PASSWORD.</span>");
        await wait(1500);
        location.reload();
      }
    }
  };
}

function enterMain() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainTerminal').style.display = 'block';
}

/* 起動 */
document.addEventListener('DOMContentLoaded', startSequence);