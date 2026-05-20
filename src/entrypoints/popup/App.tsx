/**
 * Popupメインコンポーネント
 */

import { useCallback, useEffect, useState } from "react";
import { buildCosenseUrl, isValidProjectName } from "../../lib/cosense";
import { t } from "../../lib/i18n";
import { type CosenseSettings, getSettings } from "../../lib/storage";

type ClipStatus = "idle" | "clipped" | "error";

async function getCurrentTab(): Promise<{ title: string; url: string } | null> {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || !tab?.title) return null;
    return { title: tab.title, url: tab.url };
  } catch {
    return null;
  }
}

export default function App() {
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageUrl, setPageUrl] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [openPageOnSave, setOpenPageOnSave] = useState<boolean>(true);
  const [status, setStatus] = useState<ClipStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const [tab, settings] = await Promise.all([
          getCurrentTab(),
          getSettings().catch(() => ({ projectName: "", openPageOnSave: true } as CosenseSettings)),
        ]);
        if (tab) {
          setPageTitle(tab.title);
          setPageUrl(tab.url);
        } else {
          setErrorMessage(t("tabError"));
          setStatus("error");
        }
        setProjectName(settings.projectName);
        setOpenPageOnSave(settings.openPageOnSave);
      } catch (_e) {
        setErrorMessage(t("initError"));
        setStatus("error");
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const openOptions = useCallback(async () => {
    await browser.tabs.create({ url: browser.runtime.getURL("/options.html") });
    window.close();
  }, []);

  const handleClip = useCallback(async () => {
    if (!isValidProjectName(projectName)) {
      setErrorMessage(t("projectNotSet"));
      setStatus("error");
      return;
    }
    if (!pageTitle || !pageUrl) {
      setErrorMessage(t("tabError"));
      setStatus("error");
      return;
    }
    const cosenseUrl = buildCosenseUrl(projectName, pageTitle, pageUrl);
    await browser.tabs.create({ url: cosenseUrl, active: openPageOnSave });
    setStatus("clipped");
    setTimeout(() => window.close(), 800);
  }, [openPageOnSave, pageTitle, pageUrl, projectName]);

  if (isLoading) {
    return <div className="w-80 p-4 flex items-center justify-center min-h-24"><div className="text-gray-500 text-sm">{t("loading")}</div></div>;
  }

  return (
    <div className="w-80 bg-white">
      <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-base">Cosense Link Clipper</span>
        <button onClick={openOptions} className="text-emerald-100 hover:text-white text-xs transition-colors" title={t("settings")}>
          {t("settings")}
        </button>
      </div>
      <div className="p-4 space-y-3">
        {!isValidProjectName(projectName) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-xs font-medium">{t("projectNotSet")}</p>
            <button onClick={openOptions} className="mt-2 text-xs text-amber-700 underline hover:text-amber-900">{t("openSettings")}</button>
          </div>
        )}
        {pageTitle && <div className="space-y-1"><div><p className="text-xs text-gray-500 font-medium mb-0.5">{t("titleLabel")}</p><p className="text-sm text-gray-800 line-clamp-2 leading-snug">{pageTitle}</p></div><div><p className="text-xs text-gray-500 font-medium mb-0.5">{t("urlLabel")}</p><p className="text-xs text-gray-600 truncate font-mono">{pageUrl}</p></div></div>}
        {status === "error" && errorMessage && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-700 text-xs">{errorMessage}</p></div>}
        {status === "clipped" && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><p className="text-emerald-700 text-xs font-medium">{t("savedSuccess")}</p></div>}
        <button onClick={handleClip} disabled={!isValidProjectName(projectName) || !pageTitle || status === "clipped"} className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors">{status === "clipped" ? t("savedButton") : t("saveButton")}</button>
        {isValidProjectName(projectName) && <p className="text-center text-xs text-gray-400">{t("projectPrefix")}{projectName}</p>}
      </div>
    </div>
  );
}
