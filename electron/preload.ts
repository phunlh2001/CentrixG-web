import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("centrixDesktop", {
  isDesktop: true,
  platform: process.platform,
  installApp: (appId: number | string) => ipcRenderer.invoke("install-app", appId),
});
