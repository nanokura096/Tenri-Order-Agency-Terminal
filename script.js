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
      ability: `因報\n強大な力を利用して戦闘を行うが彼女自身には限界がないため危険な状態に陥っても活動を続ける可能性がある。\nまた、翠色の結晶を飛ばすことが可能で、任意のタイミングで爆破可能。\nだが、観測者が増えるごとに威力が弱まる。`,
      status: "ACTIVE",
      clearance: "3",
      Description: `全長██cmの鉾。\n天逆鉾のような形をしているが、柄は取り外し可能。`,
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
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let audioCtx = null;
let currentCategory = "personnel";

/* =========================
   SCREEN CONTROLLER
========================= */
function showScreen(mode) {
  const startup = document.getElementById("startupScreen");
  const login = document.getElementById("loginScreen");
  const boot = document.getElementById("bootScreen");
  const main = document.getElementById("mainTerminal");

  [startup, login, boot, main].forEach(el => {
    if (el) el.style.display = "none";
  });

  if (mode === "startup") startup.style.display = "flex";
  if (mode === "login") login.style.display = "flex";
  if (mode === "boot") boot.style.display = "block";
  if (mode === "main") main.style.display = "block";
}

/* =========================
   AUDIO
========================= */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function beep(freq, dur, vol = 0.05) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.value = freq;
  osc.type = "square";

  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + dur / 1000
  );

  osc.start();
  osc.stop(audioCtx.currentTime + dur / 1000);
}

/* =========================
   STARTUP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  showScreen("startup");

  const text = document.querySelector(".startupText");
  const dots = ["", ".", "..", "..."];
  let i = 0;

  const interval = setInterval(() => {
    if (text) {
      text.innerHTML = `TENRI NETWORK<br><br>LOADING${dots[i]}`;
    }
    i = (i + 1) % dots.length;
  }, 400);

  setTimeout(() => {
    clearInterval(interval);
    showScreen("login");
  }, 5000);

  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("searchBtn")?.addEventListener("click", searchFile);
  document.getElementById("emergencyBtn")?.addEventListener("click", startAltReality);

  setupTabs();
  setupToggle();
});

/* =========================
   LOGIN
========================= */
function login() {
  initAudio();

  const u = document.getElementById("username")?.value.trim();
  const p = document.getElementById("password")?.value.trim();
  const err = document.getElementById("loginError");

  if (u === "admin" && p === "226227") {
    loginAttempts = 0;

    document.querySelector(".loginBox").innerHTML =
      `<div class="blink">AUTHENTICATING...</div>`;

    beep(900, 120, 0.08);

    setTimeout(() => {
      showScreen("boot");
      startBoot();
    }, 1000);

  } else {
    loginAttempts++;
    beep(180, 300, 0.15);

    if (loginAttempts >= MAX_ATTEMPTS) {
      location.reload();
    } else if (err) {
      err.innerText = `ACCESS DENIED (${loginAttempts}/${MAX_ATTEMPTS})`;
    }
  }
}

/* =========================
   BOOT
========================= */
function startBoot() {
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

  function add() {
    if (i >= lines.length) {
      setTimeout(() => {
        showScreen("main");
        finishBoot();
      }, 800);
      return;
    }

    const div = document.createElement("div");
    div.innerText = lines[i];
    boot.appendChild(div);

    beep(300 + i * 40, 40, 0.03);

    i++;
    setTimeout(add, 500);
  }

  add();
}

/* =========================
   FINISH BOOT
========================= */
function finishBoot() {
  showScreen("main");

  updateClock();
  setInterval(updateClock, 1000);

  loadStaffList();
  setupTabs();
  setupToggle();

  const panel = document.getElementById("staffPanel");
  if (panel) panel.classList.add("open");
}

/* =========================
   CLOCK
========================= */
function updateClock() {
  const s = document.getElementById("statusbar");
  if (!s) return;
  s.innerText = "SYSTEM ONLINE / " + new Date().toLocaleString();
}

/* =========================
   SEARCH
========================= */
function searchFile() {
  initAudio();

  const id = document.getElementById("staffId")?.value.trim();
  const cl = parseInt(document.getElementById("clearance")?.value || "0");
  const r = document.getElementById("result");

  if (!id) {
    r.innerText = "READY";
    return;
  }

  const found =
    database.personnel.find(f => f.id === id) ||
    database.objects.find(f => f.id === id);

  if (!found) {
    r.innerText = "NOT FOUND";
    beep(200, 300, 0.2);
    return;
  }

  if (cl < parseInt(found.clearance || "0")) {
    r.innerText = "ACCESS DENIED";
    beep(200, 400, 0.2);
    return;
  }

  currentFile = found;

  document.getElementById("tabs").style.display = "flex";
  showTab("personnel");
}

/* =========================
   TABS
========================= */
function setupTabs() {
  document.querySelectorAll("#tabs button").forEach(btn => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });
}

function showTab(tab) {
  if (!currentFile) return;

  const r = document.getElementById("result");

  let txt = "";

  switch (tab) {
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
  beep(1200, 30);
}

/* =========================
   STAFF LIST
========================= */
function loadStaffList() {
  const list = document.getElementById("staffList");
  if (!list) return;

  list.innerHTML = "";

  const data = database[currentCategory] || [];

  data.forEach(f => {
    const div = document.createElement("div");
    div.className = "staffEntry";
    div.innerHTML = `
      <div>ID: ${f.id}</div>
      <div>NAME: ${f.name}</div>
    `;

    div.onclick = () => {
      document.getElementById("staffId").value = f.id;
      searchFile();
    };

    list.appendChild(div);
  });
}

/* =========================
   CATEGORY
========================= */
function setCategory(cat) {
  currentCategory = cat;
  loadStaffList();
}

/* =========================
   TOGGLE
========================= */
function setupToggle() {
  const toggle = document.getElementById("categoryTabs");
  const panel = document.getElementById("staffPanel");

  if (!toggle || !panel) return;

  toggle.onclick = () => {
    panel.classList.toggle("open");
    beep(800, 50, 0.05);
  };
}

/* =========================
   ALT REALITY
========================= */
function startAltReality() {
  const ov = document.getElementById("altRealityOverlay");
  const text = document.getElementById("altText");
  const choices = document.getElementById("altChoices");

  ov.style.display = "flex";
  text.innerHTML = "";
  choices.innerHTML = "";

  const lines = [
    "Agent is in coming...",
    "Alternative Reality System Is Starting",
    "Alternative Reality System Is Already Ready",
    "",
    "EXECUTE PROCESS?"
  ];

  let i = 0;

  function type() {
    if (i >= lines.length) return showChoices();

    const div = document.createElement("div");
    div.innerText = lines[i];
    text.appendChild(div);

    beep(200 + i * 40, 50, 0.05);

    i++;
    setTimeout(type, 500);
  }

  function showChoices() {
    const yes = document.createElement("button");
    const no = document.createElement("button");

    yes.innerText = "Yes";
    no.innerText = "No";

    yes.onclick = () => location.reload();
    no.onclick = () => {
      choices.innerHTML = "Yes / Yes";
      setTimeout(() => location.reload(), 1200);
    };

    choices.appendChild(yes);
    choices.appendChild(no);
  }

  type();
}