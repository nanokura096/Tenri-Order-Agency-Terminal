"use strict";

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
   CATEGORY
========================= */
function setCategory(cat) {
  currentCategory = cat;
  const panel = document.getElementById("staffPanel");
  if (panel) panel.classList.add("open");

  const list = document.getElementById("staffList");
  if (list) {
    list.innerHTML = "LOADING ARCHIVE...";
    list.style.maxHeight = "400px";
    list.style.opacity = "1";
  }

  setTimeout(loadStaffList, 300);
}

/* =========================
   AUDIO
========================= */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
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
      document.getElementById("loginScreen").style.display = "none";
      startBoot();
    }, 1000);
  } else {
    loginAttempts++;
    beep(180, 400, 0.15);

    if (loginAttempts >= MAX_ATTEMPTS) {
      startAltReality();
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
  boot.style.display = "block";
  boot.innerHTML = "";

  const lines = [
    "> ACCESS GRANTED",
    "> INITIALIZING SYSTEM CORE...",
    "> LOADING SECURITY MODULES...",
    "> VERIFYING CLEARANCE...",
    "> CONNECTING DATABASE...",
    "> SYNC PERSONNEL ARCHIVE...",
    "> SYNC OBJECT ARCHIVE...",
    "> FINALIZING...",
    "> WELCOME, OPERATOR"
  ];

  let i = 0;

  function add() {
    if (i >= lines.length) {
      setTimeout(finishBoot, 800);
      return;
    }

    const div = document.createElement("div");
    div.innerText = lines[i];
    boot.appendChild(div);

    beep(300 + i * 50, 40, 0.03);

    i++;

    let delay = 500;
    if (i === 5) delay = 1200;

    setTimeout(add, delay);
  }

  add();
}

function finishBoot() {
  document.getElementById("bootScreen").style.display = "none";
  document.getElementById("mainTerminal").style.display = "block";

  updateClock();
  setInterval(updateClock, 1000);

  const panel = document.getElementById("staffPanel");
  if (panel) panel.style.display = "block";

  setupTabs();
  setupToggle();
  loadStaffList();
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
    beep(200, 500, 0.2);
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
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
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
      <div>STATUS: ${f.status || "ACTIVE"}</div>
    `;

    div.onclick = () => {
      document.getElementById("staffId").value = f.id;
      searchFile();
    };

    list.appendChild(div);
  });
}

/* =========================
   TOGGLE
========================= */
function setupToggle() {
  const toggle = document.getElementById("staffListToggle");
  const panel = document.getElementById("staffPanel");

  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    beep(800, 50, 0.05);
    loadStaffList();
  });
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
    "> Alternative Reality System Is Starting",
    "> Alternative Reality System Is Already To Start",
    "",
    "EXECUTE PROCESS?"
  ];

  let i = 0;

  function type() {
    if (i >= lines.length) return showChoices();

    const d = document.createElement("div");
    d.innerText = lines[i];
    text.appendChild(d);

    beep(200 + i * 50, 60, 0.05);

    i++;
    setTimeout(type, 600);
  }

  function showChoices() {
    const yes = document.createElement("button");
    yes.innerText = "Yes";

    const no = document.createElement("button");
    no.innerText = "No";

    yes.onclick = () => location.reload();

    no.onclick = () => {
      choices.innerHTML = "<div>Yes / Yes</div>";
      setTimeout(() => location.reload(), 1500);
    };

    choices.appendChild(yes);
    choices.appendChild(no);
  }

  type();
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("searchBtn")?.addEventListener("click", searchFile);
  document.getElementById("emergencyBtn")?.addEventListener("click", startAltReality);
});