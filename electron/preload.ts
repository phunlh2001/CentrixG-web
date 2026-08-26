import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("centrixDesktop", {
  isDesktop: true,
  platform: process.platform,
  installApp: (token: string, appId: number | string, type?: string | null) =>
    ipcRenderer.invoke("install-app", token, appId, type),
  checkForUpdates: () => ipcRenderer.invoke("check-for-update"),
  startDownloadUpdate: () => ipcRenderer.invoke("start-download-update"),
  quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),
  onUpdateAvailable: (callback: (info: { version: string; releaseNotes?: string }) => void) => {
    const subscription = (_: any, info: any) => callback(info);
    ipcRenderer.on("update-available", subscription);
    return () => ipcRenderer.removeListener("update-available", subscription);
  },
  onUpdateNotAvailable: (callback: (info: { version: string }) => void) => {
    const subscription = (_: any, info: any) => callback(info);
    ipcRenderer.on("update-not-available", subscription);
    return () => ipcRenderer.removeListener("update-not-available", subscription);
  },
  onDownloadProgress: (callback: (progress: { percent: number }) => void) => {
    const subscription = (_: any, progress: any) => callback(progress);
    ipcRenderer.on("update-download-progress", subscription);
    return () => ipcRenderer.removeListener("update-download-progress", subscription);
  },
  onUpdateDownloaded: (callback: (info: { version: string }) => void) => {
    const subscription = (_: any, info: any) => callback(info);
    ipcRenderer.on("update-downloaded", subscription);
    return () => ipcRenderer.removeListener("update-downloaded", subscription);
  },
  onUpdateError: (callback: (error: string) => void) => {
    const subscription = (_: any, err: any) => callback(err);
    ipcRenderer.on("update-error", subscription);
    return () => ipcRenderer.removeListener("update-error", subscription);
  },
});
