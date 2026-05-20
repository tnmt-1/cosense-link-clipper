/**
 * バックグラウンドサービスワーカー
 *
 * 拡張機能のバックグラウンド処理を担当する。
 * インストール時の初期化処理を行い、プロジェクト名が未設定の場合は
 * 設定ページを自動的に開く。
 */

import { buildCosenseUrl, isValidProjectName } from "../lib/cosense";
import { getProjectName, getSettings } from "../lib/storage";

/** コンテキストメニューのID */
const CONTEXT_MENU_ID = "save-to-cosense";

export default defineBackground(() => {
  setupContextMenu();

  /**
   * 拡張機能インストール・アップデート時の処理
   *
   * @returns Promise<void>
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

  /**
   * コンテキストメニュークリック時の処理
   *
   * @returns void
   */
  browser.contextMenus.onClicked.addListener(handleContextMenuClick);
});

/**
 * コンテキストメニューを登録する
 *
 * @returns void
 */
function setupContextMenu(): void {
  browser.contextMenus.removeAll(() => {
    browser.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "Cosenseに保存",
      contexts: ["page"],
    });
  });
}

/**
 * コンテキストメニュークリック時の処理
 *
 * @param info - クリックされたメニューの情報
 * @param tab - クリック時のタブ情報
 * @returns Promise<void>
 */
async function handleContextMenuClick(
  info: browser.contextMenus.OnClickData,
  tab?: browser.tabs.Tab
): Promise<void> {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab) return;

  const projectName = await getProjectName();
  if (!isValidProjectName(projectName)) {
    await browser.tabs.create({ url: browser.runtime.getURL("/options.html") });
    return;
  }

  const settings = await getSettings();
  const title = tab.title ?? "";
  const url = tab.url ?? "";
  if (!url) return;

  const cosenseUrl = buildCosenseUrl(projectName, title, url);
  await browser.tabs.create({ url: cosenseUrl, active: settings.openPageOnSave });
}
