/* =========================
   DATABASE
========================= */
const database = {
  personnel: [
    { 
      id: `AP-000000`, 
      category: `personnel`, 
      name: `鳴瀬 可楚`, 
      status: `ACTIVE`, 
      clearance: `3`, 
      ability: `因報
強大な力を利用して戦闘を行うが、彼女自身には限界がない。
翠色の結晶を飛ばすことが可能。`, // バッククォートならそのまま改行OK
      record: `[アクセス拒否]` 
    },
  ],
  objects: [
  {
    id: `OBJ-002`,
    category: `object`,
    name: `不確定な砂時計`,
    description: `枠組みは未知の黒い金属製。中の砂は銀色に発光している。`,
    ability: `反転させた際、周囲の「直近10秒間の出来事」をランダムに再抽選する。`,
    // ここに収容方法を追加
    procedure: `常に真空状態のコンテナ内に固定し、音波を遮断すること。
活性化の兆候が見られた場合、直ちにサイト-226を封鎖せよ。`,
    clearance: `2`,
    status: `CONTAINED`
  },
],
  
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

const clearanceCodes = { "2": "late", "3": "true", "4": "fake", "5": "null" };

/* =========================
   SCREEN CONTROL
========================= */
function showScreen(mode){
  console.log("Switching to screen:", mode); // デバッグ用
  const screens = ['startupScreen','loginScreen','bootScreen','mainTerminal','emergencyConsole','agentDispatch','amnesticOverlay','clearanceAuth'];
  
  screens.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });

  const targetMap = {
    'startup': 'startupScreen', 'login': 'loginScreen', 'boot': 'bootScreen',
    'main': 'mainTerminal', 'emergency': 'emergencyConsole', 'agent': 'agentDispatch',
    'amnestic': 'amnesticOverlay', 'auth': 'clearanceAuth'
  };
  
  const targetId = targetMap[mode];
  const targetEl = document.getElementById(targetId);
  if(targetEl) {
    targetEl.style.display = (['startup', 'login', 'emergency', 'auth'].includes(mode)) ? 'flex' : 'block';
  } else {
    console.warn("Element not found:", targetId); // IDが見つからない場合の警告
  }
}

/* =========================
   AUDIO
========================= */
function initAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function beep(freq,dur,vol=0.03){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.value = freq; osc.type = 'square';
  gain.gain.setValueAtTime(vol,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime + dur/1000);
  osc.start(); osc.stop(audioCtx.currentTime + dur/1000);
}

/* =========================
   STARTUP & INITIALIZE
========================= */
document.addEventListener('DOMContentLoaded',()=>{
  console.log("System Initializing...");
  showScreen('startup');

  // アニメーション対象を探す（IDでもClassでもOKにする）
  const text = document.querySelector('.startupText') || document.getElementById('startupText');
  const dots = ['','.','..','...'];
  let dotIdx = 0;

  const loadingInterval = setInterval(()=>{
    if(text) {
      text.innerHTML = "TENRI NETWORK<br><br>LOADING" + dots[dotIdx];
      dotIdx = (dotIdx + 1) % dots.length;
    }
  }, 400);

  // 3秒後にログイン画面へ（強制）
  setTimeout(()=>{
    console.log("Startup complete. Transitioning to login...");
    clearInterval(loadingInterval);
    showScreen('login');
  }, 3000);

  // イベント登録
  document.getElementById('loginBtn')?.addEventListener('click', login);
  document.getElementById('searchBtn')?.addEventListener('click', searchFile);
  document.getElementById('emergencyBtn')?.addEventListener('click', () => showScreen('emergency'));
  document.getElementById('dataToggleBtn')?.addEventListener('click', toggleDataPanel);
  document.getElementById('clearance')?.addEventListener('change', requestClearanceAuth);
  document.getElementById('authBtn')?.addEventListener('click', verifyClearanceCode);
  document.getElementById('authCancelBtn')?.addEventListener('click', () => {
    showScreen('main');
    document.getElementById('clearance').value = '1';
  });
  
  setupTabs();
});

/* =========================
   LOGIN
========================= */
function login(){
  initAudio();
  const u = document.getElementById('username')?.value.trim();
  const p = document.getElementById('password')?.value.trim();
  const err = document.getElementById('loginError');

  if(u === 'admin' && p === '226227'){
    const box = document.querySelector('.loginBox');
    if(box) box.innerHTML = '<div class="blink">AUTHENTICATING...</div>';
    beep(900, 100);
    setTimeout(() => { showScreen('boot'); startBoot(); }, 1000);
  } else {
    loginAttempts++;
    beep(150, 200);
    if(loginAttempts >= MAX_ATTEMPTS) {
      dispatchAgent();
    } else {
      if(err) err.innerText = `ACCESS DENIED (${loginAttempts}/${MAX_ATTEMPTS})`;
    }
  }
}

/* =========================
   BOOT & MAIN
========================= */
function startBoot(){
  const boot = document.getElementById('bootScreen');
  if(!boot) { finishBoot(); return; }
  boot.innerHTML = '';
  const lines = ['CORE INITIALIZED', 'LOADING MODULES...', 'SYNCING DATABASE...', 'ACCESS GRANTED'];
  let i = 0;
  function addLine(){
    if(i >= lines.length){ setTimeout(finishBoot, 500); return; }
    const div = document.createElement('div');
    div.innerText = lines[i];
    boot.appendChild(div);
    beep(300 + i * 50, 20);
    i++;
    setTimeout(addLine, 400);
  }
  addLine();
}

function finishBoot(){
  showScreen('main');
  loadDataList();
  if(!clockLoop) clockLoop = setInterval(updateClock, 1000);
}

function updateClock(){
  const bar = document.getElementById('statusbar');
  if(bar) bar.innerText = 'SYSTEM ONLINE / ' + new Date().toLocaleString();
}

/* =========================
   SEARCH & TABS
========================= */
function searchFile(){
  const inputEl = document.getElementById('staffId');
  const id = inputEl?.value.trim();
  const cl = parseInt(document.getElementById('clearance')?.value || "1");
  const r = document.getElementById('result');
  
  if(!id) return;

  const found = database.personnel.find(x => x.id === id) || database.objects.find(x => x.id === id);
  if(!found){ 
    if(r) r.innerText = 'NOT FOUND'; 
    beep(150, 200); 
    return; 
  }
  
  if(cl < parseInt(found.clearance)){ 
    if(r) r.innerText = 'ACCESS DENIED: CLEARANCE LEVEL TOO LOW'; 
    beep(120, 250); 
    return; 
  }

  currentFile = found;
  const tabArea = document.getElementById('tabs');
  if(tabArea) tabArea.style.display = 'flex';
  showTab('personnel');
}

function setupTabs(){
  document.querySelectorAll('#tabs button').forEach(btn => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });
}

/* =========================
   SHOW TAB (全置換・最適化版)
   ' を ` に置換し、ABILITYとOBJECTの表示内容を分離しました
========================= */
function showTab(tab) {
  if (!currentFile) return;
  const r = document.getElementById(`result`);
  if (!r) return;

  let txt = ``;
  const sClass = getStatusClass(currentFile.status);

  switch (tab) {
    case `personnel`:
      txt = `NAME: ${currentFile.name}<br>
             STATUS: <span class="status ${sClass}">${currentFile.status}</span>`;
      break;

    case `ability`:
      const abilityInfo = currentFile.ability || `特筆すべき異常能力は確認されていません。`;
      txt = `【特異能力 / 異常性】<br>${abilityInfo.replace(/\n/g, `<br>`)}`;
      break;

    case `artifact`:
      // OBJECTタブ：外見説明に加えて、収容方法（procedure）を表示するように拡張
      const descInfo = currentFile.description || currentFile.Description || `詳細な物理記述データなし。`;
      const procInfo = currentFile.procedure || `標準収容プロトコルを適用中。`;
      
      txt = `【物品概要 / 外見説明】<br>${descInfo.replace(/\n/g, `<br>`)}
             <br><br>
             【特別収容プロトコル】<br>${procInfo.replace(/\n/g, `<br>`)}`;
      break;

    case `record`:
      const recordInfo = currentFile.record || `機密事項、または記録なし。`;
      txt = `【収容・事件記録】<br>${recordInfo.replace(/\n/g, `<br>`)}`;
      break;
  }

  r.innerHTML = txt;
  beep(800, 20);
}

/* =========================
   DATABASE LIST
========================= */
function toggleDataPanel(){
  const panel = document.getElementById('dataPanel');
  if(panel) panel.classList.toggle('open');
}

window.setCategory = function(cat){
  currentCategory = cat;
  loadDataList();
};

function loadDataList(){
  const list = document.getElementById('dataList');
  if(!list) return;
  list.innerHTML = '';
  
  const data = database[currentCategory] || [];
  data.forEach(f => {
    const div = document.createElement('div');
    div.className = 'staffEntry';
    const sClass = getStatusClass(f.status);
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <span style="font-size:10px; opacity:0.7;">${f.id}</span>
        <span class="${sClass}" style="font-size:10px;">●</span>
      </div>
      <div style="font-weight:bold;">${f.name}</div>
    `;
    div.onclick = () => {
      const input = document.getElementById('staffId');
      if(input) input.value = f.id;
      searchFile();
      toggleDataPanel();
    };
    list.appendChild(div);
  });
}

/* =========================
   CLEARANCE AUTH
========================= */
function requestClearanceAuth(){
  const level = document.getElementById('clearance')?.value;
  if(level === '0' || level === '1') return;
  pendingClearanceLevel = level;
  showScreen('auth');
  const authTxt = document.getElementById('authLevelText');
  if(authTxt) authTxt.innerText = `LEVEL ${level} AUTHORIZATION REQUIRED`;
}

function verifyClearanceCode(){
  const input = document.getElementById('authInput')?.value.trim();
  if(input === clearanceCodes[pendingClearanceLevel]){
    beep(1000, 100);
    showScreen('main');
    const r = document.getElementById('result');
    if(r) r.innerText = `LEVEL ${pendingClearanceLevel} ACCESS GRANTED`;
    clearanceAttempts = 0;
  } else {
    clearanceAttempts++;
    beep(100, 300);
    const err = document.getElementById('authError');
    if(err) err.innerText = `INVALID CODE (${clearanceAttempts}/${MAX_CLEARANCE_ATTEMPTS})`;
    if(clearanceAttempts >= MAX_CLEARANCE_ATTEMPTS) location.reload();
  }
}

/* =========================
   UTILITIES
========================= */
function getStatusClass(s){
  if(['ACTIVE','CONTAINED'].includes(s)) return 'state-ACTIVE';
  if(['TERMINATED','NEUTRALIZED','SEALED'].includes(s)) return 'state-TERMINATED';
  return 'state-MISSING';
}

function dispatchAgent(){
  showScreen('agent');
  const log = document.getElementById('agentLog');
  if(!log) { setTimeout(() => location.reload(), 3000); return; }
  log.innerText = 'DISPATCHING FIELD AGENT...';
  setTimeout(() => location.reload(), 5000);
}
