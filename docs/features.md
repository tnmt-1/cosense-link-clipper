# 機能一覧

## 概要

Cosense Link Clipper がエンドユーザー向けに提供する機能と、設定・保存動作・
ブラウザ互換の仕組みを一覧で示す。

## ユーザー向け機能

### ポップアップからのクリップ

- ツールバーの拡張機能アイコンをクリックしてポップアップを開く
- 現在のタブのタイトルと URL を自動取得して表示
- 「Cosenseに保存」ボタンで Cosense の新規ページ作成画面を開く
- Cosense URL 方式: `https://scrapbox.io/{project}/{title}?body={url}`
  - タイトル・URL は `encodeURIComponent` でエンコード
  - 保存は新規タブで開く（Cosense 側でページが確定される）
- 保存後 0.8 秒でポップアップが自動的に閉じる
- プロジェクト名未設定時は警告を表示して設定ページへ誘導

### 右クリックメニューからのクリップ

- ページ上で右クリック →「Cosenseに保存」から操作可能
- ポップアップを開かずにワンステップで保存できる
- プロジェクト名未設定時は設定ページを新しいタブで開く

### バックグラウンド保存

- 設定「保存後にCosenseのページを開く」をオフにするとバックグラウンドタブで保存
- 現在開いているページから離れずにクリップが完了する
- ポップアップ・右クリックメニューのどちらでも同じ設定が反映される

---

## 設定

### プロジェクト名設定（Options ページ）

- 設定ページで Cosense プロジェクト名を入力・保存
- `chrome.storage.sync` に保存。Chrome へのログイン時はデバイス間で自動同期
- 入力フォームは `scrapbox.io/` のプレフィックスを表示して入力ミスを防ぐ
- 設定先プレビュー（`https://scrapbox.io/{projectName}/...`）をリアルタイム表示
- Enterキーでも保存できる

### 保存時の動作設定

- 「保存後にCosenseのページを開く」チェックボックスで切り替え
- デフォルトは ON（保存後に Cosense ページを前面タブで開く）
- OFF にするとバックグラウンドタブで保存（現在のページから離れない）

---

## 初回インストール時の動作

### 設定ページの自動表示

- 拡張機能インストール直後にプロジェクト名が未設定の場合、設定ページを自動で開く
- アップデート時は開かない（`reason === "install"` のみ）

---

## 国際化（i18n）

- ブラウザのロケールに応じて日本語・英語を自動切り替え
- `public/_locales/ja/messages.json`（日本語）/ `en/messages.json`（英語）
- UI テキストはすべて `browser.i18n.getMessage` 経由で取得

---

## ブラウザ対応

- **Chrome / Chromium**: Manifest V3
- **Firefox**: WXT の自動変換機能により Manifest V2 に変換（Firefox 91.0 以上）
- Firefox 向けビルドは `gecko.id: cosense-link-clipper@tnmt` を付与

---

## リリース・配布

### GitHub Actions による自動リリース（`v*` タグ push 時）

- Chrome 向け ZIP ビルド（`wxt zip`）
- Firefox 向け ZIP ビルド（`wxt zip:firefox`）→ XPI にリネームして GitHub Releases に添付
- Mozilla AMO へ自動提出（`web-ext sign --channel=listed`）。レビュー通過後に Firefox Add-ons で公開される
- GitHub Releases に Chrome ZIP（`*-chrome.zip`）と Firefox XPI（`*-firefox.xpi`）を添付

### 配布チャンネルごとの公開フロー

| ブラウザ | 配布先 | 公開フロー |
|---|---|---|
| Chrome | Chrome Web Store | GitHub Releases の ZIP を手動提出 |
| Firefox | Firefox Add-ons（AMO） | `v*` タグ push で AMO に自動提出・レビュー後公開 |
