# Release workflow整理設計書

## 概要

Chrome Web Storeへの自動uploadおよびpublish申請はやめ、従来どおりGitHub ReleasesにChrome用zipとFirefox用xpiを配置し、その後のストア反映は人手で行う運用に戻す。

この変更では、自動公開のために追加したworkflow、補助script、関連ドキュメントのうち、現方針に不要な部分を削除する。

## 目的

- GitHub Releasesに配布用成果物を置く現在の配布フローに合わせる
- Chrome Web Store自動公開のためだけに存在するコードと設定を削除する
- Firefox署名とGitHub Release作成は維持する
- 今後の運用と実装の不一致をなくす

## 対象範囲

### 含むもの

- `.github/workflows/release.yml`からChrome Web Store自動publish jobを削除
- `.github/scripts/publish-chrome-web-store.mjs`を削除
- 自動公開前提のspecとplanを削除
- README内に自動公開前提の記述があれば削除

### 含まないもの

- Chrome ZIP生成処理そのものの変更
- Firefox署名処理の変更
- `wxt.config.ts`のmanifest設定変更
- `package.json`のFirefox署名に必要な依存整理

## アプローチ比較

### 案1: 自動公開関連のみ削除

最小限の変更で、現運用に不要な要素だけを落とす。

利点:
- 変更範囲が明確
- Release成果物の生成は維持できる
- 運用方針との不一致を解消できる

欠点:
- 将来自動公開を再導入する場合は作り直しが必要

### 案2: workflowだけ止めて関連ファイルは残す

実行だけ止めて、scriptや文書は残す。

利点:
- 将来戻しやすい

欠点:
- 不要ファイルが残り続ける
- 現方針と文書がずれやすい

### 案3: 案1に加えて周辺依存も削る

案1に加え、周辺依存やscriptまで広く整理する。

利点:
- よりすっきりする

欠点:
- Firefox署名に必要な依存まで誤って触る危険がある
- 今回の目的より変更範囲が広がる

## 採用方針

案1を採用する。

自動公開のためだけに追加した不要部分を削除しつつ、現在も必要なRelease生成、Chrome ZIP作成、Firefox署名とxpi添付はそのまま維持する。

## 変更設計

### 1. release workflow

`.github/workflows/release.yml`では以下を残す。

- tag pushによる起動
- 依存関係install
- Chrome ZIP build
- Firefox build
- Firefox署名
- GitHub Release作成

以下を削除する。

- `chrome_web_store_publish` job全体
- Chrome Web Store用Environment参照
- Chrome Web Store用Secrets参照
- 自動publish script実行step

### 2. publish script

`.github/scripts/publish-chrome-web-store.mjs`は用途がなくなるため削除する。

### 3. ドキュメント

以下の文書は自動公開導入専用のため削除する。

- `docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md`
- `docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md`

READMEは現時点で自動公開の説明を含んでいないため、基本的には変更しない。もし関連記述が追加で見つかれば削除する。

## エラーハンドリング

- Chrome Web Store関連Secretsが未設定でもworkflowが失敗しない状態に戻す
- Release job単体で完結する構成に戻す
- Firefox署名失敗時は従来どおりworkflow失敗とする

## テスト方針

- `release.yml`のYAML構文確認
- 必要なら`npm run typecheck`で既存コードへの影響がないことを確認
- 変更差分を確認し、Chrome Web Store自動公開関連のみが削除されていることを確認

## 成功条件

- GitHub Actions workflowにChrome Web Store自動公開jobが存在しない
- 自動公開scriptが削除されている
- 自動公開前提のspecとplanが削除されている
- GitHub ReleaseへChrome ZIPとFirefox XPIを添付する既存フローは維持されている
