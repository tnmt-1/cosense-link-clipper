# cosense-link-clipper 設計書

## 概要

現在開いているWebページのタイトルとURLをCosense（旧Scrapbox）のページとして保存するChrome/Firefox拡張機能。

## アーキテクチャ

### 技術スタック

- **フレームワーク**: WXT v0.20.x（Web Extension Toolkit）
- **言語**: TypeScript
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS v4
- **ビルドツール**: Vite（WXT内蔵）
- **パッケージマネージャ**: pnpm

### ページ作成方式

Cosense公式のURL方式を使用する：

```
https://scrapbox.io/{project}/{title}?body={url}
```

- `{project}`: ユーザーが設定するプロジェクト名
- `{title}`: 現在のページタイトル（`encodeURIComponent`でエンコード）
- `{url}`: 現在のページURL（`encodeURIComponent`でエンコード）

新しいタブでCosenseが開き、ページが作成される。

### コンポーネント構成

```
src/
├── entrypoints/
│   ├── popup/              # クリップ操作UI
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── options/            # 設定ページ（プロジェクト名設定）
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   └── background.ts       # サービスワーカー
├── lib/
│   ├── cosense.ts          # Cosense URL生成ロジック
│   └── storage.ts          # ストレージ操作（WXT storage API）
└── components/
    ├── ClipButton.tsx       # クリップ実行ボタン
    └── ProjectInput.tsx     # プロジェクト名入力フォーム
```

## 機能詳細

### Popup（メインUI）

- 現在のタブのタイトルとURLを取得して表示
- 「Cosenseに保存」ボタンでページ作成URLを新しいタブで開く
- プロジェクト名が未設定の場合は設定ページへ誘導
- 操作後は「保存しました！」の確認メッセージを表示

### Options（設定ページ）

- Cosenseプロジェクト名の入力・保存
- 設定はchrome.storage.sync（WXT storage API）に保存（ブラウザ間同期）

### Background（サービスワーカー）

- インストール時の初期化処理
- 設定未完了時に設定ページを自動で開く

## Permissions

```json
{
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["https://scrapbox.io/*"]
}
```

## データフロー

```
[ユーザーがポップアップを開く]
    ↓
[chrome.tabs.queryで現在タブのtitle/urlを取得]
    ↓
[storage.syncからプロジェクト名を読み込む]
    ↓
[Cosense URLを生成: https://scrapbox.io/{project}/{title}?body={url}]
    ↓
[「保存」ボタンクリック → chrome.tabs.createで新しいタブを開く]
```

## エラーハンドリング

- プロジェクト名未設定: 設定ページへ誘導するメッセージを表示
- タブ情報取得失敗: エラーメッセージを表示
- 特殊文字を含むタイトル/URL: encodeURIComponentで安全にエンコード

## ブラウザ対応

- Chrome/Chromium: Manifest V3
- Firefox: WXTのFirefox対応により自動変換

## 非機能要件

- 関数・メソッドにはdocstringコメント（引数・戻り値・説明を日本語で記載）
- TypeScriptの型安全性を最大限活用
- ポップアップの最小サイズ: 320px幅
