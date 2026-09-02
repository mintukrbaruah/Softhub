const FOLDER_ID = "1Ors4wVon1u24w-CvF3XYNEgy2SAIWayf";

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
    const childPath = categoryPath
      ? categoryPath + " / " + child.getName()
      : child.getName();
    collectFiles(child, childPath, result);
  }
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}