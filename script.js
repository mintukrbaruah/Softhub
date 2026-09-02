const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7xWYSTGmbpcggCpST9i5DZLqVuppJjCXgxYAxIbCQKHPIbqra_r0QgtlsznpWXx_q/exec";
const list = document.querySelector("#file-list");
const empty = document.querySelector("#empty-state");
const count = document.querySelector("#file-count");
const status = document.querySelector("#status");
function escapeHtml(value) { return value.replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
function formatSize(bytes) { if (!bytes) return "Google Drive file"; const units = ["B", "KB", "MB", "GB"]; let size = Number(bytes), index = 0; while (size >= 1024 && index < units.length - 1) { size /= 1024; index++; } return `${size.toFixed(index ? 1 : 0)} ${units[index]}`; }
function renderFiles(files) { list.innerHTML = files.map(file => `<div class="file"><div class="file-name"><strong>${escapeHtml(file.name)}</strong><span class="file-size">${formatSize(file.size)}</span></div><a class="download" href="${file.downloadUrl || `https://drive.google.com/uc?export=download&id=${encodeURIComponent(file.id)}`}" target="_blank" rel="noopener">Download</a></div>`).join(""); empty.hidden = files.length > 0; count.textContent = `${files.length} file${files.length === 1 ? "" : "s"}`; }
async function loadFiles() { status.textContent = "Loading files…"; try { const response = await fetch(`${APPS_SCRIPT_URL}?t=${Date.now()}`); if (!response.ok) throw new Error(`Apps Script returned HTTP ${response.status}`); const data = await response.json(); renderFiles(data.files || []); status.textContent = ""; } catch (error) { renderFiles([]); count.textContent = "Error"; status.textContent = `Could not load files: ${error.message}`; console.error(error); } }
document.querySelector("#refresh-button").addEventListener("click", loadFiles);
loadFiles();