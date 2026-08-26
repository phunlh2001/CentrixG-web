import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Download, RefreshCw, Sparkles } from "lucide-react";
import NeonButton from "./neon/NeonButton";
import NeonCard from "./neon/NeonCard";

export default function AutoUpdateModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [statusStep, setStatusStep] = useState<
    "idle" | "available" | "downloading" | "downloaded" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const desktop = window.centrixDesktop;
    if (!desktop?.isDesktop) return;

    // Trigger update check on mount
    desktop.checkForUpdates?.();

    const unsubAvailable = desktop.onUpdateAvailable?.((info) => {
      setNewVersion(info.version || "");
      setStatusStep("available");
      setIsOpen(true);
    });

    const unsubProgress = desktop.onDownloadProgress?.((progress) => {
      setDownloadPercent(Math.round(progress.percent || 0));
      setStatusStep("downloading");
      setIsOpen(true);
    });

    const unsubDownloaded = desktop.onUpdateDownloaded?.((info) => {
      if (info?.version) setNewVersion(info.version);
      setDownloadPercent(100);
      setStatusStep("downloaded");
      setIsOpen(true);
    });

    const unsubError = desktop.onUpdateError?.((err) => {
      console.error("[AutoUpdateModal] Update error:", err);
      setErrorMessage(err || "");
      // Keep modal open if previously downloading/available
    });

    return () => {
      unsubAvailable?.();
      unsubProgress?.();
      unsubDownloaded?.();
      unsubError?.();
    };
  }, []);

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    setStatusStep("downloading");
    try {
      await window.centrixDesktop?.startDownloadUpdate?.();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to start update download");
    }
  };

  const handleQuitAndInstall = async () => {
    try {
      await window.centrixDesktop?.quitAndInstall?.();
    } catch (err: any) {
      console.error("[AutoUpdateModal] quitAndInstall error:", err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-bg-deep/90 backdrop-blur-lg animate-fade-in">
      <NeonCard
        glow="cyan"
        padding="lg"
        className="max-w-md w-full relative z-[100000] text-center shadow-[0_0_60px_#00D4FF40] border border-neon-cyan/40"
      >
        <div className="flex flex-col items-center gap-5 py-3">
          {/* Header Icon */}
          <div className="w-14 h-14 rounded-full bg-neon-cyan/15 border border-neon-cyan/50 text-neon-cyan flex items-center justify-center shadow-[0_0_20px_#00D4FF50] animate-pulse">
            {statusStep === "downloading" ? (
              <RefreshCw size={28} className="animate-spin text-neon-cyan" />
            ) : statusStep === "error" ? (
              <AlertCircle size={28} className="text-neon-amber" />
            ) : (
              <Sparkles size={28} />
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="flex flex-col gap-2">
            <h3 className="font-black text-xl text-text-primary">
              {t("desktop.productDetailPage.autoUpdate.title", {
                defaultValue: "Software Update Required",
              })}
            </h3>
            <p className="text-xs text-neon-cyan/90 font-semibold tracking-wide uppercase">
              {t("desktop.productDetailPage.autoUpdate.subtitle", {
                version: newVersion,
                defaultValue: `A new version (v${newVersion}) of CentrixG Desktop is available.`,
              })}
            </p>
            <p className="text-xs text-text-primary/70 leading-relaxed mt-1">
              {t("desktop.productDetailPage.autoUpdate.message", {
                defaultValue:
                  "Please update your application to continue using CentrixG with the latest features and security updates.",
              })}
            </p>
          </div>

          {/* Download Progress Bar */}
          {(statusStep === "downloading" || statusStep === "downloaded") && (
            <div className="w-full flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center text-xs font-semibold text-text-primary/80">
                <span>
                  {statusStep === "downloaded"
                    ? t("desktop.productDetailPage.autoUpdate.downloadComplete", {
                        defaultValue: "Update downloaded successfully!",
                      })
                    : t("desktop.productDetailPage.autoUpdate.downloading", {
                        percent: downloadPercent,
                        defaultValue: `Downloading update... ${downloadPercent}%`,
                      })}
                </span>
                <span className="text-neon-cyan font-bold">{downloadPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-neon-cyan/10 rounded-full overflow-hidden border border-neon-cyan/20">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-lavender transition-all duration-300 shadow-[0_0_12px_#00D4FF]"
                  style={{ width: `${downloadPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <p className="text-xs text-neon-amber bg-neon-amber/10 border border-neon-amber/30 rounded-lg p-2.5 w-full">
              {errorMessage}
            </p>
          )}

          {/* Primary Action Button */}
          <div className="w-full mt-3">
            {statusStep === "downloaded" ? (
              <NeonButton
                type="button"
                variant="primary"
                size="md"
                className="w-full py-3 font-bold text-sm shadow-[0_0_20px_#00D4FF66]"
                onClick={handleQuitAndInstall}
              >
                <RefreshCw size={16} className="mr-2" />
                {t("desktop.productDetailPage.autoUpdate.actRestartInstall", {
                  defaultValue: "Restart & Install Now",
                })}
              </NeonButton>
            ) : statusStep === "downloading" ? (
              <NeonButton
                type="button"
                variant="secondary"
                size="md"
                className="w-full py-3 font-bold text-sm opacity-80 cursor-wait"
                disabled
              >
                <RefreshCw size={16} className="mr-2 animate-spin" />
                {t("desktop.productDetailPage.autoUpdate.actDownloading", {
                  defaultValue: "Downloading...",
                })}
              </NeonButton>
            ) : (
              <NeonButton
                type="button"
                variant="primary"
                size="md"
                className="w-full py-3 font-bold text-sm shadow-[0_0_20px_#00D4FF66]"
                onClick={handleStartDownload}
              >
                <Download size={16} className="mr-2" />
                {t("desktop.productDetailPage.autoUpdate.actUpdateNow", {
                  defaultValue: "Update Now",
                })}
              </NeonButton>
            )}
          </div>
        </div>
      </NeonCard>
    </div>,
    document.body,
  );
}
