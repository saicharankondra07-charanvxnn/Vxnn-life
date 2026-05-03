const today = new Date().toISOString().slice(0,10);
const data = JSON.parse(localStorage.getItem("vxnnLifeData") || '{"days":{},"xp":0}');
const quotes = [
  "You don’t find willpower. You create it.",
  "Small steps daily become a powerful life.",
  "Discipline today, freedom tomorrow.",
  "Your future is built by today’s actions.",
  "No excuses. Just progress."
];

document.querySelectorAll("nav button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

document.querySelectorAll(".habit").forEach(h=>{
  h.checked = !!(data.days[today] && data.days[today][h.dataset.id]);
  h.onchange = updateUI;
});

document.getElementById("saveDay").onclick=()=>{
  data.days[today] = {};
  let addedXP = 0;
  document.querySelectorAll(".habit").forEach(h=>{
    data.days[today][h.dataset.id] = h.checked;
    if(h.checked) addedXP += Number(h.dataset.xp);
  });
  data.xp = Math.max(data.xp, 0) + addedXP;
  localStorage.setItem("vxnnLifeData", JSON.stringify(data));
  updateUI();
  alert("Today saved. Keep going, legend 🔥");
};

document.getElementById("newQuote").onclick=()=>{
  document.getElementById("motivationText").textContent = quotes[Math.floor(Math.random()*quotes.length)];
};

document.getElementById("voiceBtn").onclick=()=>{
  const msg = new SpeechSynthesisUtterance(document.getElementById("motivationText").textContent);
  msg.rate = 0.95;
  speechSynthesis.speak(msg);
};

document.getElementById("notifyBtn").onclick=async()=>{
  if(!("Notification" in window)){ alert("Notifications not supported here."); return; }
  const permission = await Notification.requestPermission();
  if(permission==="granted"){
    new Notification("VXNN LIFE ⚡", {body:"Stay focused. Your future is waiting."});
  }
};

function streak(){
  let count = 0;
  for(let i=0;i<365;i++){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    const day = data.days[key];
    if(day && Object.values(day).filter(Boolean).length===3) count++;
    else break;
  }
  return count;
}

function updateWeek(){
  const grid = document.getElementById("weekGrid");
  grid.innerHTML = "";
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    const day = data.days[key];
    const done = day && Object.values(day).filter(Boolean).length===3;
    const div = document.createElement("div");
    div.className = "day " + (done ? "done":"");
    div.textContent = d.toLocaleDateString("en-US",{weekday:"short"}).slice(0,3);
    grid.appendChild(div);
  }
}

function updateUI(){
  const done = [...document.querySelectorAll(".habit")].filter(h=>h.checked).length;
  const percent = Math.round(done/3*100);
  document.getElementById("focusScore").textContent = percent + "%";
  document.getElementById("streakDays").textContent = streak();
  document.getElementById("xpValue").textContent = data.xp;
  const level = data.xp < 300 ? "Starter" : data.xp < 1000 ? "Focused" : "Legend";
  document.getElementById("levelName").textContent = level;
  document.getElementById("levelBar").style.width = Math.min((data.xp % 1000)/10,100) + "%";
  updateWeek();
}
updateUI();

if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js"); }


// VXNN LIFE reminder sessions
const VXNN_REMINDERS = [
  {name: "Morning Power", time: "06:00", text: "Wake up strong. Today is another chance to build your future."},
  {name: "Afternoon Focus", time: "13:00", text: "Stay focused. Small actions today become big results tomorrow."},
  {name: "Evening Review", time: "20:30", text: "Review your day. Save your progress. Keep your streak alive."}
];

setInterval(() => {
  const now = new Date();
  const hhmm = now.toTimeString().slice(0,5);
  VXNN_REMINDERS.forEach(r => {
    const key = "vxnn-reminder-" + r.name + "-" + now.toISOString().slice(0,10);
    if (hhmm === r.time && localStorage.getItem(key) !== "done") {
      localStorage.setItem(key, "done");
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("VXNN LIFE ⚡ " + r.name, {body: r.text});
      }
      const voice = new SpeechSynthesisUtterance(r.text);
      voice.rate = 0.85;
      voice.pitch = 0.75;
      speechSynthesis.speak(voice);
    }
  });
}, 30000);
// 🔒 ADVANCED FOCUS MODE (POMODORO)

const focusBtn = document.getElementById("focusBtn");

if (focusBtn) {
  focusBtn.onclick = () => {

    let mode = "focus"; // focus or break
    let seconds = 25 * 60; // 25 min
    let timer = null;

    document.body.innerHTML = `
      <div style="
        height:100vh;
        background:#02050a;
        color:white;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        text-align:center;
        font-family:Arial;
        padding:20px;
      ">
        <h1 style="color:#42e1ff;">FOCUS MODE 🔒</h1>
        <h2 id="modeText">Focus Time</h2>
        <h1 id="focusTimer" style="font-size:40px;">25:00</h1>

        <div style="margin-top:20px;">
          <button id="pauseBtn">⏸ Pause</button>
          <button id="resumeBtn">▶ Resume</button>
          <button id="restartBtn">🔄 Restart</button>
        </div>

        <p style="margin-top:20px;">No distractions. Build your future.</p>
      </div>
    `;

    const updateDisplay = () => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      document.getElementById("focusTimer").textContent =
        `${m}:${s.toString().padStart(2,"0")}`;
    };

    const speak = (text) => {
      const voice = new SpeechSynthesisUtterance(text);
      voice.rate = 0.9;
      speechSynthesis.speak(voice);
    };

    const notify = (text) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("VXNN LIFE ⚡", { body: text });
      }
    };

    const startTimer = () => {
      timer = setInterval(() => {
        seconds--;
        updateDisplay();

        if (seconds <= 0) {
          clearInterval(timer);

          if (mode === "focus") {
            mode = "break";
            seconds = 5 * 60; // 5 min break
            document.getElementById("modeText").textContent = "Break Time 🧘";

            speak("Take a break. Relax for five minutes.");
            notify("Break time. Relax now.");

          } else {
            mode = "focus";
            seconds = 25 * 60;
            document.getElementById("modeText").textContent = "Focus Time 🔒";

            speak("Back to work. Stay focused.");
            notify("Focus again. Let's go.");
          }

          startTimer();
        }
      }, 1000);
    };

    startTimer();

    document.getElementById("pauseBtn").onclick = () => {
      clearInterval(timer);
    };

    document.getElementById("resumeBtn").onclick = () => {
      startTimer();
    };

    document.getElementById("restartBtn").onclick = () => {
      location.reload();
    };
  };
}
