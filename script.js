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
      ability: '因報\
強大な力を利用して戦闘を行うが彼女自身には限界がないため危険な状態に陥っても活動を続ける可能性がある。\
また、翠色の結晶を飛ばすことが可能で、任意のタイミングで爆破可能。\
だが、観測者が増えるごとに威力が弱まる。',
      status: 'ACTIVE',
      clearance: '3',
      Description: '',
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
      ability: '■確率固定化（Probability Lock）\
周囲で発生する「結果が揺らぐ現象」を1つだけ選び、その結果を“確定状態”に固定する能力。',
      status: 'MISSING',
      clearance: '3',
      Description: '能力発動時、対象周囲の環境に軽度の“静止感”が発生する。',
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
      ability: '未来演算\
短時間先の情報分岐を観測可能。',
      status: 'NEUTRALIZED',
      clearance: '2',
      Description: '黒色端末を常時携帯。演算補助用の特殊レンズを使用。',
      record: 'TOA-214情報漏洩事件にて初確認。現在監視付きで運用中。'
    }
  ],
  objects: [
    {
      id: 'OBJ-001',
      category: 'object',
      name: '天理楔',
      description: '全長██cmの鉾。\
天逆鉾のような形をしているが、柄は取り外し可能。\
効果は「突き刺した対象の結果を生まない」\
例えるなら「温度と' ,
      status:'CONTAINED',
      clearance: '3'
    },

    {
  id: 'OBJ-002',
  category: 'object',
  name: '黒玻璃片',
  description: '手のひら大の黒色結晶。\
鏡面のような反射率を持つ。',
  clearance: '2',
  status: 'SEALED',
  ability: '視認した人物の短期記憶を反転混濁させる。\
布越しでは効果減衰。',
  record: '天理市旧坑道にて回収。\
回収班2名が記憶混濁を発症した。'
},

{
  id: 'OBJ-002',
  category: 'object',
  name: '不確定な砂時計',
  description: '概要\
中身の砂が「上から下」ではなく「過去から未来」へ流れると推測される砂時計。\
【外見】\
枠組みは未知の黒い金属製。砂は銀色に発光している。\
【危険性】\
半径5m以内の時間の流れを不安定にさせる。',
  clearance: '2',
  status: 'CONTAINED',
  ability: '【異常性】\
砂時計を反転させた際、周囲の「直近10秒間の出来事」をランダムに再抽選する。\
【発動条件】\
砂がすべて下に落ちきった状態で、特定の波長の音を聴かせる。\
【制御方法】\
常に真空状態のコンテナ内に固定し、音波を遮断することで活性化を防ぐ。',
  record: '【発見経緯】\
██県内の廃校にて、30年間時間が止まっていた教室の中心で発見。\
【事故報告】\
回収任務中、エージェントが誤って反転。\
結果、その場にいた全員の「朝食の内容」が書き換わったが、幸いにも深刻な因果律崩壊は免れた。',
},
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
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function beep(freq,dur,vol=0.03){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(vol,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime + dur/1000);
  osc.start();
  osc.stop(audioCtx.currentTime + dur/1000);
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
    if(text) text.innerHTML = `TENRI NETWORK<br><br>LOADING${dots[i]}`;
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

  if(u === 'admin' && p === '226227'){
    // 外側をシングルクォートにするなら、内側の class はダブルクォートにする
    document.querySelector('.loginBox').innerHTML = '<div class="blink">AUTHENTICATING...</div>';
    
    beep(900, 100);
    setTimeout(() => {
      showScreen('boot');
      startBoot();
    }, 1000);
  } else {
    loginAttempts++;
    beep(150, 200);

    if(loginAttempts >= MAX_ATTEMPTS) {
      dispatchAgent();
    } else {
      // 変数を入れたい場所は必ずバッククォート `` で囲む
      err.innerText = `ACCESS DENIED (${loginAttempts}/${MAX_ATTEMPTS})`;
    }
  }
}

/* =========================
   BOOT
========================= */
function startBoot(){
  const boot = document.getElementById('bootScreen');
  boot.innerHTML = '';
  const lines = [
    'TENRI NETWORK CORE INITIALIZED', 'LOADING SECURITY MODULES...', 'CHECKING CLEARANCE LEVELS...',
    'SYNCING PERSONNEL DATABASE...', 'SYNCING OBJECT DATABASE...', 'MOUNTING ARCHIVE NODES...',
    'ESTABLISHING TERMINAL LINK...', 'FINALIZING BOOT SEQUENCE...', 'ACCESS GRANTED', 'WELCOME, OPERATOR'
  ];
  let i = 0;
  function addLine(){
    if(i >= lines.length){
      setTimeout(finishBoot,700);
      return;
    }
    const div = document.createElement('div');
    div.innerText = lines[i];
    boot.appendChild(div);
    beep(260+i*25,20);
    i++;
    setTimeout(addLine,450);
  }
  addLine();
}

function finishBoot(){
  showScreen('main');
  document.getElementById('clearance').value = '1';
  updateClock();
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
      // 全体をバッククォートで囲み、中のクラス名はダブルクォートにする
      txt = `NAME: ${currentFile.name}
CATEGORY: ${currentFile.category.toUpperCase()}
STATUS: <span class="status ${sClass}">${currentFile.status || 'UNKNOWN'}</span>`;
      break;

    case 'ability': 
      txt = currentFile.ability || 'NO DATA'; 
      break;

    case 'artifact': 
      txt = currentFile.Description || currentFile.description || 'NO DATA'; 
      break;

    case 'record': 
      txt = currentFile.record || 'NO DATA'; 
      break;
  }
  
  // HTMLとして解釈させることで <span> タグを有効にする
  r.innerHTML = txt;
  beep(1000,15);
}

/* =========================
   DATA PANEL
========================= */
function toggleDataPanel(){
  const panel = document.getElementById('dataPanel');
  panel.classList.toggle('open');
  if(panel.classList.contains('open')) loadDataList();
}

function setCategory(cat){
  currentCategory = cat;
  loadDataList();
  document.querySelectorAll('#categoryTabs button').forEach(btn=>btn.classList.remove('activeCat'));
  if(cat==='personnel') document.querySelectorAll('#categoryTabs button')[0].classList.add('activeCat');
  else document.querySelectorAll('#categoryTabs button')[1].classList.add('activeCat');
}

function loadDataList(){
  const list = document.getElementById('dataList');
  if(!list) return;

  list.innerHTML = '';
  const data = database[currentCategory];

  if(!data || data.length === 0){
    // クォートの衝突を避けるため、外をダブル、内をシングルにするか、バッククォートを使う
    list.innerHTML = '<div class="staffEntry">NO DATA</div>';
    return;
  }

  data.forEach(f => {
    const div = document.createElement('div');
    div.className = 'staffEntry';
    const sClass = getStatusClass(f.status);

    // 【重要】全体をバッククォート `` で囲むことで、改行と変数の埋め込みを有効にする
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:12px; opacity:0.8;">ID : ${f.id}</div>
        <div class="${sClass}" style="font-size:10px;">● ${f.status || 'UNKNOWN'}</div>
      </div>
      <div style="margin-top:4px; font-weight:bold;">NAME : ${f.name}</div>
    `;

    div.onclick = () => {
      document.getElementById('staffId').value = f.id;
      searchFile();
      document.getElementById('dataPanel').classList.remove('open');
    };
    list.appendChild(div);
  });
}

/* =========================
   EMERGENCY CONSOLE
========================= */
function startAltReality(){
  initAudio();
  showScreen('emergency');
  const log = document.getElementById('consoleLog');
  const buttons = document.getElementById('consoleButtons');
  log.innerText = ''; buttons.innerHTML = '';
  const lines = ['[SYSTEM] EMERGENCY OVERRIDE INITIATED', '[SYSTEM] TERMINAL LINK COMPROMISED', '[WARNING] UNKNOWN PROCESS DETECTED', '[SYSTEM] ISOLATING CORE SYSTEMS...', '[SYSTEM] ACCESS RESTRICTED ZONE ENTERED', '', '[ACTION REQUIRED]'];
  let i = 0;
  function printLine(){
    if(i >= lines.length){ showEmergencyButtons(); return; }
    log.innerText += lines[i] + '\n';
    log.scrollTop = log.scrollHeight;
    beep(220+i*20,20); i++;
    setTimeout(printLine,450);
  }
  function showEmergencyButtons(){
    const execBtn = document.createElement('button');
    const abortBtn = document.createElement('button');
    execBtn.innerText = 'EXECUTE CONTAINMENT';
    abortBtn.innerText = 'ABORT';
    execBtn.onclick = ()=>{ log.innerText += '\n[SYSTEM] CONTAINMENT EXECUTED'; setTimeout(()=>location.reload(),1400); };
    abortBtn.onclick = ()=>{ log.innerText += '\n[SYSTEM] OVERRIDE FAILED'; setTimeout(()=>location.reload(),1400); };
    buttons.appendChild(execBtn); buttons.appendChild(abortBtn);
  }
  printLine();
}

/* =========================
   AGENT DISPATCH
========================= */
function dispatchAgent(){
  initAudio();
  showScreen('agent');
  const log = document.getElementById('agentLog');
  if(!log) return; // 念のため要素チェック
  
  log.innerText = '';
  const intro = [
    '[SECURITY ALERT]', 
    'UNAUTHORIZED LOGIN ATTEMPTS : 3', 
    'IDENTITY CONFIRMATION FAILED', 
    'CURRENT TERMINAL FLAGGED', 
    '', 
    'DISPATCHING FIELD AGENT...'
  ];
  
  let i = 0;

  // 1. テキストを一行ずつ表示する関数
  function print(){
    if(i >= intro.length){ 
      startCountdown(); 
      return; 
    }
    log.innerText += intro[i] + '\n';
    beep(130 + i * 10, 35); 
    i++;
    setTimeout(print, 500);
  }

  // 2. カウントダウンを開始する関数
  function startCountdown(){
    let time = 12;
    const timer = setInterval(() => {
      // バッククォートを使用
      log.innerText = intro.join('\n') + `\n\nAGENT ETA : 00:00:${String(time).padStart(2, '0')}\n[ DO NOT LEAVE YOUR POSITION ]`;
      
      beep(180, 20, 0.02); 
      time--;
      
      if(time < 0){ 
        clearInterval(timer); 
        location.reload(); // ページをリセットして「エージェントが来た」ことにする
      }
    }, 1000);
  }

  // 実行開始
  print();
}

/* =========================
   AMNESTIC PROTOCOL
========================= */
function startAmnesticProtocol(){
  initAudio();
  showScreen('amnestic');
  const overlay = document.getElementById('amnesticOverlay');
  overlay.innerHTML = '';
  const lines = ['[COGNITIVE SECURITY BREACH]', 'UNAUTHORIZED CLEARANCE ESCALATION DETECTED', 'MEMETIC TRACE CONFIRMED', '', 'INITIATING CLASS-A AMNESTIC RESPONSE...', 'PURGING SHORT TERM MEMORY...', 'NEURAL INTERFERENCE DEPLOYED...'];
  let i = 0;
  function print(){
    if(i >= lines.length){ setTimeout(()=>location.reload(),3000); return; }
    const div = document.createElement('div');
    div.innerText = lines[i]; overlay.appendChild(div);
    beep(100+i*15,40,0.03); i++;
    setTimeout(print,650);
  }
  print();
}

function verifyClearanceCode(){
  initAudio();
  const input = document.getElementById('authInput').value.trim();
  const correct = clearanceCodes[pendingClearanceLevel];
  if(input === correct){
    beep(900,80);
    document.getElementById('clearanceAuth').style.display = 'none';
    document.getElementById('result').innerText = 'CLEARANCE LEVEL ${pendingClearanceLevel} VERIFIED';
    clearanceAttempts = 0; return;
  }
  clearanceAttempts++;
  beep(120,250);
  document.getElementById('authError').innerText = 'AUTH FAILED (${clearanceAttempts}/${MAX_CLEARANCE_ATTEMPTS})';
  document.getElementById('authInput').value = '';
  document.getElementById('clearance').value = '1';
  if(clearanceAttempts >= MAX_CLEARANCE_ATTEMPTS){
    document.getElementById('clearanceAuth').style.display = 'none';
    startAmnesticProtocol();
  }
}

/* =========================
   STATUS LOGIC
========================= */
function getStatusClass(status) {
  switch(status) {
    case 'ACTIVE':
    case 'CONTAINED':
      return 'state-ACTIVE';
    case 'TERMINATED':
    case 'NEUTRALIZED':
      return 'state-TERMINATED';
    case 'MISSING':
      return 'state-MISSING';
    default:
      return '';
  }
}

function setState(id, newState){
  const target = database.personnel.find(x => x.id === id) || database.objects.find(x => x.id === id);
  if(!target) return;
  target.status = newState;
  loadDataList();
}