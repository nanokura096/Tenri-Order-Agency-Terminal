/* =========================
   DATABASE
========================= */
const files = [
  {
    id:"AP-000000",
    name:"鳴瀬 可楚",
    sex:"FEMALE",
    age:"██",
    division:"鳴響",
    rank:"Leader",
    ability:`因報
強大な力を利用して戦闘を行うが彼女自身には限界がないため危険な状態に陥っても活動を続ける可能性がある。
また、翠色の結晶を飛ばすことが可能で、任意のタイミングで爆破可能。
だが、観測者が増えるごとに威力が弱まる。`,
    status:"ACTIVE",
    clearance:"3",
    profile:"対象は鳴響隊長である。",
    weapon:"天理楔",
    Description:`全長██cmの鉾。
天逆鉾のような形をしているが、柄([アクセス拒否])は取り外しが可。
代わりに、元の柄の1/3の長さの柄([アクセス拒否])を取り付けることも可能。
その柄は鳴響チーム所属隊員αの体とリンクしており、能力を鉾で発動することもできる。
また、攻撃された人間の行動を「拒否」することが可能。`,
    record:"[アクセス拒否]",
    note:"精神状態は安定しているが、いつも問題を持ってくる。"
  }
];

/* =========================
   GLOBAL
========================= */
let currentFile = null;
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let audioCtx = null;
let emergencyInterval = null;
let clockTimer = null;

/* =========================
   AUDIO
========================= */
function initAudio(){
  try{
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === "suspended") audioCtx.resume();
  }catch(e){}
}

function beep(freq,dur,vol=0.05){
  if(!audioCtx) return;

  try{
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = freq;
    osc.type = "square";

    gain.gain.setValueAtTime(vol,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime + dur/1000);

    osc.start();
    osc.stop(audioCtx.currentTime + dur/1000);
  }catch(e){}
}

/* =========================
   LOGIN
========================= */
function login(){
  initAudio();

  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const err = document.getElementById("loginError");

  if(!userEl || !passEl || !err) return;

  const u = userEl.value.trim();
  const p = passEl.value.trim();

  if(u === "admin" && p === "226227"){
    loginAttempts = 0;

    const box = document.getElementById("loginBox");
    if(box) box.innerHTML = `<div class="blink">AUTHENTICATING...</div>`;

    beep(900,120,0.08);

    setTimeout(()=>{
      document.getElementById("loginScreen").style.display = "none";
      startLoadingSequence();
    },1200);

  }else{
    loginAttempts++;
    beep(180,500,0.15);

    if(loginAttempts >= MAX_ATTEMPTS){
      initiateAmnestic();
    }else{
      err.innerText = `ACCESS DENIED. REMAINING: ${MAX_ATTEMPTS-loginAttempts}`;
    }
  }
}

function initiateAmnestic(){
  const ov = document.getElementById("amnesticOverlay");
  if(!ov) return;

  ov.style.display = "flex";

  const siren = setInterval(()=>{
    beep(100,700,0.2);
    setTimeout(()=>beep(150,700,0.2),800);
  },1600);

  setTimeout(()=>{
    clearInterval(siren);
    location.reload();
  },8000);
}

/* =========================
   BOOT
========================= */
function startLoadingSequence(){
  const boot = document.getElementById("bootScreen");
  if(!boot) return;

  boot.style.display = "block";
  boot.innerHTML = "";

  const lines = [
    "> INITIALIZING BOOT SEQUENCE...",
    "> CHECKING HARDWARE... [OK]",
    "> CONNECTING TO TENRI-NETWORK... [CONNECTED]",
    "> LOADING ENCRYPTION MODULES...",
    "> VERIFYING CLEARANCE LEVEL...",
    "> WELCOME, ADMINISTRATOR."
  ];

  let i = 0;

  function add(){
    if(i < lines.length){
      const div = document.createElement("div");
      div.innerText = lines[i];
      boot.appendChild(div);
      div.scrollIntoView({behavior:"smooth",block:"end"});
      beep(500 + i*120,40,0.03);
      i++;
      setTimeout(add,700);
    }else{
      setTimeout(finishBoot,1000);
    }
  }

  add();
}

function finishBoot(){
  document.getElementById("bootScreen").style.display = "none";
  document.getElementById("mainTerminal").style.display = "block";

  updateClock();

  if(clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateClock,1000);

  loadStaffList();
  setupClearanceListener();
}

/* =========================
   TERMINAL ENGINE
========================= */
function setupClearanceListener(){
  const select = document.getElementById("clearance");
  if(!select) return;

  select.onchange = function(e){
    const res = document.getElementById("result");
    beep(1200,50,0.05);

    if(res){
      res.innerHTML = `<div class="blink" style="text-align:center;margin-top:50px;">[ AUTHENTICATING LEVEL ${e.target.value}... ]</div>`;
    }

    setTimeout(()=>{
      const idField = document.getElementById("staffId");
      if(idField && idField.value.trim()){
        searchFile();
      }else{
        if(res) res.innerText = "READY";
      }
    },800);
  };
}

function updateClock(){
  const status = document.getElementById("statusbar");
  if(!status) return;

  const now = new Date();
  status.innerText = "SYSTEM ONLINE / USER: admin / " + now.toLocaleString();
}

function searchFile(){
  initAudio();

  const idField = document.getElementById("staffId");
  const clearField = document.getElementById("clearance");
  const r = document.getElementById("result");

  if(!idField || !clearField || !r) return;

  const id = idField.value.trim();

  if(!id){
    r.innerText = "READY";
    return;
  }

  const cl = parseInt(clearField.value,10);
  const found = files.find(f=>f.id===id);

  if(!found || cl < parseInt(found.clearance,10)){
    r.innerText = "ACCESS DENIED";
    beep(200,500,0.2);
    return;
  }

  currentFile = found;
  document.getElementById("tabs").style.display = "flex";
  showTab("personnel");
}

function showTab(tab){
  if(!currentFile) return;

  beep(1500,30);

  const r = document.getElementById("result");
  if(!r) return;

  r.innerHTML = "";
  r.scrollTop = 0;

  let txt = "";

  switch(tab){
    case "personnel":
      txt =
`NAME: ${currentFile.name}
DIVISION: ${currentFile.division}
RANK: ${currentFile.rank}
STATUS: ${currentFile.status}

${currentFile.profile}`;
      break;

    case "ability":
      txt =
`[ABILITY DATA]

${currentFile.ability}`;
      break;

    case "artifact":
      txt =
`WEAPON: ${currentFile.weapon}

${currentFile.Description || "NO DATA"}`;
      break;

    case "record":
      txt =
`RECORD: ${currentFile.record}

NOTE: ${currentFile.note}`;
      break;
  }

  r.innerText = txt;
}

function loadStaffList(){
  const list = document.getElementById("staffList");
  if(!list) return;

  list.innerHTML = "";

  files.forEach(f=>{
    const div = document.createElement("div");
    div.className = "staffEntry";
    div.innerText = `ID: ${f.id} / NAME: ${f.name}`;

    div.addEventListener("click",()=>{
      document.getElementById("staffId").value = f.id;
      searchFile();
    });

    list.appendChild(div);
  });
}

function toggleStaffList(){
  const list = document.getElementById("staffList");
  if(!list) return;

  list.style.display = list.style.display === "block" ? "none" : "block";
  beep(1000,50,0.04);
}

/* =========================
   EMERGENCY
========================= */
function triggerEmergency(){
  initAudio();

  const ov = document.getElementById("emergencyOverlay");
  const msg = document.getElementById("emergencyMsg");
  const choices = document.getElementById("emergencyChoices");

  if(!ov || !msg || !choices) return;

  ov.style.display = "flex";
  ov.style.pointerEvents = "auto";
  ov.style.background = "rgba(100,0,0,0.9)";

  emergencyInterval = setInterval(()=>{
    beep(100,800,0.2);
  },1000);

  msg.innerHTML = `[ ALERT ]<br><br>緊急事態を検知。<br>エージェントが向かっています。<br>待機してください。`;
  choices.innerHTML = "";

  setTimeout(()=>{
    ov.style.background = "black";
    msg.innerHTML = `SYSTEM_OVERRIDE_COMPLETE...<br><br>緊急事態は解決しましたか？`;

    choices.innerHTML = `
      <button type="button" id="yesBtn">はい</button>
      <button type="button" id="noBtn">いいえ</button>
    `;

    document.getElementById("yesBtn").addEventListener("click",resolveEmergency);
    document.getElementById("noBtn").addEventListener("click",forceYes);

    beep(1500,200,0.1);
  },5000);
}

function forceYes(){
  const noBtn = document.getElementById("noBtn");
  const msg = document.getElementById("emergencyMsg");

  if(!noBtn || !msg) return;

  noBtn.innerText = "はい";
  noBtn.removeEventListener("click",forceYes);
  noBtn.addEventListener("click",resolveEmergency);

  msg.innerHTML += `<br><span style="color:red;">[ 否定は許可されていません ]</span>`;
  beep(400,100,0.2);
}

function resolveEmergency(){
  clearInterval(emergencyInterval);

  const ov = document.getElementById("emergencyOverlay");
  if(!ov) return;

  ov.style.background = "white";

  setTimeout(()=>{
    ov.style.display = "none";
    ov.style.background = "rgba(255,0,0,0.8)";
    ov.style.pointerEvents = "none";
  },150);

  beep(1800,100,0.1);
}

/* =========================
   EVENT BIND
========================= */
document.addEventListener("DOMContentLoaded",()=>{

  document.getElementById("loginBtn").addEventListener("click",login);
  document.getElementById("searchBtn").addEventListener("click",searchFile);
  document.getElementById("staffListTitle").addEventListener("click",toggleStaffList);
  document.getElementById("emergencyBtn").addEventListener("click",triggerEmergency);

  document.getElementById("password").addEventListener("keydown",(e)=>{
    if(e.key === "Enter") login();
  });

  document.querySelectorAll("#tabs button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      showTab(btn.dataset.tab);
    });
  });

});
