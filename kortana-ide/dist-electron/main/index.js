"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
const fs = require("node:fs/promises");
if (node_os.release().startsWith("6.1")) electron.app.disableHardwareAcceleration();
if (process.platform === "win32") electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
const preload = node_path.join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(__dirname, "../../dist/index.html");
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "Kortana Studio",
    icon: node_path.join(__dirname, "../../public/favicon.ico"),
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: true,
    // Keep frame but hide native menu
    backgroundColor: "#0f1115",
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  electron.Menu.setApplicationMenu(null);
  if (url) {
    win.loadURL(url);
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:")) electron.shell.openExternal(url2);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.handle("fs:readFile", async (_, filePath) => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});
electron.ipcMain.handle("fs:writeFile", async (_, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
});
electron.ipcMain.handle("fs:getFiles", async (_, dirPath) => {
  try {
    return await fs.readdir(dirPath);
  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
});
electron.ipcMain.handle("fs:selectFolder", async () => {
  const result = await electron.dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});
electron.ipcMain.handle("fs:createFolder", async (_, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    throw new Error(`Failed to create folder: ${error.message}`);
  }
});
electron.ipcMain.handle("fs:deleteFile", async (_, filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
});
electron.ipcMain.handle("fs:isDirectory", async (_, path) => {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
});
electron.ipcMain.handle("compiler:compile", async (_, payload) => {
  return {
    status: "success",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    contracts: [{
      name: payload.name || "Contract",
      abi: [],
      bytecode: "0x123"
    }],
    errors: []
  };
});
