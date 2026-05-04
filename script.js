/* =========================
   DATABASE
========================= */
const database ={

  personnel: [
  {
    id:"AP-000000",
    name:"鳴瀬 可楚",
    sex:"FEMALE",
    age:"██",
    division:"鳴響",
    rank:"Leader",
    ability:`因報\n強大な力を利用して戦闘を行うが彼女自身には限界がないため危険な状態に陥っても活動を続ける可能性がある。\nまた、翠色の結晶を飛ばすことが可能で、任意のタイミングで爆破可能。\nだが、観測者が増えるごとに威力が弱まる。`,
    status:"ACTIVE",
    clearance:"3",
    profile:"対象は鳴響隊長である。",
    weapon:"天理楔",
    Description:`全長██cmの鉾。\n天逆鉾のような形をしているが、柄([アクセス拒否])は取り外しが可。\nその柄は鳴響チーム所属隊員αの体とリンクしており、能力を鉾で発動することもできる。\nまた、攻撃された人間の行動を「拒否」することが可能。`,
    record:"[アクセス拒否]",
    note:"精神状態は安定しているが、いつも問題を持ってくる。"
  }
   ],
 objects: [
    {
      id:"OBJ-001",
      name:"天理楔",
      type:"weapon",
      description:`全長██cmの鉾。...`,
      owner:"AP-000000"
    }
  ]
};



/* =========================
   CLEARANCE PASSWORDS
========================= */
const clearancePasswords = {
  1: "ACCESS",
  2: "TENRI",
  3: "BLACKBOX",
  4: "CONTAINMENT",
  5: "SOVEREIGN"
};

/* =========================
   STATE
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
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + dur/1000
    );

    osc.start();
    osc.stop(audioCtx.currentTime + dur/1000);
  }catch(e){}
}

/* =========================
   LOGIN
========================= */
function login(){
  initAudio();

  const u = document.getElementById("username")?.value.trim();
  const p = document.getElementById("password")?.value.trim();
  const err = document.getElementById("loginError");

  if(u === "admin" && p === "226227"){
    loginAttempts = 0;

    document.querySelector(".loginBox").innerHTML =
      `<div class="blink">AUTHENTICATING...</div>`;

    beep(900,120,0.08);

    setTimeout(()=>{
      document.getElementById("loginScreen").style.display = "none";
      startBoot();
    },1000);

  }else{
    loginAttempts++;
    beep(180,400,0.15);

    if(loginAttempts >= MAX_ATTEMPTS){
      triggerAmnestic();
    }else{
      if(err){
        err.innerText = `ACCESS DENIED (${loginAttempts}/${MAX_ATTEMPTS})`;
      }
    }
  }
}

/* =========================
   BOOT
========================= */
function startBoot(){
  const boot = document.getElementById("bootScreen");
  boot.style.display = "block";
  boot.innerHTML = "";

  const lines = [
    "> INITIALIZING SYSTEM...",
    "> CONNECTING DATABASE...",
    "> BYPASS FIREWALL...",
    "> ACCESS GRANTED"
  ];

  let i = 0;

  const add = ()=>{
    if(i >= lines.length){
      setTimeout(finishBoot,800);
      return;
    }

    const d = document.createElement("div");
    d.innerText = lines[i];
    boot.appendChild(d);

    beep(400+i*80,40,0.03);
    i++;
    setTimeout(add,500);
  };

  add();
}

function finishBoot(){
  document.getElementById("bootScreen").style.display = "none";
  document.getElementById("mainTerminal").style.display = "block";

  updateClock();
  clockTimer = setInterval(updateClock,1000);

  loadStaffList();
  setupTabs();
}

/* =========================
   CLOCK
========================= */
function updateClock(){
  const s = document.getElementById("statusbar");
  if(!s) return;

  s.innerText =
    "SYSTEM ONLINE / " + new Date().toLocaleString();
}

/* =========================
   SEARCH + CLEARANCE AUTH
========================= */
function searchFile(){
  initAudio();

  const id = document.getElementById("staffId")?.value.trim();
  const cl = parseInt(document.getElementById("clearance")?.value);
  const r = document.getElementById("result");

  const found = database.personnel.find(f => f.id === id);

  if(!found){
    r.innerText = "NOT FOUND";
    return;
  }

  // 🔥 ここが今回の核心（合言葉認証）
  if(cl < parseInt(found.clearance)){
    const pass = prompt(`CLEARANCE LV${found.clearance} AUTH REQUIRED`);

    if(pass !== clearancePasswords[found.clearance]){
      r.innerText = "AUTH FAILED";
      beep(200,400,0.2);
      return;
    }

    beep(600,100,0.1);
  }

  currentFile = found;
  document.getElementById("tabs").style.display = "flex";
  showTab("personnel");
}

/* =========================
   TABS
========================= */
function setupTabs(){
  document.querySelectorAll("#tabs button").forEach(btn=>{
    btn.onclick = ()=>showTab(btn.dataset.tab);
  });
}

function showTab(tab){
  if(!currentFile) return;

  const r = document.getElementById("result");
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
      txt = `[ABILITY]\n${currentFile.ability}`;
      break;

    case "artifact":
      txt =
`WEAPON: ${currentFile.weapon}
${currentFile.Description}`;
      break;

    case "record":
      txt =
`RECORD: ${currentFile.record}
NOTE: ${currentFile.note}`;
      break;
  }

  r.innerText = txt;
  beep(1200,30);
}

/* =========================
   STAFF LIST
========================= */
function loadStaffList(){
  const list = document.getElementById("staffList");
  list.innerHTML = "";

  database.personnel.forEach(f=>{
    const div = document.createElement("div");
    div.className = `staffEntry status-${f.status}`;

    div.innerHTML = `
      <div>ID: ${f.id}</div>
      <div>NAME: ${f.name}</div>
      <div>STATUS: ${f.status}</div>
    `;

    div.onclick = ()=>{
      document.getElementById("staffId").value = f.id;
      searchFile();
    };

    list.appendChild(div);
  });
}


/* =========================
   EMERGENCY
========================= */
function triggerAmnestic(){
  const ov = document.getElementById("amnesticOverlay");
  ov.style.display = "flex";

  emergencyInterval = setInterval(()=>{
    beep(100,500,0.2);
  },800);

  setTimeout(()=>location.reload(),6000);
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("loginBtn")?.addEventListener("click",login);
  document.getElementById("searchBtn")?.addEventListener("click",searchFile);
  document.getElementById("emergencyBtn")?.addEventListener("click",triggerAmnestic);
});