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
  ],

  objects: [
    {
      id: 'OBJ-220001',
      name: '黒箱',
      class: 'Keter',
      danger: 'HIGH',
      detail: '内部時間の進行が停止している黒色立方体。接触禁止。'
    },
    {
      id: 'OBJ-889100',
      name: '模倣鏡',
      class: 'Euclid',
      danger: 'MEDIUM',
      detail: '映した対象と異なる表情を返す鏡。精神汚染報告あり。'
    },
    {
      id: 'OBJ-443210',
      name: '泣く人形',
      class: 'Safe',
      danger: 'LOW',
      detail: '深夜2時に涙を流す磁器人形。'
    }
  ]
};

const wait = (ms) => new Promise(res => setTimeout(res, ms));

/* =========================
   LOGIN LOG
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
  },30);
}

function clearTerminal(){
  document.getElementById('output').innerHTML = '';
}

/* =========================
   COMMAND BUTTONS
========================= */
function helpCommand(){
  printOutput(`
<span style="color:var(--green)">
=== AVAILABLE COMMANDS ===<br>
HELP : show help<br>
PERSONNEL : show personnel database<br>
OBJECTS : show object database<br>
SECRET : secret file<br>
CLEAR : clear log<br>
LOGOUT : reboot system
</span>
  `);
}

function showPersonnelButtons(){
  printOutput(`<br><span style="color:var(--green)">=== PERSONNEL DATABASE ===</span>`);
  database.personnel.forEach(p=>{
    printOutput(`<button class="data-btn" onclick="searchDatabase('${p.id}')">${p.id}<br>${p.name}</button>`);
  });
}

function showObjectButtons(){
  printOutput(`<br><span style="color:var(--green)">=== OBJECT DATABASE ===</span>`);
  database.objects.forEach(o=>{
    printOutput(`<button class="data-btn" onclick="searchDatabase('${o.id}')">${o.id}<br>${o.name}</button>`);
  });
}

/* =========================
   SEARCH SYSTEM
========================= */
function searchDatabase(keyword){
  const p = database.personnel.find(x => x.id === keyword);

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

    if(p.secret){
      printOutput(`<span style="color:var(--green)">[SECRET RECORD DETECTED]</span>`);
    }
    return;
  }

  const o = database.objects.find(x => x.id === keyword);

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
    return;
  }

  printOutput(`<span style="color:var(--red)">NO DATA FOUND.</span>`);
}

function showSecret(){
  const found = database.personnel.find(p=>p.secret);
  if(!found){
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

/* =========================
   INIT
========================= */
function initTerminal(){
  clearTerminal();
  printOutput(`<span style="color:var(--green)">Tenri Network OS initialized.</span>`);
  printOutput(`Tap a command button below.`);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>{
    startSequence().catch(e=>console.warn(e));
  });
}else{
  startSequence().catch(e=>console.warn(e));
}