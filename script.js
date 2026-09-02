const DRIVE_FOLDER_ID = "1Ors4wVon1u24w-CvF3XYNEgy2SAIWayf";
const DRIVE_API_KEY = "PASTE_YOUR_RESTRICTED_GOOGLE_DRIVE_API_KEY_HERE";
const fileList = document.querySelector("#software-grid");
const emptyState = document.querySelector("#empty-state");
const fileCount = document.querySelector("#result-count");

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}
function formatSize(bytes) {
  if (!bytes) return "Google Drive file";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes), index = 0;
  while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
  return `${size.toFixed(index ? 1 : 0)} ${units[index]}`;
}
function fileType(name) {
  const extension = name.includes(".") ? name.split(".").pop().toUpperCase() : "FILE";
  return extension.length > 5 ? "FILE" : extension;
}
function renderFiles(files) {
  fileList.innerHTML = files.map(file => `<article class="software-card"><div class="software-icon logo-blue">${fileType(file.name)}</div><h3>${escapeHtml(file.name)}</h3><p>Google Drive file</p><footer><span>${formatSize(file.size)}</span><b><a href="https://drive.google.com/uc?export=download&id=${encodeURIComponent(file.id)}" target="_blank" rel="noopener">Download →</a></b></footer></article>`).join("");
  emptyState.hidden = files.length > 0;
  fileCount.textContent = `${files.length} file${files.length === 1 ? "" : "s"}`;
}
async function loadFiles() {
  if (DRIVE_API_KEY.startsWith("PASTE_")) {
    renderFiles([]);
    fileCount.textContent = "API key needed";
    emptyState.textContent = "Add your restricted Google Drive API key in script.js to load files from your folder.";
    return;
  }
  try {
    const query = `'${DRIVE_FOLDER_ID}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,size)&pageSize=100&key=${encodeURIComponent(DRIVE_API_KEY)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(`Drive API error: ${data.error?.message || `HTTP ${response.status}`}`);
    renderFiles(data.files || []);
  } catch (error) {
    renderFiles([]);
    fileCount.textContent = "Unable to load";
    emptyState.textContent = error.message;
    console.error(error);
  }
}
document.querySelector("#refresh-button")?.addEventListener("click", loadFiles);
loadFiles();