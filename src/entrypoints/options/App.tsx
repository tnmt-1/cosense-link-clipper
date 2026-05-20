/**
 * Options（設定）メインコンポーネント
 *
 * Cosenseプロジェクト名の設定UIを提供する。
 * 保存した設定はchrome.storage.syncに書き込まれ、
 * ブラウザ間で同期される。
 */

import { useCallback, useEffect, useState } from "react";
import { isValidProjectName } from "../../lib/cosense";
import {
  getSettings,
  saveOpenPageOnSave,
  saveProjectName,
} from "../../lib/storage";

/** 保存操作の状態を表す型 */
type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Optionsアプリケーションコンポーネント
 *
 * - Cosenseプロジェクト名の入力・保存
 * - 現在の設定値の読み込みと表示
 * - 保存状態のフィードバック表示
 */
export default function App() {
  /** プロジェクト名の入力値 */
  const [projectName, setProjectName] = useState<string>("");
  const [openPageOnSave, setOpenPageOnSave] = useState<boolean>(true);
  /** 保存操作の状態 */
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  /** 読み込み中フラグ */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * 初期化処理
   *
   * コンポーネントマウント時に保存済みのプロジェクト名を取得する。
   */
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setProjectName(settings.projectName);
      setOpenPageOnSave(settings.openPageOnSave);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  /**
   * 設定を保存する
   *
   * プロジェクト名をバリデーションした上でストレージに保存する。
   * 保存状態をUIにフィードバックする。
   */
  const handleSave = useCallback(async () => {
    if (!isValidProjectName(projectName)) {
      return;
    }

    setSaveStatus("saving");
    try {
      await saveProjectName(projectName);
      await saveOpenPageOnSave(openPageOnSave);
      setSaveStatus("saved");
      // 3秒後にidle状態に戻す
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [projectName, openPageOnSave]);

  /**
   * Enterキーでフォームを送信する
   *
   * @param e - キーボードイベント
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSave();
      }
    },
    [handleSave]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-emerald-600 shadow">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-white text-xl font-bold">
            Cosense Link Clipper
          </h1>
          <p className="text-emerald-100 text-sm mt-0.5">設定</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-gray-800 font-semibold text-base mb-1">
            Cosenseプロジェクト設定
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            クリップ先のCosenseプロジェクト名を入力してください。
          </p>

          <div className="space-y-4">
            {/* プロジェクト名入力 */}
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                プロジェクト名
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  scrapbox.io/
                </span>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="your-project-name"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              {projectName && (
                <p className="mt-1.5 text-xs text-gray-500">
                  保存先:{" "}
                  <span className="font-mono text-gray-600">
                    https://scrapbox.io/{projectName}/...
                  </span>
                </p>
              )}
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={!isValidProjectName(projectName) || saveStatus === "saving"}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
            >
              {saveStatus === "saving" ? "保存中..." : "保存"}
            </button>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">保存時の動作</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openPageOnSave}
                  onChange={(e) => setOpenPageOnSave(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">保存後にCosenseのページを開く</span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-7">
                オフにするとバックグラウンドで保存され、現在のページから移動しません
              </p>
            </div>

            {/* 保存成功メッセージ */}
            {saveStatus === "saved" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-emerald-700 text-sm font-medium">
                  ✓ 設定を保存しました
                </p>
              </div>
            )}

            {/* 保存エラーメッセージ */}
            {saveStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">
                  保存に失敗しました。もう一度お試しください。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 使い方 */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-gray-800 font-semibold text-base mb-3">
            使い方
          </h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>このページでCosenseのプロジェクト名を設定する</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>保存したいWebページを開く</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span>ツールバーの拡張機能アイコンをクリックする</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span>「Cosenseに保存」ボタンをクリックする</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
