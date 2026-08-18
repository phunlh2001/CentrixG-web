import { app, BrowserWindow, globalShortcut, ipcMain, shell } from "electron";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

function getInstallAppExePath(): string {
  const candidates = [
    join(process.resourcesPath, "bin", "InstallApp.exe"),
    join(app.getAppPath(), "bin", "InstallApp.exe"),
    join(process.cwd(), "bin", "InstallApp.exe"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return app.isPackaged
    ? join(process.resourcesPath, "bin", "InstallApp.exe")
    : join(process.cwd(), "bin", "InstallApp.exe");
}

ipcMain.handle(
  "install-app",
  async (_, token: string, appId: number | string, type?: string) => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      const exePath = getInstallAppExePath();
      const command = exePath;
      const args = [String(token || ""), String(appId || "")];
      if (type) {
        args.push(String(type));
      }

      console.log(`[IPC install-app] Executing: ${command}`, args);

    let latestLog = "";
    const logsList: string[] = [];
    let isResolved = false;

    let child: ReturnType<typeof spawn> | null = null;
    try {
      child = spawn(command, args, {
        cwd: dirname(exePath),
        windowsHide: true,
      });
    } catch (err: any) {
      console.error("[IPC install-app] Error spawning InstallApp.exe:", err);
    }

    if (child) {
      child.stdout?.on("data", (data: Buffer) => {
        const text = data.toString("utf-8").trim();
        if (text) {
          latestLog = text;
          logsList.push(text);
          console.log("[InstallApp stdout]:", text);
        }
      });

      child.stderr?.on("data", (data: Buffer) => {
        const text = data.toString("utf-8").trim();
        if (text) {
          latestLog = text;
          logsList.push(text);
          console.error("[InstallApp stderr]:", text);
        }
      });
    }

    // Process conclusion handler after required delays
    const evaluateAndResolve = async () => {
      if (isResolved) return;
      isResolved = true;

      const isSuccess =
        latestLog.includes("Implemented manifest successfully!") ||
        logsList.some((l) => l.includes("Implemented manifest successfully!"));

      if (isSuccess) {
        console.log("[IPC install-app] Success log detected. Waiting 15 seconds...");
        await new Promise((res) => setTimeout(res, 15000));
        resolve({
          success: true,
          message: "Implemented manifest successfully!",
        });
      } else {
        console.log("[IPC install-app] Error/no success log. Waiting 10 seconds...");
        await new Promise((res) => setTimeout(res, 10000));
        resolve({
          success: false,
          message: "couldn't implement manifest now",
        });
      }
    };

    // 30-second execution wait timer (max 60 seconds)
    const INSTALL_APP_WAIT_MS = 30 * 1000;
    const timer = setTimeout(() => {
      console.log("[IPC install-app] 30s timeout reached. Evaluating logs...");
      evaluateAndResolve();
    }, INSTALL_APP_WAIT_MS);

    if (child) {
      child.on("close", (code) => {
        console.log(`[IPC install-app] InstallApp.exe exited with code ${code}`);
        clearTimeout(timer);
        evaluateAndResolve();
      });
    } else {
      clearTimeout(timer);
      evaluateAndResolve();
    }
  });
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    backgroundColor: "#09090f",
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(`[Electron Main] Failed to load renderer: ${errorCode} - ${errorDescription}`);
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
};

app.whenReady().then(() => {
  createWindow();

  // F12 to toggle DevTools
  globalShortcut.register("F12", () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.toggleDevTools();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
