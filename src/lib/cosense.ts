/**
 * Cosense（Scrapbox）操作に関するユーティリティ関数群
 *
 * ページ作成URLの生成など、Cosenseとのインタラクションに必要な
 * 共通ロジックを提供する。
 */

/** ストレージに保存するCosense設定の型 */
export interface CosenseConfig {
  /** Cosenseのプロジェクト名（URLの一部となる） */
  projectName: string;
}

/**
 * CosenseのページURLを生成する
 *
 * Cosenseの仕様に基づき、タイトルとbodyを含む新規ページ作成URLを返す。
 * タイトルとbodyはURLエンコードして埋め込む。
 *
 * @param projectName - CosenseのプロジェクトID（例: "my-project"）
 * @param title - 作成するページのタイトル
 * @param body - ページ本文（Webページの場合はURL文字列）
 * @returns Cosenseページ作成用のURL文字列
 *
 * @example
 * const url = buildCosenseUrl("my-project", "Google", "https://google.com");
 * // => "https://scrapbox.io/my-project/Google?body=https%3A%2F%2Fgoogle.com"
 */
export function buildCosenseUrl(
  projectName: string,
  title: string,
  body: string
): string {
  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(body);
  return `https://scrapbox.io/${projectName}/${encodedTitle}?body=${encodedBody}`;
}

/**
 * プロジェクト名の形式を検証する
 *
 * Cosenseのプロジェクト名として使用可能な文字列かどうかを確認する。
 * 空文字列の場合はfalseを返す。
 *
 * @param projectName - 検証するプロジェクト名
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export function isValidProjectName(projectName: string): boolean {
  if (!projectName || projectName.trim().length === 0) {
    return false;
  }
  return true;
}
