/**
 * Popupメインコンポーネント
 *
 * 拡張機能のポップアップUIを提供する。
 * 現在のタブのタイトルとURLを取得し、Cosenseへのクリップ操作を行う。
 */

import { useCallback, useEffect, useState } from "react";
import { buildCosenseUrl, isValidProjectName } from "../../lib/cosense";
import { getProjectName } from "../../lib/storage";

/** ポップアップの状態を表す型 */
type ClipStatus = "idle" | "clipped" | "error";

/**
 * 現在のアクティブタブの情報を取得する
 *
 * @returns タイトルとURLを含むオブジェクト（取得失敗時はnull）
 */
async function getCurrentTab(): Promise<{
  title: string;
  url: string;
} | null> {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.url || !tab?.title) return null;
    return { title: tab.title, url: tab.url };
  } catch {
    return null;
  }
}

/**
 * Popupアプリケーションコンポーネント
 *
 * - 現在のタブ情報の取得と表示
 * - Cosenseへのクリップ処理の実行
 * - プロジェクト名未設定時の設定ページへの誘導
 */
export default function App() {
  /** 現在のタブのタイトル */
  const [pageTitle, setPageTitle] = useState<string>("");
  /** 現在のタブのURL */
  const [pageUrl, setPageUrl] = useState<string>("");
  /** Cosenseプロジェクト名 */
  const [projectName, setProjectName] = useState<string>("");
  /** クリップ操作の状態 */
  const [status, setStatus] = useState<ClipStatus>("idle");
  /** エラーメッセージ */
  const [errorMessage, setErrorMessage] = useState<string>("");
  /** 読み込み中フラグ */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * 初期化処理
   *
   * コンポーネントマウント時に現在のタブ情報とプロジェクト名を取得する。
   */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const [tab, project] = await Promise.all([
        getCurrentTab(),
        getProjectName(),
      ]);

      if (tab) {
        setPageTitle(tab.title);
        setPageUrl(tab.url);
      } else {
        setErrorMessage("タブの情報を取得できませんでした");
        setStatus("error");
      }

      setProjectName(project);
      setIsLoading(false);
    };

    initialize();
  }, []);

  /**
   * 設定ページを開く
   *
   * 新しいタブでオプションページを開き、ポップアップを閉じる。
   */
  const openOptions = useCallback(async () => {
    await browser.tabs.create({
      url: browser.runtime.getURL("/options.html"),
    });
    window.close();
  }, []);

  /**
   * Cosenseへのクリップを実行する
   *
   * Cosenseのページ作成URLを新しいタブで開く。
   * 完了後はポップアップを閉じる。
   */
  const handleClip = useCallback(async () => {
    if (!isValidProjectName(projectName)) {
      setErrorMessage("Cosenseのプロジェクト名が設定されていません");
      setStatus("error");
      return;
    }

    if (!pageTitle || !pageUrl) {
      setErrorMessage("ページ情報を取得できませんでした");
      setStatus("error");
      return;
    }

    const cosenseUrl = buildCosenseUrl(projectName, pageTitle, pageUrl);
    await browser.tabs.create({ url: cosenseUrl });
    setStatus("clipped");

    // 少し待ってからポップアップを閉じる
    setTimeout(() => {
      window.close();
    }, 800);
  }, [projectName, pageTitle, pageUrl]);

  if (isLoading) {
    return (
      <div className="w-80 p-4 flex items-center justify-center min-h-24">
        <div className="text-gray-500 text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white">
      {/* ヘッダー */}
      <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">
            Cosense Link Clipper
          </span>
        </div>
        <button
          onClick={openOptions}
          className="text-emerald-100 hover:text-white text-xs transition-colors"
          title="設定"
        >
          ⚙ 設定
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* プロジェクト名未設定の警告 */}
        {!isValidProjectName(projectName) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-xs font-medium">
              Cosenseのプロジェクト名が設定されていません
            </p>
            <button
              onClick={openOptions}
              className="mt-2 text-xs text-amber-700 underline hover:text-amber-900"
            >
              設定ページを開く →
            </button>
          </div>
        )}

        {/* ページ情報 */}
        {pageTitle && (
          <div className="space-y-1">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                タイトル
              </p>
              <p className="text-sm text-gray-800 line-clamp-2 leading-snug">
                {pageTitle}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">URL</p>
              <p className="text-xs text-gray-600 truncate font-mono">
                {pageUrl}
              </p>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {status === "error" && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-xs">{errorMessage}</p>
          </div>
        )}

        {/* 成功メッセージ */}
        {status === "clipped" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-emerald-700 text-xs font-medium">
              ✓ Cosenseで開きました！
            </p>
          </div>
        )}

        {/* クリップボタン */}
        <button
          onClick={handleClip}
          disabled={
            !isValidProjectName(projectName) ||
            !pageTitle ||
            status === "clipped"
          }
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
        >
          {status === "clipped" ? "✓ 保存しました" : "Cosenseに保存"}
        </button>

        {/* プロジェクト名表示 */}
        {isValidProjectName(projectName) && (
          <p className="text-center text-xs text-gray-400">
            プロジェクト: {projectName}
          </p>
        )}
      </div>
    </div>
  );
}
