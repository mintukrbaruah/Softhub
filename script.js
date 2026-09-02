const FOLDER_ID = "1Ors4wVon1u24w-CvF3XYNEgy2SAIWayf";
const API_KEY = "AQ.Ab8RN6JEdK-XbFxmHTef-Nrkj_hs42nwdxEyc_lwQkHcy1_IJg";
const list = document.querySelector("#file-list");
const empty = document.querySelector("#empty-state");
const count = document.querySelector("#file-count");
const status = document.querySelector("#status");
function esc(value){return value.replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]))}
function size(bytes){if(!bytes)return "Google Drive file";const u=["B","KB","MB","GB"];let n=+bytes,i=0;while(n>=1024&&i<3){n/=1024;i++}return `${n.toFixed(i?1:0)} ${u[i]}`}
function render(files){list.innerHTML=files.map(f=>`<div class="file"><div class="file-name"><strong>${esc(f.name)}</strong><span class="file-size">${size(f.size)}</span></div><a class="download" href="https://drive.google.com/uc?export=download&id=${encodeURIComponent(f.id)}" target="_blank" rel="noopener">Download</a></div>`).join("");empty.hidden=files.length>0;count.textContent=`${files.length} file${files.length===1?'':'s'}`}
async function load(){status.textContent="Loading files…";if(API_KEY.startsWith("PASTE_")){render([]);count.textContent="API key required";status.textContent="Add your Google Drive API key in script.js.";return}try{const q=`'${FOLDER_ID}' in parents and trashed = false`;const url=`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime desc&fields=files(id,name,size)&pageSize=100&key=${encodeURIComponent(API_KEY)}`;const response=await fetch(url);const data=await response.json();if(!response.ok)throw new Error(data.error?.message||`HTTP ${response.status}`);render(data.files||[]);status.textContent=""}catch(error){render([]);count.textContent="Error";status.textContent=`Could not load files: ${error.message}`;console.error(error)}}
document.querySelector("#refresh-button").addEventListener("click",load);load();
