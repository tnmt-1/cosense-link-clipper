/**
 * Options（設定）メインコンポーネント
 */

import { useCallback, useEffect, useState } from "react";
import { isValidProjectName } from "../../lib/cosense";
import { t } from "../../lib/i18n";
import { getSettings, saveOpenPageOnSave, saveProjectName } from "../../lib/storage";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function App() {
  const [projectName, setProjectName] = useState<string>("");
  const [openPageOnSave, setOpenPageOnSave] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setProjectName(settings.projectName);
        setOpenPageOnSave(settings.openPageOnSave);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = useCallback(async () => {
    if (!isValidProjectName(projectName)) return;
    setSaveStatus("saving");
    try {
      await Promise.all([saveProjectName(projectName), saveOpenPageOnSave(openPageOnSave)]);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [openPageOnSave, projectName]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleSave(); }, [handleSave]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">{t("loading")}</div></div>;

  return (<div className="min-h-screen bg-gray-50"><header className="bg-emerald-600 shadow"><div className="max-w-2xl mx-auto px-6 py-4"><h1 className="text-white text-xl font-bold">Cosense Link Clipper</h1><p className="text-emerald-100 text-sm mt-0.5">{t("optionsSubheader")}</p></div></header><main className="max-w-2xl mx-auto px-6 py-8"><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h2 className="text-gray-800 font-semibold text-base mb-1">{t("projectSectionTitle")}</h2><p className="text-gray-500 text-sm mb-5">{t("projectSectionDesc")}</p><div className="space-y-4"><div><label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1.5">{t("projectNameLabel")}</label><div className="flex items-center gap-2"><span className="text-gray-400 text-sm whitespace-nowrap">scrapbox.io/</span><input id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} onKeyDown={handleKeyDown} placeholder="your-project-name" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" /></div>{projectName && <p className="mt-1.5 text-xs text-gray-500">{t("destinationLabel")}<span className="font-mono text-gray-600">https://scrapbox.io/{projectName}/...</span></p>}</div><div className="mt-4"><h3 className="text-sm font-medium text-gray-700 mb-2">{t("behaviorTitle")}</h3><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={openPageOnSave} onChange={(e) => setOpenPageOnSave(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" /><span className="text-sm text-gray-700">{t("openOnSaveLabel")}</span></label><p className="mt-1 text-xs text-gray-500 ml-7">{t("openOnSaveDesc")}</p></div><button onClick={handleSave} disabled={!isValidProjectName(projectName) || saveStatus === "saving"} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors">{saveStatus === "saving" ? t("savingButton") : t("saveButtonLabel")}</button>{saveStatus === "saved" && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><p className="text-emerald-700 text-sm font-medium">{t("optionsSavedSuccess")}</p></div>}{saveStatus === "error" && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-700 text-sm">{t("optionsSaveError")}</p></div>}</div></div><div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h2 className="text-gray-800 font-semibold text-base mb-3">{t("howToTitle")}</h2><ol className="space-y-2 text-sm text-gray-600">{[t("howToStep1"), t("howToStep2"), t("howToStep3"), t("howToStep4")].map((step, i) => (<li key={i} className="flex gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span><span>{step}</span></li>))}</ol></div></main></div>);
}
