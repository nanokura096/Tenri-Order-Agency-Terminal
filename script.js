const files = [/* ここに今のfilesをそのまま入れる */];
let currentFile = null;
let loginAttempts = 0;
let audioCtx = null;
let emergencyInterval;

function initAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
}
function beep(freq,dur,vol=0.05){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.start();
  setTimeout(()=>{osc.stop();},dur);
}

document.getElementById("loginBtn").addEventListener("touchend",login);
document.getElementById("loginBtn").addEventListener("click",login);
document.getElementById("searchBtn").addEventListener("touchend",searchFile);
document.getElementById("searchBtn").addEventListener("click",searchFile);
document.getElementById("staffListTitle").addEventListener("touchend",toggleStaffList);
document.getElementById("staffListTitle").addEventListener("click",toggleStaffList);
document.getElementById("emergencyBtn").addEventListener("touchend",triggerEmergency);
document.getElementById("emergencyBtn").addEventListener("click",triggerEmergency);

document.querySelectorAll("#tabs button").forEach(btn=>{
  btn.addEventListener("touchend",()=>showTab(btn.dataset.tab));
  btn.addEventListener("click",()=>showTab(btn.dataset.tab));
});

function login(){
  initAudio();
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if(u === "admin" && p === "226227"){
    beep(800,100,0.1);
    document.getElementById("loginScreen").style.display="none";
    startLoadingSequence();
  }else{
    loginAttempts++;
    document.getElementById("loginError").innerText = "ACCESS DENIED " + loginAttempts + "/3";
    beep(150,400,0.2);
    if(loginAttempts>=3) initiateAmnestic();
  }
}

function initiateAmnestic(){
  const o = document.getElementById("amnesticOverlay");
  o.style.display="flex";
  setTimeout(()=>location.reload(),5000);
}

function startLoadingSequence(){
  const boot = document.getElementById("bootScreen");
  boot.style.display="block";
  boot.innerHTML="";
  const lines = [
    "> INITIALIZING BOOT SEQUENCE...",
    "> CHECKING HARDWARE... [OK]",
    "> CONNECTING TO TENRI-NETWORK...",
    "> LOADING ENCRYPTION MODULES...",
    "> VERIFYING CLEARANCE...",
    "> ACCESS GRANTED."
  ];
  let i=0;
  function add(){
    if(i<lines.length){
      const div=document.createElement("div");
      div.innerText=lines[i];
      boot.appendChild(div);
      div.scrollIntoView();
      beep(600+i*100,40);
      i++;
      setTimeout(add,700);
    }else{
      finishBoot();
    }
  }
  add();
}

function finishBoot(){
  setTimeout(()=>{
    document.getElementById("bootScreen").style.display="none";
    document.getElementById("mainTerminal").style.display="block";
    updateClock();
    setInterval(updateClock,1000);
    loadStaffList();
  },800);
}

function updateClock(){
  document.getElementById("statusbar").innerText = "SYSTEM ONLINE / " + new Date().toLocaleString();
}

function searchFile(){
  initAudio();
  const id = document.getElementById("staffId").value.trim();
  const cl = parseInt(document.getElementById("clearance").value);
  const found = files.find(f=>f.id===id);
  const r = document.getElementById("result");
  if(!found || cl < parseInt(found.clearance)){
    r.innerText = "ACCESS DENIED";
    beep(200,500,0.2);
    return;
  }
  currentFile = found;
  document.getElementById("tabs").style.display="flex";
  showTab("personnel");
}

function showTab(tab){
  if(!currentFile) return;
  beep(1500,30);
  const r = document.getElementById("result");
  let txt = "";
  if(tab==="personnel") txt = `NAME: ${currentFile.name}\nDIVISION: ${currentFile.division}\nRANK: ${currentFile.rank}\nSTATUS: ${currentFile.status}\n\n${currentFile.profile}`;
  if(tab==="ability") txt = currentFile.ability;
  if(tab==="artifact") txt = `WEAPON: ${currentFile.weapon}\n\n${currentFile.Description}`;
  if(tab==="record") txt = `RECORD: ${currentFile.record}\n\nNOTE: ${currentFile.note}`;
  r.innerText = txt;
  r.scrollTop = 0;
}

function loadStaffList(){
  const list = document.getElementById("staffList");
  list.innerHTML = "";
  files.forEach(f=>{
    const div = document.createElement("div");
    div.className = "staffEntry";
    div.innerText = `ID: ${f.id} / NAME: ${f.name}`;
    div.addEventListener("touchend",()=>{document.getElementById("staffId").value=f.id;searchFile();});
    div.addEventListener("click",()=>{document.getElementById("staffId").value=f.id;searchFile();});
    list.appendChild(div);
  });
}

function toggleStaffList(){
  const list = document.getElementById("staffList");
  list.style.display = list.style.display === "block" ? "none" : "block";
}

function triggerEmergency(){
  initAudio();
  const ov = document.getElementById("emergencyOverlay");
  ov.style.display = "flex";
  document.getElementById("emergencyMsg").innerHTML = "[ CRITICAL ERROR ]<br>緊急事態は解決しましたか？";
  document.getElementById("emergencyChoices").innerHTML = `
    <button onclick="resolveEmergency()">はい</button>
    <button onclick="resolveEmergency()">はい</button>
    <button onclick="resolveEmergency()">はい</button>
  `;
}

function resolveEmergency(){
  document.getElementById("emergencyOverlay").style.display = "none";
  beep(1800,100,0.1);
}