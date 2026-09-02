const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx7xWYSTGmbpcggCpST9i5DZLqVuppJjCXgxYAxIbCQKHPIbqra_r0QgtlsznpWXx_q/exec";

async function loadFiles() {
  const response = await fetch(APPS_SCRIPT_URL);
  const data = await response.json();

  renderFiles(data.files || []);
}

loadFiles();
