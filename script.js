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

const wait = (ms) => new Promise(res => setTimeout(res, ms));

/* =========================
   LOGIN ANIMATION
========================= */
async function typeLog(text, isDot=false){
  const consoleEl = document.getElementById('loginConsole');
  if(!consoleEl) return;

  const div = document.createElement('div');
  div.innerHTML = text;
  consoleEl.appendChild(div);
  consoleEl.scrollTop = consoleEl.scrollHeight;

  if(isDot){
    for(let i=0;i<3;i++){
      await wait(700);
      div.innerHTML += '.';
    }
  }
}

async function startSequence(){
  const consoleEl = document.getElementById('loginConsole');
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

  passInput.addEventListener('keydown', async(e)=>{
    if(e.key === 'Enter'){
      const val = passInput.value.trim();
      if(!val) return;

      passInput.disabled = true;

      if(val === "226227"){
        await typeLog("<br>Checking with database", true);
        await typeLog("Loading System", true);
        await typeLog("Accessing to Database", true);
        await typeLog("Scanning Your Information", true);
        await typeLog("<span style='color:var(--green);font-weight:bold;'>Success!</span>");
        await typeLog("Welcome to Tenri Network OS!");
        await wait(1500);

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainTerminal').style.display = 'flex';

        initTerminal();
      }else{
        await typeLog("<br><span style='color:var(--red)'>INVALID PASSWORD. REBOOTING...</span>");
        await wait(2000);
        location.reload();
      }
    }
  });
}

/* =========================
   TERMINAL OUTPUT
========================= */
function printOutput(html){
  const output = document.getElementById('output');
  output.innerHTML += `<div>${html}</div>`;
  setTimeout(()=>{
    output.scrollTop = output.scrollHeight;
  },20);
}

function clearTerminal(){
  document.getElementById('output').innerHTML = '';
}

/* =========================
   NORMAL COMMANDS
========================= */
function helpCommand(){
  printOutput(`
=== AVAILABLE COMMANDS ===<br>
HELP : show help<br>
PERSONNEL : personnel database<br>
OBJECTS : object database<br>
SECRET : classified file<br>
CLEAR : clear log<br>
LOGOUT : reboot system
  `);
}

function showPersonnelButtons(){
  printOutput(`<br>=== PERSONNEL DATABASE ===`);
  database.personnel.forEach(p=>{
    printOutput(`<button class="data-btn" onclick="searchDatabase('${p.id}')">${p.id}<br>${p.name}</button>`);
  });
}

function showObjectButtons(){
  printOutput(`<br>=== OBJECT DATABASE ===`);
  database.objects.forEach(o=>{
    printOutput(`<button class="data-btn" onclick="searchDatabase('${o.id}')">${o.id}<br>${o.name}</button>`);
  });
}

function searchDatabase(keyword){
  const p = database.personnel.find(x=>x.id===keyword);

  if(p){
    printOutput(`
╔════════════════════════════╗<br>
ID : ${p.id}<br>
NAME : ${p.name}<br>
SEX : ${p.sex}<br>
AGE : ${p.age}<br>
DIVISION : ${p.division}<br>
RANK : ${p.rank}<br>
ABILITY : ${p.ability}<br>
STATUS : ${p.status}<br>
╚════════════════════════════╝
    `);
    if(p.secret) printOutput(`[SECRET RECORD DETECTED]`);
    return;
  }

  const o = database.objects.find(x=>x.id===keyword);

  if(o){
    printOutput(`
╔════════════════════════════╗<br>
ID : ${o.id}<br>
NAME : ${o.name}<br>
CLASS : ${o.class}<br>
DANGER : ${o.danger}<br>
DETAIL : ${o.detail}<br>
╚════════════════════════════╝
    `);
    if(o.secret) printOutput(`[SECRET RECORD DETECTED]`);
    return;
  }

  printOutput(`<span style="color:red;">NO DATA FOUND.</span>`);
}

/* =========================
   SECRET ACCESS SYSTEM
========================= */
function openSecretAuth(){
  document.getElementById('secretAuth').style.display = 'flex';
  document.getElementById('secretPassInput').value = '';
  document.getElementById('secretError').innerHTML = '';
  setTimeout(()=>document.getElementById('secretPassInput').focus(),50);
}

function closeSecretAuth(){
  document.getElementById('secretAuth').style.display = 'none';
}

function confirmSecretAccess(){
  const val = document.getElementById('secretPassInput').value.trim();

  if(val === "LEVEL4"){
    document.getElementById('secretAuth').style.display = 'none';
    showSecretDatabaseSelect();
  }else{
    document.getElementById('secretError').innerHTML = 'ACCESS DENIED.';
  }
}

function showSecretDatabaseSelect(){
  printOutput(`
=== SELECT SECRET DATABASE ===<br>
<button class="data-btn" onclick="showSecretPersonnelList()">PERSONNEL FILE</button>
<button class="data-btn" onclick="showSecretObjectList()">OBJECT FILE</button>
  `);
}

function showSecretPersonnelList(){
  printOutput(`<br>=== SECRET PERSONNEL FILE ===`);
  database.personnel.filter(p=>p.secret).forEach(p=>{
    printOutput(`<button class="data-btn" onclick="openPersonnelSecret('${p.id}')">${p.id}<br>${p.name}</button>`);
  });
}

function showSecretObjectList(){
  printOutput(`<br>=== SECRET OBJECT FILE ===`);
  database.objects.filter(o=>o.secret).forEach(o=>{
    printOutput(`<button class="data-btn" onclick="openObjectSecret('${o.id}')">${o.id}<br>${o.name}</button>`);
  });
}

function openPersonnelSecret(id){
  const p = database.personnel.find(x=>x.id===id);
  if(!p) return;

  printOutput(`
████ SECRET PERSONNEL FILE ████<br>
TARGET : ${p.name}<br>
${p.secretRecord}<br>
██████████████████████████
  `);
}

function openObjectSecret(id){
  const o = database.objects.find(x=>x.id===id);
  if(!o) return;

  printOutput(`
████ SECRET OBJECT FILE ████<br>
TARGET : ${o.name}<br>
${o.secretRecord}<br>
██████████████████████████
  `);
}

/* =========================
   LOGOUT SYSTEM
========================= */
function openLogoutConfirm(){
  document.getElementById('logoutConfirm').style.display = 'flex';
}

function closeLogoutConfirm(){
  document.getElementById('logoutConfirm').style.display = 'none';
}

async function confirmLogout(){
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
   INIT
========================= */
function initTerminal(){
  clearTerminal();
  printOutput(`Tenri Network OS initialized.`);
  printOutput(`Tap a command button below.`);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>{
    startSequence().catch(e=>console.warn(e));
  });
}else{
  startSequence().catch(e=>console.warn(e));
}