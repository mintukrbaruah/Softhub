const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7xWYSTGmbpcggCpST9i5DZLqVuppJjCXgxYAxIbCQKHPIbqra_r0QgtlsznpWXx_q/exec";

const fileGrid = document.querySelector("#file-grid");
const emptyState = document.querySelector("#empty-state");
const fileCount = document.querySelector("#file-count");
const categoryCount = document.querySelector("#category-count");
const statusMessage = document.querySelector("#status-message");
const searchInput = document.querySelector("#search-input");
const refreshButton = document.querySelector("#refresh-button");

const appState = {
  files: [],
  selectedCategory: "All",
  searchTerm: ""
};

function formatSize(bytes) {
  if (!bytes || Number(bytes) <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Number(bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFileIconLabel(fileName) {
  const extension = fileName.includes(".") ? fileName.split(".").pop().toUpperCase() : "FILE";
  return extension.length > 5 ? "FILE" : extension;
}

function getCategoryList(files) {
  const categories = files
    .map((file) => (file.category || "General").trim())
    .filter(Boolean);

  return ["All", ...Array.from(new Set(categories))];
}

function getVisibleFiles() {
  const query = appState.searchTerm.trim().toLowerCase();

  return appState.files.filter((file) => {
    const category = (file.category || "General").toLowerCase();
    const fileName = (file.name || "").toLowerCase();
    const matchesCategory =
      appState.selectedCategory === "All" || category === appState.selectedCategory.toLowerCase();
    const matchesSearch = !query || fileName.includes(query) || category.includes(query);

    return matchesCategory && matchesSearch;
  });
}

function renderFiles() {
  const visibleFiles = getVisibleFiles();

  if (!visibleFiles.length) {
    fileGrid.innerHTML = "";
    emptyState.hidden = false;
    fileCount.textContent = "0";
    return;
  }

  emptyState.hidden = true;
  fileCount.textContent = String(visibleFiles.length);

  fileGrid.innerHTML = visibleFiles
    .map((file) => {
      const name = escapeHtml(file.name || "Untitled file");
      const category = escapeHtml(file.category || "General");
      const fileUrl = file.downloadUrl || `https://drive.google.com/uc?export=download&id=${encodeURIComponent(file.id || "")}`;
      const badge = getFileIconLabel(file.name || "Untitled file");
      const size = formatSize(file.size);

      return `
        <article class="file-card">
          <div class="file-card-top">
            <span class="file-icon">${badge}</span>
            <span class="file-badge">${category}</span>
          </div>

          <div>
            <h3 class="file-name">${name}</h3>
            <div class="file-meta">Google Drive • ${category}</div>
          </div>

          <div class="file-footer">
            <span class="file-size">${size}</span>
            <a class="download-link" href="${fileUrl}" target="_blank" rel="noopener noreferrer">Download</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message || "";
  statusMessage.classList.toggle("error", isError);
}

async function loadFiles() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_")) {
    appState.files = [];
    renderFiles();
    setStatus("Add your Google Apps Script web app URL in script.js to load the file list.", true);
    return;
  }

  try {
    setStatus("Loading file library...");
    const response = await fetch(`${APPS_SCRIPT_URL}?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const files = Array.isArray(data.files) ? data.files : [];

    appState.files = files;
    appState.selectedCategory = "All";
    appState.searchTerm = searchInput.value.trim();

    const categories = getCategoryList(files);
    renderFiles();
    categoryCount.textContent = String(categories.length - 1);
    setStatus(files.length ? `Loaded ${files.length} file${files.length === 1 ? "" : "s"}.` : "No files found in the public folder.");
  } catch (error) {
    appState.files = [];
    renderFiles();
    categoryCount.textContent = "0";
    console.error(error);
    setStatus("Could not load files. Check the Apps Script URL and make sure the web app is deployed and public.", true);
  }
}

searchInput.addEventListener("input", (event) => {
  appState.searchTerm = event.target.value;
  renderFiles();
});

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

renderFiles();
categoryCount.textContent = "0";
setStatus("Waiting for the file list...");
loadFiles();
