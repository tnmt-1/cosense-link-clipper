/**
 * ストレージ操作に関するユーティリティ
 *
 * chrome.storage.sync (browserのsyncストレージ) を使用してCosense設定の
 * 読み書きを行う。ブラウザ間でデータが同期される。
 */

/** ストレージキー定数 */
const STORAGE_KEY_PROJECT_NAME = "cosenseProjectName";
const STORAGE_KEY_OPEN_ON_SAVE = "openPageOnSave";

/** Cosense拡張機能の設定 */
export interface CosenseSettings {
  /** Cosenseのプロジェクト名 */
  projectName: string;
  /** 保存時にCosenseページを開くかどうか */
  openPageOnSave: boolean;
}

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

/**
 * 全設定を取得する
 *
 * @returns プロジェクト名と保存時の動作設定を含むオブジェクト
 */
export async function getSettings(): Promise<CosenseSettings> {
  const result = await browser.storage.sync.get([
    STORAGE_KEY_PROJECT_NAME,
    STORAGE_KEY_OPEN_ON_SAVE,
  ]);
  return {
    projectName: (result[STORAGE_KEY_PROJECT_NAME] as string) ?? "",
    openPageOnSave: (result[STORAGE_KEY_OPEN_ON_SAVE] as boolean) ?? true,
  };
}

/**
 * "保存時にCosenseページを開く"設定を保存する
 *
 * @param value - trueなら開く、falseならバックグラウンドで保存する
 * @returns Promise<void>
 */
export async function saveOpenPageOnSave(value: boolean): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEY_OPEN_ON_SAVE]: value });
}
