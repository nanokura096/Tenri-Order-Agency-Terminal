/* =========================
   DATABASE
========================= */
const database = {
  personnel: [
    {
      id: 'AP-000000',
      category: 'personnel',
      name: '鳴瀬 可楚',
      sex: 'FEMALE',
      age: '██',
      division: '鳴響',
      rank: 'Leader',
      ability: '因報\n強大な力を利用して戦闘を行うが彼女自身には限界がないため危険な状態に陥っても活動を続ける可能性がある。\nまた、翠色の結晶を飛ばすことが可能で、任意のタイミングで爆破可能。\nだが、観測者が増えるごとに威力が弱まる。',
      status: 'ACTIVE',
      clearance: '3',
      record: '[アクセス拒否]'
    },
    {
      id: 'AP-838383',
      category: 'personnel',
      name: '天城 ユウラ',
      sex: 'FEMALE',
      age: '19',
      division: '観測局 第3解析班',
      rank: 'Field Analyst',
      ability: '■確率固定化（Probability Lock）\n周囲で発生する「結果が揺らぐ現象」を1つだけ選び、その結果を“確定状態”に固定する能力。',
      status: 'MISSING',
      clearance: '3',
      record: '初期記録：施設外で原因不明の交通事故が発生。現在、使用回数は1日1回に制限。'
    },
    {
      id: 'AP-383838',
      category: 'personnel',
      name: '雨宮 志乃',
      sex: 'FEMALE',
      age: '19',
      division: '情報解析部',
      rank: 'Analyst',
      ability: '未来演算\n短時間先の情報分岐を観測可能。',
      status: 'NEUTRALIZED',
      clearance: '2',
      record: 'TOA-214情報漏洩事件にて初確認。現在監視付きで運用中。'
    }
  ],
  objects: [
    {
      id: 'OBJ-001',
      category: 'object',
      name: '天理楔',
      description: '全長██cmの鉾。天逆鉾のような形をしているが、柄は取り外し可能。効果は「突き刺した対象の結果を生まない」。',
      status: 'CONTAINED',
      clearance: '3'
    },
    {
      id: 'OBJ-002',
      category: 'object',
      name: '黒玻璃片',
      description: '手のひら大の黒色結晶。鏡面のような反射率を持つ。',
      clearance: '2',
      status: 'SEALED',
      ability: '視認した人物の短期記憶を反転混濁させる。布越しでは効果減衰。',
      record: '天理市旧坑道にて回収。回収班2名が記憶混濁を発症した。'
    },
    {
      id: 'OBJ-003',
      category: 'object',
      name: '不確定な砂時計',
      description: '中身の砂が「過去から未来」へ流れると推測される砂時計。',
      clearance: '2',
      status: 'CONTAINED',
      ability: '砂時計を反転させた際、周囲の「直近10秒間の出来事」をランダムに再抽選する。',
      record: '回収任務中、エージェントが誤って反転。深刻な因果律崩壊は免れた。'
    }
  ]
};

/* =========================
   STATE
========================= */
let currentFile = null;
let currentCategory = 'personnel';
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let clearanceAttempts = 0;
const MAX_CLEARANCE_ATTEMPTS = 3;
let pendingClearanceLevel = 1;
let audioCtx = null;
let clockLoop = null;

const clearanceCodes = {
  "2": "late",
  "3": "true",
  "4": "fake",
  "5": "null"
};

/* =========================
   SCREEN CONTROL
========================= */
function showScreen(mode){
  ['startupScreen','loginScreen','bootScreen','mainTerminal','emergencyConsole','agentDispatch','amnesticOverlay','clearanceAuth'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });

  if(mode==='startup') document.getElementById('startupScreen').style.display='flex';
  if(mode==='login') document.getElementById('loginScreen').style.display='flex';
  if(mode==='boot') document.getElementById('bootScreen').style.display='block';
  if(mode==='main') document.getElementById('mainTerminal').style.display='block';
  if(mode==='emergency') document.getElementById('emergencyConsole').style.display='flex';
  if(mode==='agent') document.getElementById('agentDispatch').style.display='flex';
  if(mode==='amnestic') document.getElementById('amnesticOverlay').style.display='flex';
  if(mode==='auth') document.getElementById('clearanceAuth').style.display='flex';
}

/* =========================
   AUDIO
========================= */
function initAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function beep(freq,dur,vol=0.03){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(vol,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime + dur/1000);
  osc.start(); osc.stop(audioCtx.currentTime + dur/1000);
}

/* =========================
   STARTUP
========================= */
document.addEventListener('DOMContentLoaded',()=>{
  showScreen('startup');
  const text = document.querySelector('.startupText');
  const dots = ['','.','..','...'];
  let i = 0;
  const loading = setInterval(()=>{
    if(text) text.innerHTML = "TENRI NETWORK<br><br>LOADING" + dots[i];
    i = (i+1)%dots.length;
  },400);

  setTimeout(()=>{
    clearInterval(loading);
    showScreen('login');
  },5000);

  document.getElementById('loginBtn')?.addEventListener('click',login);
  document.getElementById('searchBtn')?.addEventListener('click',searchFile);
  document.getElementById('emergencyBtn')?.addEventListener('click',startAltReality);
  document.getElementById('dataToggleBtn')?.addEventListener('click',toggleDataPanel);
  document.getElementById('clearance')?.addEventListener('change',requestClearanceAuth);
  document.getElementById('authBtn')?.addEventListener('click',verifyClearanceCode);
  document.getElementById('authCancelBtn')?.addEventListener('click',()=>{
    document.getElementById('clearanceAuth').style.display = 'none';
    document.getElementById('clearance').value = '1';
  });
  setupTabs();
});

/* =========================
   LOGIN
========================= */
function login(){
  initAudio();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const err = document.getElementById('loginError');

  if(u==='admin' && p==='226227'){
    document.querySelector('.loginBox').innerHTML = '<div class="blink">AUTHENTICATING...</div>';
    beep(900,100);
    setTimeout(()=>{ showScreen('boot'); startBoot(); },1000);
  } else {
    loginAttempts++;
    beep(150,200);
    if(loginAttempts >= MAX_ATTEMPTS) dispatchAgent();
    else err.innerText = `ACCESS DENIED (${loginAttempts}/${MAX_ATTEMPTS})`;
  }
}

/* =========================
   BOOT
========================= */
function startBoot(){
  const boot = document.getElementById('bootScreen');
  boot.innerHTML = '';
  const lines = ['TENRI NETWORK CORE INITIALIZED', 'LOADING SECURITY MODULES...', 'ACCESS GRANTED', 'WELCOME, OPERATOR'];
  let i = 0;
  function addLine(){
    if(i >= lines.length){ setTimeout(finishBoot,700); return; }
    const div = document.createElement('div');
    div.innerText = lines[i]; boot.appendChild(div);
    beep(260+i*25,20); i++;
    setTimeout(addLine,450);
  }
  addLine();
}

function finishBoot(){
  showScreen('main');
  document.getElementById('clearance').value = '1';
  if(clockLoop) clearInterval(clockLoop);
  clockLoop = setInterval(updateClock,1000);
  loadDataList();
}

function updateClock(){
  document.getElementById('statusbar').innerText = 'SYSTEM ONLINE / ' + new Date().toLocaleString();
}

/* =========================
   SEARCH
========================= */
function searchFile(){
  initAudio();
  const id = document.getElementById('staffId').value.trim();
  const cl = parseInt(document.getElementById('clearance').value);
  const r = document.getElementById('result');
  if(!id){ r.innerText = 'READY'; return; }
  const found = database.personnel.find(x=>x.id===id) || database.objects.find(x=>x.id===id);
  if(!found){ r.innerText = 'NOT FOUND'; beep(150,200); return; }
  if(cl < parseInt(found.clearance)){ r.innerText = 'ACCESS DENIED'; beep(120,250); return; }
  currentFile = found;
  document.getElementById('tabs').style.display = 'flex';
  showTab('personnel');
}

/* =========================
   TAB SYSTEM
========================= */
function setupTabs(){
  document.querySelectorAll('#tabs button').forEach(btn=>{
    btn.onclick = ()=>showTab(btn.dataset.tab);
  });
}

function showTab(tab){
  if(!currentFile) return;
  const r = document.getElementById('result');
  let txt = '';
  switch(tab){
    case 'personnel':
      const sClass = getStatusClass(currentFile.status);
      txt = `NAME: ${currentFile.name}\nCATEGORY: ${currentFile.category.toUpperCase()}\nSTATUS: <span class="status ${sClass}">${currentFile.status || 'UNKNOWN'}</span>`;
      break;
    case 'ability': txt = currentFile.ability || 'NO DATA'; break;
    case 'artifact': txt = currentFile.description || currentFile.Description || 'NO DATA'; break;
    case 'record': txt = currentFile.record || 'NO DATA'; break;
  }
  r.innerHTML = txt; beep(1000,15);
}

/* =========================
   CLEARANCE AUTH
========================= */
function requestClearanceAuth(){
  const level = document.getElementById('clearance').value;
  if(level === '0' || level === '1') return;
  pendingClearanceLevel = level;
  showScreen('auth');
  document.getElementById('authLevelText').innerText = `LEVEL ${level} AUTHORIZATION REQUIRED`;
  document.getElementById('authInput').value = '';
  document.getElementById('authError').innerText = '';
}

function verifyClearanceCode(){
  initAudio();
  const input = document.getElementById('authInput').value.trim();
  const correct = clearanceCodes[pendingClearanceLevel];
  if(input === correct){
    beep(900,80);
    document.getElementById('clearanceAuth').style.display = 'none';
    showScreen('main');
    document.getElementById('result').innerText = `CLEARANCE LEVEL ${pendingClearanceLevel} VERIFIED`;
    clearanceAttempts = 0;
  } else {
    clearanceAttempts++; beep(120,250);
    document.getElementById('authError').innerText = `AUTH FAILED (${clearanceAttempts}/${MAX_CLEARANCE_ATTEMPTS})`;
    if(clearanceAttempts >= MAX_CLEARANCE_ATTEMPTS) startAmnesticProtocol();
  }
}

/* =========================
   DATA PANEL
========================= */
function toggleDataPanel(){
  document.getElementById('dataPanel').classList.toggle('open');
}

function setCategory(cat){
  currentCategory = cat; loadDataList();
}

function loadDataList(){
  const list = document.getElementById('dataList');
  if(!list) return;
  list.innerHTML = '';
  const data = database[currentCategory];
  data.forEach(f => {
    const div = document.createElement('div');
    div.className = 'staffEntry';
    const sClass = getStatusClass(f.status);
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <div style="font-size:12px; opacity:0.8;">ID: ${f.id}</div>
        <div class="${sClass}" style="font-size:10px;">● ${f.status}</div>
      </div>
      <div style="font-weight:bold;">NAME: ${f.name}</div>`;
    div.onclick = () => { document.getElementById('staffId').value = f.id; searchFile(); };
    list.appendChild(div);
  });
}

/* =========================
   AGENT DISPATCH
========================= */
function dispatchAgent(){
  initAudio(); showScreen('agent');
  const log = document.getElementById('agentLog');
  const intro = ['[SECURITY ALERT]', 'UNAUTHORIZED LOGIN ATTEMPTS : 3', 'DISPATCHING FIELD AGENT...'];
  let i = 0;
  function print(){
    if(i >= intro.length){ startCountdown(); return; }
    log.innerText += intro[i] + '\n';
    beep(130+i*10,35); i++;
    setTimeout(print,500);
  }
  function startCountdown(){
    let time = 12;
    const timer = setInterval(()=>{
      log.innerText = intro.join('\n') + `\n\nAGENT ETA : 00:00:${String(time).padStart(2,'0')}\n[ DO NOT LEAVE YOUR POSITION ]`;
      beep(180,20,0.02); time--;
      if(time < 0){ clearInterval(timer); location.reload(); }
    },1000);
  }
  print();
}

/* =========================
   AMNESTIC PROTOCOL
========================= */
function startAmnesticProtocol(){
  showScreen('amnestic');
  setTimeout(()=>location.reload(),5000);
}

function getStatusClass(status) {
  if(!status) return '';
  if(['ACTIVE','CONTAINED'].includes(status)) return 'state-ACTIVE';
  if(['TERMINATED','NEUTRALIZED'].includes(status)) return 'state-TERMINATED';
  if(status === 'MISSING') return 'state-MISSING';
  return '';
}

function startAltReality(){
  showScreen('emergency');
}
