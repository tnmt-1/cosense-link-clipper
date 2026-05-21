# Spec: 右クリックメニューからのクリップ

> **免責**: この Spec は完全ではない。機能変更があれば随時更新する。実装とズレを見つけたら修正 PR を送ってほしい。
> **著者**: cosense-link-clipper / 最終更新: 2026-05-22

## 概要

ページ上で右クリックすると表示されるコンテキストメニューに「Cosenseに保存」を追加し、
ポップアップを開かずにワンステップでクリップできる機能。
処理はバックグラウンドサービスワーカーが担当する。

## 機能仕様

### シナリオ 1: 平田さん、ポップアップを開かずに素早く保存したい

平田さんはキーボードショートカット派で、マウスの右クリックからサクッと保存したい。

1. 保存したいページを右クリックする
2. コンテキストメニューに「Cosenseに保存」が表示されている
3. 「Cosenseに保存」をクリックする
4. 新しいタブで Cosense のページ作成画面が開く（設定に応じてアクティブ/バックグラウンド）
5. ポップアップを開く手間なく保存が完了する

### シナリオ 2: 山本さん、プロジェクト名を設定していない状態で右クリックする

山本さんは設定をまだ完了していない。

1. ページを右クリックして「Cosenseに保存」をクリックする
2. ポップアップは開かず、代わりに設定ページが新しいタブで開く
3. 山本さんはプロジェクト名を設定して、次回から使えるようになる

### 非ゴール

- **完了通知**: コンテキストメニューからの保存後に「保存しました」の通知は表示しない（ポップアップと異なり、UI がないため）
- **選択テキストを本文に含める**: 右クリック時に選択していたテキストをページ本文として渡す機能は対象外（現在は URL のみ）
- **リンク先の URL を保存**: ページ上のリンクを右クリックしてそのリンク先を保存する機能は対象外

### 未解決課題

- バックグラウンドサービスワーカーは拡張機能がインストールされたタイミングでコンテキストメニューを登録する。Service Worker のライフサイクルによってはメニューが消える可能性があるが、`setupContextMenu` で `removeAll` してから再作成しているため実害は確認されていない
- コンテキストメニューのアイコンが未設定（ブラウザデフォルトの拡張機能アイコンが使われる）

## 詳細仕様

### エントリーポイント

`src/entrypoints/background.ts`

#### コンテキストメニュー登録（`setupContextMenu`）

```typescript
browser.contextMenus.removeAll(() => {
  browser.contextMenus.create({
    id: "save-to-cosense",
    title: t("contextMenuSave"),  // "Cosenseに保存" / "Save to Cosense"
    contexts: ["page"],
  });
});
```

- `contexts: ["page"]` により、ページ内の任意の場所で右クリックしたときに表示される
- `removeAll` してから `create` することで二重登録を防ぐ
- タイトルは `browser.i18n.getMessage("contextMenuSave")` 経由で言語ローカライズされる

#### クリック時の処理（`handleContextMenuClick`）

1. `info.menuItemId !== "save-to-cosense"` または `!tab` なら無視
2. `getProjectName()` でプロジェクト名を取得
3. `isValidProjectName` で検証 → 無効なら設定ページを開いて終了
4. `getSettings()` で `openPageOnSave` フラグを取得
5. `tab.title` / `tab.url` から `buildCosenseUrl` で URL を生成
6. `browser.tabs.create({ url: cosenseUrl, active: settings.openPageOnSave })` で開く

### コンテキストメニューの表示対象

- `contexts: ["page"]` のみ。`selection`（選択テキストあり）や `link`（リンク上）は含まない
- 実質すべての Web ページで表示される（chrome:// 等の特殊ページを除く）

### インストール時の初期化

```typescript
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    const projectName = await getProjectName();
    if (!projectName) {
      await browser.tabs.create({ url: browser.runtime.getURL("/options.html") });
    }
  }
});
```

- インストール直後にプロジェクト名が未設定の場合のみ設定ページを開く
- アップデート時（`"update"`）は開かない

### 関連ファイル

- `src/entrypoints/background.ts` — コンテキストメニュー登録・クリック処理・インストール初期化
- `src/lib/cosense.ts` — `buildCosenseUrl` / `isValidProjectName`
- `src/lib/storage.ts` — `getProjectName` / `getSettings`
- `src/lib/i18n.ts` — `t("contextMenuSave")`
- `public/_locales/*/messages.json` — `contextMenuSave` キー
