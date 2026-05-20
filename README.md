# Cosense Link Clipper

現在開いているWebページのタイトルとURLをCosense（旧Scrapbox）のページとして保存するChrome/Firefox拡張機能です。

## 機能

- 現在のタブのタイトルとURLを取得してCosenseの新規ページとして保存
- 右クリックメニュー「Cosenseに保存」からも操作可能
- Cosenseプロジェクト名をブラウザ設定に保存（chrome.storage.sync で同期）
- 保存後にCosenseページを開くかどうかを設定可能（バックグラウンド保存に対応）
- 日本語・英語に対応（ブラウザのロケールに自動で切り替え）

## 技術スタック

- [WXT](https://wxt.dev/) - ブラウザ拡張機能フレームワーク
- TypeScript
- React 19
- Tailwind CSS v4

## セットアップ

```bash
npm install
npm run build
```

## 開発

```bash
# Chrome向け開発サーバー起動
npm run dev

# Firefox向け開発サーバー起動
npm run dev:firefox

# Chrome向けビルド
npm run build

# Firefox向けビルド
npm run build:firefox
```

## インストール方法

### Chrome

1. `npm run build` を実行
2. `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `.output/chrome-mv3/` フォルダを選択

### Firefox

1. `npm run build:firefox` を実行
2. `about:debugging` を開く
3. 「このFirefox」→「一時的なアドオンを読み込む」
4. `.output/firefox-mv2/manifest.json` を選択

## 使い方

1. 設定ページでCosenseのプロジェクト名を入力して保存
2. クリップしたいWebページを開く
3. ツールバーの拡張機能アイコンをクリック
4. 「Cosenseに保存」ボタンをクリック（または右クリックメニューから操作）

設定の「保存後にCosenseのページを開く」をオフにすると、バックグラウンドタブで保存され現在のページから離れません。
