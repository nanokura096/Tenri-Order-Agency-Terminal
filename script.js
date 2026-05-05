/* =========================
   DATABASE
========================= */
const database = {
  personnel: [
    {
      id: `AP-000000`,
      category: `personnel`,
      name: `鳴瀬 可楚 / Naruse Kaso`,
      sex: `FEMALE`,
      age: `██`,
      division: `鳴響`,
      rank: `Leader`,
      status: `ACTIVE`,
      secret: true, // 隠しデータあり
      ability: `【特異能力：因報（ネメシス）】
因果の報いを操作・転換し、強大なエネルギーとして戦闘に利用する能力。
術者自身にリミットが存在せず、致死負荷状況下でも活動を継続する。`,
      procedure: `現場運用においては、彼女の「限界のない活動」が周囲の因果律に与える影響を常に監視すること。`,
      record: `【最重要機密：因果律崩壊リスク】
彼女の「因報」は世界線の安定性を直接損なう危険性がある。
[データ削除済]における事象発生時、彼女一人の生存と引き換えに一つの都市が因果の螺旋に消えた記録がある。`,
      description: `鳴響部隊の絶対的リーダー。その力は世界の理を書き換える。`
    },
  
  ],
  objects: [
    {
      id: `OBJ-001`,
      name: `天理楔`,
      status: `CONTAINED`,
      description: `結果を生まない楔。事象の確定を拒否する。`,
      procedure: `AP-000000が所持するか、専用ロッカーに収容。`
    }
  ]
};

/* =========================
   STATE
========================= */
let currentFile = null;
let currentCategory = 'personnel';
let audioCtx = null;
let clockLoop = null;

/* =========================
   SCREEN CONTROL
========================= */
function showScreen(mode){
  const screens = ['startupScreen','loginScreen','bootScreen','mainTerminal','emergencyConsole','agentDispatch','clearanceAuth'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
  const targetMap = { 'startup': 'startupScreen', 'login': 'loginScreen', 'boot': 'bootScreen', 'main': 'mainTerminal', 'auth': 'clearanceAuth' };
  const targetEl = document.getElementById(targetMap[mode]);
  if(targetEl) targetEl.style.display = (['startup', 'login', 'auth'].includes(mode)) ? 'flex' : 'block';
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
   INITIALIZE
========================= */
document.addEventListener('DOMContentLoaded',()=>{
  showScreen('startup');
  setTimeout(()=> showScreen('login'), 2000);
  document.getElementById('loginBtn')?.addEventListener('click', login);
  document.getElementById('searchBtn')?.addEventListener('click', searchFile);
  document.getElementById('dataToggleBtn')?.addEventListener('click', toggleDataPanel);
  setupTabs();
});

function login(){
  initAudio();
  const u = document.getElementById('username')?.value.trim();
  const p = document.getElementById('password')?.value.trim();
  if(u === 'admin' && p === '226227'){
    beep(900, 100);
    showScreen('boot');
    startBoot();
  } else {
    beep(150, 200);
    document.getElementById('loginError').innerText = "INVALID CREDENTIALS";
  }
}

function startBoot(){
  const boot = document.getElementById('bootScreen');
  boot.innerHTML = '';
  const lines = ['SYNCING TOA NETWORK...', 'ACCESSING DATABASE...', 'TERMINAL READY.'];
  let i = 0;
  function addLine(){
    if(i >= lines.length){ setTimeout(finishBoot, 500); return; }
    const div = document.createElement('div');
    div.innerText = `> ${lines[i]}`;
    boot.appendChild(div);
    beep(400 + i*100, 30);
    i++;
    setTimeout(addLine, 500);
  }
  addLine();
}

function finishBoot(){
  showScreen('main');
  loadDataList();
  if(!clockLoop) clockLoop = setInterval(() => {
    document.getElementById('statusbar').innerText = 'SYSTEM ONLINE / ' + new Date().toLocaleString();
  }, 1000);
}

/* =========================
   SEARCH & TABS
========================= */
function searchFile(){
  const id = document.getElementById('staffId')?.value.trim();
  const r = document.getElementById('result');
  if(!id) return;

  const found = database.personnel.find(x => x.id === id) || database.objects.find(x => x.id === id);
  if(!found){ 
    r.innerText = 'NOT FOUND'; 
    beep(150, 200); 
    return; 
  }

  currentFile = found;
  document.getElementById('tabs').style.display = 'flex';
  showTab('personnel');
}

function setupTabs(){
  document.querySelectorAll('#tabs button').forEach(btn => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });
}

function showTab(tab) {
  if (!currentFile) return;
  const r = document.getElementById(`result`);
  let txt = ``;
  const sClass = getStatusClass(currentFile.status);

  switch (tab) {
    case `personnel`:
      txt = `NAME: ${currentFile.name}<br>STATUS: <span class="status ${sClass}">${currentFile.status}</span><br><br>`;
      // secretフラグがある場合のみ隠しボタンを表示
      if (currentFile.secret) {
        txt += `
          <div style="border: 1px double #ff0000; padding: 10px; margin-top: 10px; background: rgba(255,0,0,0.1);">
            <span class="blink" style="color: #ff0000; font-size: 0.8em;">[ENCRYPTED DATA DETECTED]</span><br>
            <button onclick="unlockRecord()" style="background: #111; border: 1px solid #ff0000; color: #ff0000; cursor: pointer; padding: 5px; margin-top: 5px; width: 100%;">
              > ACCESS SECURE ARCHIVE
            </button>
          </div>`;
      }
      break;

    case `ability`:
      txt = `【特異能力】<br>${(currentFile.ability || "なし").replace(/\n/g, "<br>")}`;
      break;

    case `artifact`:
      const desc = currentFile.description || "データなし";
      const proc = currentFile.procedure || "標準収容";
      txt = `【概要】<br>${desc.replace(/\n/g, "<br>")}<br><br>【収容手順】<br>${proc.replace(/\n/g, "<br>")}`;
      break;

    case `record`:
      // secretの場合はPERSONNEL経由で見せるため、ここでは伏せる
      if (currentFile.secret) {
        txt = `<div style="text-align:center; padding-top:50px; color:#ff0000;">[LOCKED]<br>認証ユニットを使用してください</div>`;
      } else {
        txt = `【記録】<br>${(currentFile.record || "記録なし").replace(/\n/g, "<br>")}`;
      }
      break;
  }
  r.innerHTML = txt;
  beep(800, 20);
}

/* =========================
   STATE (追加)
========================= */
let secretAttempts = 0; // 秘密アクセスの失敗回数カウント
const MAX_SECRET_ATTEMPTS = 3;

/* =========================
   SECRET UNLOCK (修正版)
========================= */
function unlockRecord() {
  initAudio();
  showScreen('auth');
  
  const input = document.getElementById('authInput');
  const err = document.getElementById('authError');
  const confirmBtn = document.getElementById('authConfirmBtn');
  const cancelBtn = document.getElementById('authCancelBtn');

  input.value = '';
  err.innerText = '';
  input.focus();

  confirmBtn.onclick = () => {
    const pass = input.value.trim();
    
    if (pass === currentFile.id || pass === "226227") {
      // 成功時
      beep(1000, 100);
      secretAttempts = 0; // カウントリセット
      showScreen('main');
      const r = document.getElementById(`result`);
      r.innerHTML = `<div class="glitch-bg">【機密アーカイブ解凍成功】</div><br>${currentFile.record.replace(/\n/g, "<br>")}`;
    } else {
      // 失敗時
      secretAttempts++;
      beep(150, 300);
      
      if (secretAttempts >= MAX_SECRET_ATTEMPTS) {
        // 3回間違えた時の処理：記憶処理演出へ
        executeAmnesticProtocol();
      } else {
        err.innerText = `INVALID CODE (${secretAttempts}/${MAX_SECRET_ATTEMPTS})`;
      }
    }
  };

  cancelBtn.onclick = () => {
    showScreen('main');
  };
}

/* =========================
   AMNESTIC PROTOCOL (記憶処理演出)
========================= */
function executeAmnesticProtocol() {
  const overlay = document.getElementById('amnesticOverlay');
  if (overlay) {
    overlay.style.display = 'block';
    overlay.style.backgroundColor = '#fff'; // 一瞬真っ白に
    beep(50, 1000); // 不快な低音
    
    setTimeout(() => {
      overlay.style.backgroundColor = '#000';
      overlay.innerHTML = `<div style="color:#fff; text-align:center; padding-top:20%; font-family:serif;">
        貴方のアクセス権限は剥奪されました。<br>
        記憶処理を執行します。
      </div>`;
      
      setTimeout(() => {
        location.reload(); // 最初からやり直し
      }, 3000);
    }, 100);
  } else {
    // オーバーレイがない場合は即リロード
    alert("SECURITY BREACH: SYSTEM RESET");
    location.reload();
  }
}

/* =========================
   DATABASE LIST
========================= */
function toggleDataPanel(){ document.getElementById('dataPanel').classList.toggle('open'); }
function setCategory(cat){ currentCategory = cat; loadDataList(); }

function loadDataList(){
  const list = document.getElementById('dataList');
  list.innerHTML = '';
  const data = database[currentCategory] || [];
  data.forEach(f => {
    const div = document.createElement('div');
    div.className = 'staffEntry';
    div.innerHTML = `<span style="font-size:10px;">${f.id}</span><br><b>${f.name}</b>`;
    div.onclick = () => { document.getElementById('staffId').value = f.id; searchFile(); toggleDataPanel(); };
    list.appendChild(div);
  });
}

function getStatusClass(s){
  if(s === 'ACTIVE' || s === 'CONTAINED') return 'state-ACTIVE';
  if(s === 'MISSING') return 'state-MISSING';
  return 'state-TERMINATED';
}