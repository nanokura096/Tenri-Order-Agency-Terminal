/* =========================
   DATABASE
========================= */
const database = {
  personnel: [
    {
      id: "AP-000000",
      category: "personnel",
      name: "鳴瀬 可楚",
      sex: "FEMALE",
      age: "██",
      division: "鳴響",
      rank: "Leader",
      ability: `因報
強大な力を利用して戦闘を行うが彼女自身には限界がないため危険な状態に陥っても活動を続ける可能性がある。
また、翠色の結晶を飛ばすことが可能で、任意のタイミングで爆破可能。
だが、観測者が増えるごとに威力が弱まる。`,
      status: "ACTIVE",
      clearance: "3",
      Description: `全長██cmの鉾。
天逆鉾のような形をしているが、柄は取り外し可能。`,
      record: "[アクセス拒否]"
    }
  ],
  objects: [
    {
      id: "OBJ-001",
      category: "object",
      name: "天理楔",
      description: "異常武装オブジェクト。",
      clearance: "3"
    }
  ]
};

/* =========================
   STATE
========================= */
let currentFile = null;
let currentCategory = "personnel";
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let audioCtx = null;
let clockLoop = null;

/* =========================
   SCREEN CONTROL
========================= */
function showScreen(mode){
  ["startupScreen","loginScreen","bootScreen","mainTerminal","emergencyConsole","agentDispatch"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
  });

  if(mode==="startup") document.getElementById("startupScreen").style.display="flex";
  if(mode==="login") document.getElementById("loginScreen").style.display="flex";
  if(mode==="boot") document.getElementById("bootScreen").style.display="block";
  if(mode==="main") document.getElementById("mainTerminal").style.display="block";
  if(mode==="emergency") document.getElementById("emergencyConsole").style.display="flex";
  if(mode==="agent") document.getElementById("agentDispatch").style.display="flex";
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
  osc.type = "square";
  gain.gain.setValueAtTime(vol,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime + dur/1000);
  osc.start();
  osc.stop(audioCtx.currentTime + dur/1000);
}

/* =========================
   STARTUP
========================= */
document.addEventListener("DOMContentLoaded",()=>{
  showScreen("startup");

  const text = document.querySelector(".startupText");
  const dots = ["",".","..","..."];
  let i = 0;

  const loading = setInterval(()=>{
    if(text){
      text.innerHTML = `TENRI NETWORK<br><br>LOADING${dots[i]}`;
    }
    i = (i+1)%dots.length;
  },400);

  setTimeout(()=>{
    clearInterval(loading);
    showScreen("login");
  },5000);

  document.getElementById("loginBtn")?.addEventListener("click",login);
  document.getElementById("searchBtn")?.addEventListener("click",searchFile);
  document.getElementById("emergencyBtn")?.addEventListener("click",startAltReality);
  document.getElementById("dataToggleBtn")?.addEventListener("click",toggleDataPanel);

  setupTabs();
});

/* =========================
   LOGIN
========================= */
function login(){
  initAudio();

  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  const err = document.getElementById("loginError");

  if(u==="admin" && p==="226227"){
    document.querySelector(".loginBox").innerHTML =
      `<div class="blink">AUTHENTICATING...</div>`;
    beep(900,100);

    setTimeout(()=>{
      showScreen("boot");
      startBoot();
    },1000);

  }else{
    loginAttempts++;
    beep(150,200);

    if(loginAttempts >= MAX_ATTEMPTS){
      dispatchAgent();
    }else{
      err.innerText = `ACCESS DENIED (${loginAttempts}/${MAX_ATTEMPTS})`;
    }
  }
}

/* =========================
   BOOT
========================= */
function startBoot(){
  const boot = document.getElementById("bootScreen");
  boot.innerHTML = "";

  const lines = [
    "TENRI NETWORK CORE INITIALIZED",
    "LOADING SECURITY MODULES...",
    "CHECKING CLEARANCE LEVELS...",
    "SYNCING PERSONNEL DATABASE...",
    "SYNCING OBJECT DATABASE...",
    "MOUNTING ARCHIVE NODES...",
    "ESTABLISHING TERMINAL LINK...",
    "FINALIZING BOOT SEQUENCE...",
    "ACCESS GRANTED",
    "WELCOME, OPERATOR"
  ];

  let i = 0;

  function addLine(){
    if(i >= lines.length){
      setTimeout(finishBoot,700);
      return;
    }

    const div = document.createElement("div");
    div.innerText = lines[i];
    boot.appendChild(div);
    beep(260+i*25,20);

    i++;
    setTimeout(addLine,450);
  }

  addLine();
}

function finishBoot(){
  showScreen("main");
  updateClock();

  if(clockLoop) clearInterval(clockLoop);
  clockLoop = setInterval(updateClock,1000);

  loadDataList();
}

/* =========================
   CLOCK
========================= */
function updateClock(){
  document.getElementById("statusbar").innerText =
    "SYSTEM ONLINE / " + new Date().toLocaleString();
}

/* =========================
   SEARCH
========================= */
function searchFile(){
  initAudio();

  const id = document.getElementById("staffId").value.trim();
  const cl = parseInt(document.getElementById("clearance").value);
  const r = document.getElementById("result");

  if(!id){
    r.innerText = "READY";
    return;
  }

  const found =
    database.personnel.find(x=>x.id===id) ||
    database.objects.find(x=>x.id===id);

  if(!found){
    r.innerText = "NOT FOUND";
    beep(150,200);
    return;
  }

  if(cl < parseInt(found.clearance)){
    r.innerText = "ACCESS DENIED";
    beep(120,250);
    return;
  }

  currentFile = found;
  document.getElementById("tabs").style.display = "flex";
  showTab("personnel");
}

/* =========================
   TAB SYSTEM
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
      txt = `NAME: ${currentFile.name}
CATEGORY: ${currentFile.category}
STATUS: ${currentFile.status || "UNKNOWN"}`;
      break;

    case "ability":
      txt = currentFile.ability || "NO DATA";
      break;

    case "artifact":
      txt = currentFile.Description || currentFile.description || "NO DATA";
      break;

    case "record":
      txt = currentFile.record || "NO DATA";
      break;
  }

  r.innerText = txt;
  beep(1000,15);
}

/* =========================
   DATA PANEL
========================= */
function toggleDataPanel(){
  const panel = document.getElementById("dataPanel");
  panel.classList.toggle("open");

  if(panel.classList.contains("open")){
    loadDataList();
  }
}

function setCategory(cat){
  currentCategory = cat;
  loadDataList();

  document.querySelectorAll("#categoryTabs button").forEach(btn=>{
    btn.classList.remove("activeCat");
  });

  if(cat==="personnel"){
    document.querySelectorAll("#categoryTabs button")[0].classList.add("activeCat");
  }else{
    document.querySelectorAll("#categoryTabs button")[1].classList.add("activeCat");
  }
}

function loadDataList(){
  const list = document.getElementById("dataList");
  if(!list) return;

  list.innerHTML = "";
  const data = database[currentCategory];

  if(!data || data.length===0){
    list.innerHTML = "<div class='staffEntry'>NO DATA</div>";
    return;
  }

  data.forEach(f=>{
    const div = document.createElement("div");
    div.className = "staffEntry";
    div.innerHTML = `
      <div>ID : ${f.id}</div>
      <div>NAME : ${f.name}</div>
    `;

    div.onclick = ()=>{
      document.getElementById("staffId").value = f.id;
      searchFile();
      document.getElementById("dataPanel").classList.remove("open");
    };

    list.appendChild(div);
  });
}

/* =========================
   EMERGENCY CONSOLE
========================= */
function startAltReality(){
  initAudio();
  showScreen("emergency");

  const log = document.getElementById("consoleLog");
  const buttons = document.getElementById("consoleButtons");

  log.innerText = "";
  buttons.innerHTML = "";

  const lines = [
    "[SYSTEM] EMERGENCY OVERRIDE INITIATED",
    "[SYSTEM] TERMINAL LINK COMPROMISED",
    "[WARNING] UNKNOWN PROCESS DETECTED",
    "[SYSTEM] ISOLATING CORE SYSTEMS...",
    "[SYSTEM] ACCESS RESTRICTED ZONE ENTERED",
    "",
    "[ACTION REQUIRED]"
  ];

  let i = 0;

  function printLine(){
    if(i >= lines.length){
      showEmergencyButtons();
      return;
    }

    log.innerText += lines[i] + "\n";
    log.scrollTop = log.scrollHeight;
    beep(220+i*20,20);

    i++;
    setTimeout(printLine,450);
  }

  function showEmergencyButtons(){
    const execBtn = document.createElement("button");
    const abortBtn = document.createElement("button");

    execBtn.innerText = "EXECUTE CONTAINMENT";
    abortBtn.innerText = "ABORT";

    execBtn.onclick = ()=>{
      log.innerText += "\n[SYSTEM] CONTAINMENT EXECUTED";
      setTimeout(()=>location.reload(),1400);
    };

    abortBtn.onclick = ()=>{
      log.innerText += "\n[SYSTEM] OVERRIDE FAILED";
      setTimeout(()=>location.reload(),1400);
    };

    buttons.appendChild(execBtn);
    buttons.appendChild(abortBtn);
  }

  printLine();
}

/* =========================
   AGENT DISPATCH
========================= */
function dispatchAgent(){
  initAudio();
  showScreen("agent");

  const log = document.getElementById("agentLog");
  log.innerText = "";

  const introLines = [
    "[SECURITY ALERT]",
    "UNAUTHORIZED LOGIN ATTEMPTS : 3",
    "IDENTITY CONFIRMATION FAILED",
    "CURRENT TERMINAL FLAGGED",
    "",
    "DISPATCHING FIELD AGENT...",
    "REQUESTING NEAREST RESPONSE UNIT..."
  ];

  let i = 0;

  function printIntro(){
    if(i >= introLines.length){
      startCountdown();
      return;
    }

    log.innerText += introLines[i] + "\n";
    beep(120+i*10,35);
    i++;
    setTimeout(printIntro,600);
  }

  function startCountdown(){
    let time = 12;

    const timer = setInterval(()=>{
      log.innerText =
`[SECURITY ALERT]
UNAUTHORIZED LOGIN ATTEMPTS : 3
IDENTITY CONFIRMATION FAILED
CURRENT TERMINAL FLAGGED

DISPATCHING FIELD AGENT...
REQUESTING NEAREST RESPONSE UNIT...
AGENT ETA : 00:00:${String(time).padStart(2,"0")}

[ DO NOT LEAVE YOUR POSITION ]`;

      beep(180,25,0.02);
      time--;

      if(time < 0){
        clearInterval(timer);
        log.innerText += "\n\nCONNECTION TERMINATED";
        beep(80,300,0.05);

        setTimeout(()=>location.reload(),1500);
      }
    },1000);
  }

  printIntro();
}