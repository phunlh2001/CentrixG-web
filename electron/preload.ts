import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("centrixDesktop", {
  isDesktop: true,
  platform: process.platform,
  installApp: (token: string, appId: number | string, type?: string) =>
    ipcRenderer.invoke("install-app", token, appId, type),
});
