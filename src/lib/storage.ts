/**
 * ストレージ操作に関するユーティリティ
 *
 * chrome.storage.sync (browserのsyncストレージ) を使用してCosense設定の
 * 読み書きを行う。ブラウザ間でデータが同期される。
 */

/** ストレージキー定数 */
const STORAGE_KEY_PROJECT_NAME = "cosenseProjectName";

/**
 * Cosenseプロジェクト名を取得する
 *
 * chrome.storage.syncからプロジェクト名を読み込む。
 * 未設定の場合は空文字列を返す。
 *
 * @returns 保存されているプロジェクト名（未設定の場合は空文字列）
 */
export async function getProjectName(): Promise<string> {
  const result = await browser.storage.sync.get(STORAGE_KEY_PROJECT_NAME);
  return (result[STORAGE_KEY_PROJECT_NAME] as string) ?? "";
}

/**
 * Cosenseプロジェクト名を保存する
 *
 * chrome.storage.syncにプロジェクト名を書き込む。
 * 前後の空白は自動的に除去される。
 *
 * @param projectName - 保存するプロジェクト名
 */
export async function saveProjectName(projectName: string): Promise<void> {
  await browser.storage.sync.set({
    [STORAGE_KEY_PROJECT_NAME]: projectName.trim(),
  });
}
