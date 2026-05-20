/**
 * バックグラウンドサービスワーカー
 *
 * 拡張機能のバックグラウンド処理を担当する。
 * インストール時の初期化処理を行い、プロジェクト名が未設定の場合は
 * 設定ページを自動的に開く。
 */

import { getProjectName } from "../lib/storage";

export default defineBackground(() => {
  /**
   * 拡張機能インストール・アップデート時の処理
   *
   * インストール直後にプロジェクト名が未設定の場合、
   * 設定ページを開いてユーザーに設定を促す。
   */
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      const projectName = await getProjectName();
      if (!projectName) {
        // プロジェクト名が未設定の場合、設定ページを開く
        await browser.tabs.create({
          url: browser.runtime.getURL("/options.html"),
        });
      }
    }
  });
});
