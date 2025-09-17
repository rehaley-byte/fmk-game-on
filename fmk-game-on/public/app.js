// FMK — Netlify build (uses Netlify Function to keep NEWS_API_KEY private)

const el = (id) => document.getElementById(id);

const state = {
  round: 0,
  current: null,
  baselineScale: 20,
  sessionVotes: {}
};

function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let t=seed+0x6D2B79F5|0;t=Math.imul(t^t>>>15,1|t);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296}
function seededCrowd(title){const s=hashStr(title);const a=rng(s),b=rng(s+1),c=rng(s+2);const tot=a+b+c+1e-9;const N=Math.floor(state.baselineScale+rng(s+3)*state.baselineScale);return{F:Math.round(N*(a/tot)),M:Math.round(N*(b/tot)),K:Math.round(N*(c/tot))}}
function getSessionVotes(key){const raw=localStorage.getItem("fmk_votes");const obj=raw?JSON.parse(raw):{};state.sessionVotes=obj;return obj[key]||{F:0,M:0,K:0}}
function setSessionVotes(key,v){const raw=localStorage.getItem("fmk_votes");const obj=raw?JSON.parse(raw):{};obj[key]=v;localStorage.setItem("fmk_votes",JSON.stringify(obj));state.sessionVotes=obj}
function formatPct(n,t){return t===0?"0%":Math.round((n/t)*100)+"%"}
function renderHeadline(h){el("headline").textContent=h.title;el("byline").textContent=h.source||"";const a=el("openLink");if(h.url&&h.url.startsWith("http")){a.classList.remove("hidden");a.href=h.url}else{a.classList.add("hidden")}}

function showResults(key){
  const base=seededCrowd(state.current.title);
  const sesh=getSessionVotes(key);
  const F=base.F+sesh.F, M=base.M+sesh.M, K=base.K+sesh.K;
  const T=F+M+K||1;
  el("barF").style.width=(F/T*100).toFixed(1)+"%";
  el("barM").style.width=(M/T*100).toFixed(1)+"%";
  el("barK").style.width=(K/T*100).toFixed(1)+"%";
  el("pctF").textContent=formatPct(F,T);
  el("pctM").textContent=formatPct(M,T);
  el("pctK").textContent=formatPct(K,T);
  el("result").classList.remove("hidden");
}

async function nextHeadline(){
  el("result").classList.add("hidden");
  document.querySelectorAll(".fmk").forEach(b=>b.classList.remove("active"));
  const cat = el("category").value;
  const res = await fetch(`/netlify/functions/headlines?category=${encodeURIComponent(cat)}`, { cache: "no-store" });
  const data = await res.json();
  if (!data || !data.title) { renderHeadline({title:"Failed to load headline",source:"",url:null}); return; }
  state.current = data; state.round += 1;
  el("roundNum").textContent = state.round;
  renderHeadline(data);
}

function handleChoice(choice){
  if (!state.current) return;
  const key=String(hashStr(state.current.title));
  const v=getSessionVotes(key);
  v[choice]=(v[choice]||0)+1;
  setSessionVotes(key,v);
  document.querySelectorAll(".fmk").forEach(b=>b.classList.remove("active"));
  const btn=document.querySelector(`.fmk[data-choice="${choice}"]`);
  if (btn) btn.classList.add("active");
  showResults(key);
}

document.getElementById("nextBtn").addEventListener("click", nextHeadline);
document.querySelectorAll(".fmk").forEach(b=>b.addEventListener("click",()=>handleChoice(b.dataset.choice)));
