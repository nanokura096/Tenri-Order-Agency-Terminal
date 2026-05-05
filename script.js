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

let previousScreen = null;
const wait = (ms) => new Promise(res => setTimeout(res, ms));

/* =========================
   SOUND & BOOT CONTROL
========================= */
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

async function bootSystem() {
  // ブラウザの音声制限を解除
  Object.values(sfx).forEach(a => {
    a.play().then(() => {
      a.pause();
      a.currentTime = 0;
    }).catch(() => {});
  });

  const bootScreen = document.getElementById('bootScreen');
  if (bootScreen) bootScreen.style.display = 'none';

  await startSequence();
}

/* =========================
   HELPERS
========================= */
function getStatusColor(status){
  switch(status){
    case 'ACTIVE': return '<span class="status-active">ACTIVE</span>';
    case 'CONTAINED': return '<span class="status-contained">CONTAINED</span>';
    case 'MISSING': return '<span class="status-missing">MISSING</span>';
    case 'TERMINATED': return '<span class="status-terminated">TERMINATED</span>';
    case 'NEUTRALIZED': return '<span class="status-neutralized">NEUTRALIZED</span>';
    case 'SEALED': return '<span class="status-sealed">SEALED</span>';
    case 'SUSPENDED': return '<span class="status-suspended">SUSPENDED</span>';
    default: return status;
  }
}

function getDangerColor(level){
  switch(level){
    case 'LOW': return '<span class="danger-low">LOW</span>';
    case 'MEDIUM': return '<span class="danger-medium">MEDIUM</span>';
    case 'HIGH': return '<span class="danger-high">HIGH</span>';
    case 'EXTREME': return '<span class="danger-extreme">EXTREME</span>';
    default: return level;
  }
}

/* =========================
   ANIMATED LOG WITH SOUND
========================= */
async function typeLog(text, isDot=false){
  const consoleEl = document.getElementById('loginConsole');
  if(!consoleEl) return;

  const div = document.createElement('div');
  consoleEl.appendChild(div);
  
  const chars = text.match(/<[^>]+>|[^<]/g) || [];
  
  for(const char of chars) {
    div.innerHTML += char;
    consoleEl.scrollTop = consoleEl.scrollHeight;
    
    if(!char.startsWith('<')) {
      playSound('click');
    }
    await wait(20); 
  }

  if(isDot){
    for(let i=0;i<3;i++){
      await wait(700);
      div.innerHTML += '.';
      playSound('click'); 
    }
  }
}

/* =========================
   LOGIN SEQUENCE
========================= */
async function startSequence(){
  const consoleEl = document.getElementById('loginConsole');
  if(!consoleEl) return;
  consoleEl.innerHTML = '';

  await typeLog("Welcome to Tenri Network OS");
  await typeLog("Now Loading", true);
  await wait(500);
  await typeLog("<br>Enter ID");

  const idInput = document.createElement('input');
  idInput.type = "text";
  idInput.className = "terminal-input";
  consoleEl.appendChild(idInput);
  setTimeout(()=>idInput.focus(),50);

  // ID入力中もクリック音
  idInput.addEventListener('input', () => playSound('click'));

  idInput.addEventListener('keydown', async(e)=>{
    if(e.key === 'Enter'){
      const val = idInput.value.trim();
      if(!val) return;

      idInput.disabled = true;
      await typeLog("<br>Checking with database", true);

      if(val === "admin"){
        await typeLog("<br>Welcome Naruse Kaso!");
        await wait(700);
        promptPassword();
      }else{
        playSound('error');
        await typeLog("<br><span style='color:var(--red)'>UNKNOWN ID. REBOOTING...</span>");
        await wait(2000);
        location.reload();
      }
    }
  });
}

async function promptPassword(){
  const consoleEl = document.getElementById('loginConsole');
  await typeLog("<br>Enter PASSWORD");

  const passInput = document.createElement('input');
  passInput.type = "password";
  passInput.className = "terminal-input";
  consoleEl.appendChild(passInput);
  setTimeout(()=>passInput.focus(),50);

  // パスワード入力中もクリック音
  passInput.addEventListener('input', () => playSound('click'));

  passInput.addEventListener('keydown', async(e)=>{
    if(e.key === 'Enter'){
      const val = passInput.value.trim();
      if(!val) return;

      passInput.disabled = true;

      if(val === "226227"){
        await typeLog("<br>Checking with database", true);
        await typeLog("Loading System", true);

        playSound('boot'); // ログイン成功の起動音
        await typeLog("<span style='color:var(--green);font-weight:bold;'>Success!</span>");
        await typeLog("Welcome to Tenri Network OS!");
        await wait(1500);

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainTerminal').style.display = 'flex';
        initTerminal();
      } else {
        playSound('error'); // 失敗時の音
        await typeLog("<br><span style='color:var(--red)'>INVALID PASSWORD. REBOOTING...</span>");
        await wait(2000);
        location.reload();
      }
    }
  });
}

/* =========================
   OUTPUT CONTROL
========================= */
function setOutput(html) {
  const output = document.getElementById('output');
  if(!output) return;
  output.innerHTML = `<div>${html}</div>`;
  output.scrollTop = 0;
  playSound('click'); // 画面更新時の操作音
}

function initTerminal() {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = `
      Tenri Network OS initialized.<br>
      Administrator session connected.<br><br>
      Select command.
    `;
    playSound('click');
  }
}

function withBackButton(content){
  return `
    ${content}
    <br><br>
    <button class="data-btn" onclick="goBack(); playSound('click');">← BACK</button>
  `;
}

function goBack(){
  if(previousScreen){
    previousScreen();
  }else{
    initTerminal();
  }
}

/* =========================
   NORMAL COMMANDS
========================= */
function helpCommand(){
  previousScreen = initTerminal;

  setOutput(`
=== AVAILABLE COMMANDS ===<br>
HELP : show help screen<br>
PERSONNEL : personnel database<br>
OBJECTS : object database<br>
SECRET : classified database<br>
LOGOUT : reboot system
<br><br>
<button class="data-btn" onclick="goBack(); playSound('click');">← BACK</button>
  `);
}

function showPersonnelButtons(){
  renderPersonnelList();
}

function showObjectButtons(){
  renderObjectList();
}

function searchDatabase(keyword){
  const p = database.personnel.find(x=>x.id===keyword);

  if(p){
    previousScreen = showPersonnelButtons;

    setOutput(withBackButton(`
<div class="info-panel">
  <div class="info-line"><span class="info-title">ID</span>: ${p.id}</div>
  <div class="info-line"><span class="info-title">NAME</span>: ${p.name}</div>
  <div class="info-line"><span class="info-title">SEX</span>: ${p.sex}</div>
  <div class="info-line"><span class="info-title">AGE</span>: ${p.age}</div>
  <div class="info-line"><span class="info-title">DIVISION</span>: ${p.division}</div>
  <div class="info-line"><span class="info-title">RANK</span>: ${p.rank}</div>
  <div class="info-line"><span class="info-title">ABILITY</span>: ${p.ability}</div>
  <div class="info-line"><span class="info-title">STATUS</span>: ${getStatusColor(p.status)}</div>
</div>
${p.secret ? '<div class="secret-detected">[ SECRET RECORD DETECTED ]</div>' : ''}
    `));
    return;
  }

  const o = database.objects.find(x=>x.id===keyword);

  if(o){
    previousScreen = showObjectButtons;

    setOutput(withBackButton(`
<div class="info-panel">
  <div class="info-line"><span class="info-title">ID</span>: ${o.id}</div>
  <div class="info-line"><span class="info-title">NAME</span>: ${o.name}</div>
  <div class="info-line"><span class="info-title">CLASS</span>: ${o.class}</div>
  <div class="info-line"><span class="info-title">DANGER</span>: ${getDangerColor(o.danger)}</div>
  <div class="info-line"><span class="info-title">DETAIL</span>: ${o.detail}</div>
</div>
${o.secret ? '<div class="secret-detected">[ SECRET RECORD DETECTED ]</div>' : ''}
    `));
    return;
  }

  setOutput(withBackButton(`NO DATA FOUND.`));
}

function renderPersonnelList(){
  let html = `<div class="info-panel">
  <div class="info-line"><span class="info-title">TYPE</span>PERSONNEL DATABASE</div>
  </div>`;

  database.personnel.forEach(p=>{
    html += `
    <button class="data-btn" onclick="playSound('click'); searchDatabase('${p.id}');">
      <b>${p.id}</b><br>
      ${p.name}<br>
      ${getStatusColor(p.status)}
    </button>`;
  });

  setOutput(html);
}

function renderObjectList(){
  let html = `<div class="info-panel">
  <div class="info-line"><span class="info-title">TYPE</span>OBJECT DATABASE</div>
  </div>`;

  database.objects.forEach(o=>{
    html += `
    <button class="data-btn" onclick="playSound('click'); searchDatabase('${o.id}');">
      <b>${o.id}</b><br>
      ${o.name}<br>
      CLASS: ${o.class}<br>
      DANGER: ${getDangerColor(o.danger)}
    </button>`;
  });

  setOutput(html);
}

/* =========================
   SECRET ACCESS SYSTEM
========================= */
function openSecretAuth(){
  playSound('click');
  document.getElementById('secretAuth').style.display = 'flex';
  document.getElementById('secretPassInput').value = '';
  document.getElementById('secretError').innerHTML = '';
  setTimeout(()=>document.getElementById('secretPassInput').focus(),50);
}

function closeSecretAuth(){
  playSound('click');
  document.getElementById('secretAuth').style.display = 'none';
}

function confirmSecretAccess(){
  const val = document.getElementById('secretPassInput').value.trim();

  if(val === "LEVEL4"){
    playSound('boot');
    document.getElementById('secretAuth').style.display = 'none';
    showSecretDatabaseSelect();
  }else{
    playSound('error');
    document.getElementById('secretError').innerHTML = 'ACCESS DENIED.';
  }
}

function showSecretDatabaseSelect(){
  previousScreen = initTerminal;

  setOutput(`
=== SELECT SECRET DATABASE ===<br>
<button class="data-btn" onclick="playSound('click'); showSecretPersonnelList();">PERSONNEL FILE</button>
<button class="data-btn" onclick="playSound('click'); showSecretObjectList();">OBJECT FILE</button>
<br><br>
<button class="data-btn" onclick="goBack(); playSound('click');">← BACK</button>
  `);
}

function showSecretPersonnelList(){
  previousScreen = showSecretDatabaseSelect;

  let html = `=== SECRET PERSONNEL FILE ===<br>`;
  database.personnel.filter(p=>p.secret).forEach(p=>{
    html += `<button class="data-btn" onclick="playSound('click'); openPersonnelSecret('${p.id}');">${p.id}<br>${p.name}</button>`;
  });
  html += `<br><br><button class="data-btn" onclick="goBack(); playSound('click');">← BACK</button>`;
  setOutput(html);
}

function showSecretObjectList(){
  previousScreen = showSecretDatabaseSelect;

  let html = `=== SECRET OBJECT FILE ===<br>`;
  database.objects.filter(o=>o.secret).forEach(o=>{
    html += `<button class="data-btn" onclick="playSound('click'); openObjectSecret('${o.id}');">${o.id}<br>${o.name}</button>`;
  });
  html += `<br><br><button class="data-btn" onclick="goBack(); playSound('click');">← BACK</button>`;
  setOutput(html);
}

function openPersonnelSecret(id){
  const p = database.personnel.find(x=>x.id===id);
  if(!p) return;

  previousScreen = showSecretPersonnelList;

  setOutput(withBackButton(`
████ SECRET PERSONNEL FILE ████<br>
TARGET : ${p.name}<br>
${p.secretRecord}<br>
██████████████████████████
  `));
}

function openObjectSecret(id){
  const o = database.objects.find(x=>x.id===id);
  if(!o) return;

  previousScreen = showSecretObjectList;

  setOutput(withBackButton(`
████ SECRET OBJECT FILE ████<br>
TARGET : ${o.name}<br>
${o.secretRecord}<br>
██████████████████████████
  `));
}

/* =========================
   LOGOUT SYSTEM
========================= */
function openLogoutConfirm(){
  playSound('click');
  document.getElementById('logoutConfirm').style.display = 'flex';
}

function closeLogoutConfirm(){
  playSound('click');
  document.getElementById('logoutConfirm').style.display = 'none';
}

async function confirmLogout(){
  playSound('click');
  const box = document.querySelector('#logoutConfirm .terminal-box');
  box.innerHTML = `<div id="rebootLog"></div>`;
  const rebootLog = document.getElementById('rebootLog');

  async function rebootType(text, dot=false){
    const div = document.createElement('div');
    div.innerHTML = text;
    rebootLog.appendChild(div);

    if(dot){
      for(let i=0;i<3;i++){
        await wait(700);
        div.innerHTML += '.';
        playSound('click');
      }
    }
  }

  await rebootType("Saving terminal logs", true);
  await rebootType("Disconnecting administrator", true);
  await rebootType("Rebooting system", true);
  await wait(1000);

  location.reload();
}

/* =========================
   EVENT LISTENERS
========================= */
window.addEventListener('DOMContentLoaded', () => {
  const bootBtn = document.getElementById('bootScreen');
  if (bootBtn) {
    bootBtn.addEventListener('click', bootSystem, { once: true });
  }
});