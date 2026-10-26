// Оболочка Electron для Moryaka Jump: игра открывается в отдельном окне
// из локального index.html, без интернета и без адресной строки.
const { app, BrowserWindow, Menu, shell, session } = require("electron");
const path = require("path");

// Прогресс (localStorage) хранится в пользовательской папке приложения.
app.setName("Moryaka Jump");

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 920,
    minWidth: 720,
    minHeight: 640,
    backgroundColor: "#101a35",
    autoHideMenuBar: true,
    title: "Moryaka Jump",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "index.html"));

  // Внешние ссылки — в системный браузер, внутри окна навигацию не открываем.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (url === win.webContents.getURL()) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) shell.openExternal(url);
  });

  // F11 — полноэкранный режим оболочки, Esc выходит из него.
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    } else if (input.key === "Escape" && win.isFullScreen()) {
      win.setFullScreen(false);
    }
  });
}

app.whenReady().then(() => {
  // Разрешаем сетевые запросы только к Firebase (глобальный рейтинг).
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    const allowed = url.startsWith("file://") ||
      url.startsWith("devtools://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:") ||
      /^https:\/\/moryaka-jump-default-rtdb\.asia-southeast1\.firebasedatabase\.app\//.test(url);
    callback({ cancel: !allowed });
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
