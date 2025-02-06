// renderer.js
const { ipcRenderer } = require("electron");

document.getElementById("selectVideo").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  console.log("Select Video button clicked.");

  // Request the main process to open the file dialog.
  const filePath = await ipcRenderer.invoke("select-video");

  if (!filePath) {
    resultDiv.textContent = "No file selected.";
    console.log("No file selected from the dialog.");
    return;
  }

  console.log("Renderer received filePath:", filePath);
  resultDiv.textContent = "Selected file: " + filePath;

  try {
    const duration = await ipcRenderer.invoke("get-video-duration", filePath);
    console.log("Renderer received duration:", duration);
    resultDiv.textContent += "\nVideo duration: " + duration + " seconds.";
  } catch (error) {
    console.error("Error retrieving video duration:", error);
    resultDiv.textContent = "Error retrieving metadata: " + error;
  }
});
