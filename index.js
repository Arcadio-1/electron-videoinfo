const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const ffmpeg = require("fluent-ffmpeg");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Ensure Node integration is enabled for this example.
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

// IPC handler for opening the file dialog.
ipcMain.handle("select-video", async () => {
  console.log("Opening file dialog...");
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Videos", extensions: ["mkv", "avi", "mp4", "mov", "wmv"] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) {
    console.log("File selection canceled or no file chosen.");
    return null;
  }
  console.log("Selected file:", result.filePaths[0]);
  return result.filePaths[0];
});

// IPC handler to get video duration via ffprobe.
ipcMain.handle("get-video-duration", (event, filePath) => {
  console.log("Received filePath for duration:", filePath);
  return new Promise((resolve, reject) => {
    if (!filePath) {
      console.error("No file path provided to ffprobe.");
      return reject("No file path provided.");
    }
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("ffprobe error:", err);
        return reject(err.toString());
      }
      if (!metadata || !metadata.format) {
        console.error("No metadata found from ffprobe.");
        return reject("No metadata found.");
      }
      const duration = metadata.format.duration;
      console.log("Retrieved duration:", duration);
      resolve(duration);
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
