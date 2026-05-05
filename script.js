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
      record: '機密：因果律崩壊リスク。対象は因果律へ直接干渉可能。'
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
      secret: false,
      record: '最終確認：SITE-256下層区域。'
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
      secret: false,
      record: '警備班所属。'
    }
  ]
};

const wait = (ms) => new Promise(res => setTimeout(res, ms));

/* =========================
   LOGIN ANIMATION
========================= */
async function typeLog(text, isDot = false) {
  const consoleEl = document.getElementById('loginConsole');
  if (!consoleEl) return;

  const div = document.createElement('div');
  div.innerHTML = text;
  consoleEl.appendChild(div);
  consoleEl.scrollTop = consoleEl.scrollHeight;

  if (isDot) {
    for (let i = 0; i < 3; i++) {
      await wait(700);
      div.innerHTML += '.';
    }
  }
}

async function startSequence() {
  const consoleEl = document.getElementById('loginConsole');
  if (!consoleEl) return;

  consoleEl.innerHTML = '';

  await typeLog("Welcome to Tenri Network OS");
  await typeLog("Now Loading", true);
  await wait(500);

  await typeLog("<br>Enter ID");

  const idInput = document.createElement('input');
  idInput.type = "text";
  idInput.className = "terminal-input";
  idInput.autocomplete = "off";
  consoleEl.appendChild(idInput);

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
        await typeLog("<br>Checking with database", true);
        await typeLog("Loading System", true);
        await typeLog("Accessing to Database", true);
        await typeLog("Scanning Your Information", true);
        await typeLog("<span style='color:var(--green);font-weight:bold;'>Success!</span>");
        await typeLog("Welcome to Tenri Network OS!");
        await wait(1500);

        const login = document.getElementById('loginScreen');
        const main = document.getElementById('mainTerminal');

        if (login) login.style.display = 'none';
        if (main) main.style.display = 'flex';

        setTimeout(() => {
          initTerminal();
        }, 100);

      } else {
        await typeLog("<br><span style='color:var(--red)'>INVALID PASSWORD. REBOOTING...</span>");
        await wait(2000);
        location.reload();
      }
    }
  });
}

/* =========================
   MAIN TERMINAL
========================= */
function printOutput(html) {
  const output = document.getElementById('output');
  output.innerHTML += `<div>${html}</div>`;
  output.scrollTop = output.scrollHeight;
}

function searchPersonnel(keyword) {
  const found = database.personnel.find(p =>
    p.id.toLowerCase() === keyword.toLowerCase() ||
    p.name.toLowerCase() === keyword.toLowerCase()
  );

  if (!found) {
    printOutput(`<span style="color:var(--red)">NO DATA FOUND.</span>`);
    return;
  }

  printOutput(`
╔════════════════════════════╗<br>
 ID : ${found.id}<br>
 NAME : ${found.name}<br>
 SEX : ${found.sex}<br>
 AGE : ${found.age}<br>
 DIVISION : ${found.division}<br>
 RANK : ${found.rank}<br>
 ABILITY : ${found.ability}<br>
 STATUS : ${found.status}<br>
╚════════════════════════════╝
  `);

  if (found.secret) {
    printOutput(`<span style="color:var(--green)">[SECRET RECORD DETECTED]</span> type "open secret"</span>`);
  }
}

function showSecret() {
  const found = database.personnel.find(p => p.secret);
  if (!found) {
    printOutput("NO SECRET RECORD.");
    return;
  }

  printOutput(`
<span style="color:var(--green)">
██████████████████████████<br>
SECRET FILE UNLOCKED<br>
TARGET : ${found.name}<br>
${found.record}<br>
██████████████████████████
</span>
  `);
}

function toggleList() {
  printOutput(`<span style="color:var(--green)">=== PERSONNEL LIST ===</span>`);
  database.personnel.forEach(p => {
    printOutput(`${p.id} : ${p.name} [${p.status}]`);
  });
}

function helpCommand() {
  printOutput(`
Available Commands:<br>
help — command list<br>
clear — clear output<br>
logout — reboot system<br>
toggle list — show personnel<br>
open secret — secret file<br>
AP-000000 / name — personnel search
  `);
}

function executeCommand(cmd) {
  printOutput(`<span style="color:var(--green)">> ${cmd}</span>`);

  const lower = cmd.toLowerCase();

  if (lower === "help") {
    helpCommand();
  } else if (lower === "clear") {
    document.getElementById('output').innerHTML = "";
  } else if (lower === "logout") {
    location.reload();
  } else if (lower === "toggle list") {
    toggleList();
  } else if (lower === "open secret") {
    showSecret();
  } else {
    searchPersonnel(cmd);
  }
}

function initTerminal() {
  const output = document.getElementById('output');
  const commandInput = document.getElementById('commandInput');

  if (!output || !commandInput) {
    console.warn("Terminal elements not found.");
    return;
  }

  output.innerHTML = "";
  commandInput.focus();

  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = commandInput.value.trim();
      if (!cmd) return;
      executeCommand(cmd);
      commandInput.value = "";
    }
  });

  printOutput(`<span style="color:var(--green)">Tenri Network OS initialized.</span>`);
  printOutput(`type "help" to view commands.`);
}
/* =========================
   INITIALIZE
========================= */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startSequence().catch(e => console.warn(e));
  });
} else {
  startSequence().catch(e => console.warn(e));
}