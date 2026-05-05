const database = {
  personnel: [{ id: 'AP-000000', name: '鳴瀬 可楚', secret: true, record: '機密：因果律崩壊リスク。' }]
};

const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function typeLog(text, isDot = false) {
  const el = document.getElementById('loginConsole');
  if (!el) return;
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

async function startSequence() {
  const consoleEl = document.getElementById('loginConsole');
  consoleEl.innerHTML = ''; // クリア

  await typeLog("Welcome to Tenri Network OS");
  await typeLog("Now Loading", true);
  await wait(500);

  await typeLog("<br>Enter ID");
  const idInput = document.createElement('input');
  idInput.type = "text";
  idInput.className = "terminal-input";
  consoleEl.appendChild(idInput);
  idInput.focus();

  idInput.onkeypress = async (e) => {
    if (e.key === 'Enter') {
      const val = idInput.value.trim();
      idInput.disabled = true;
      await typeLog("<br>Checking with database", true);
      
      if (val === "admin") {
        await typeLog("<br>Welcome Naruse Kaso!");
        await wait(500);
        promptPassword();
      } else {
        await typeLog("<br>ACCESS DENIED. REBOOTING...");
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
        await typeLog("<br>Checking with database..."); await wait(800);
        await typeLog("Loading System..."); await wait(600);
        await typeLog("Accessing to Database..."); await wait(600);
        await typeLog("Scanning Your Information..."); await wait(1000);
        await typeLog("<span style='color:var(--green)'>Success!</span>");
        await typeLog("Welcome to Tenri Network OS!");
        await wait(1500);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainTerminal').style.display = 'block';
      } else {
        await typeLog("<br>INVALID PASSWORD.");
        await wait(1500);
        location.reload();
      }
    }
  };
}

// ページ読み込み完了時に実行
window.onload = startSequence;