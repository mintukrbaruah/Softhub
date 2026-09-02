const FOLDER_ID = "1Ors4wVon1u24w-CvF3XYNEgy2SAIWayf";
const ADMIN_TOKEN = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET";

function doGet() {
  const files = [];
  collectFiles(DriveApp.getFolderById(FOLDER_ID), "", files);
  return json({ files: files });
}

function collectFiles(folder, categoryPath, result) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    result.push({
      id: file.getId(),
      name: file.getName(),
      size: file.getSize(),
      mimeType: file.getMimeType(),
      category: categoryPath || "Uncategorized",
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId()
    });
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const child = folders.next();
    const childPath = categoryPath ? categoryPath + " / " + child.getName() : child.getName();
    collectFiles(child, childPath, result);
  }
}

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents || "{}");
    if (data.token !== ADMIN_TOKEN) return json({ error: "Unauthorized" });
    if (data.action !== "upload") return json({ error: "Unknown action" });
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(data.data), data.mimeType || "application/octet-stream", data.name);
    const file = folder.createFile(blob);
    return json({ ok: true, id: file.getId(), name: file.getName() });
  } catch (error) {
    return json({ error: error.message });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}