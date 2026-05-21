# ADR 001: WXT フレームワークの採用

## Status

Accepted

## Context

Chrome/Firefox の両ブラウザに対応したブラウザ拡張機能を TypeScript + React で
開発するにあたり、ビルドツール・フレームワークの選定が必要だった。

制約と要件:

- **Chrome と Firefox の両対応**: Manifest バージョンが異なる（Chrome: MV3、Firefox: MV2）
- **TypeScript + React での開発**: 型安全性と宣言的 UI が欲しい
- **開発体験**: HMR（Hot Module Replacement）でポップアップ・設定ページを素早く確認したい
- **ビルドの複雑さを最小化**: Webpack/Rollup を自前で設定したくない

検討した選択肢:

| | フレームワーク | Chrome/Firefox 対応 | HMR | 学習コスト |
|---|---|---|---|---|
| A: WXT | WXT + Vite | ◎ 自動変換 | ◎ | 低 |
| B: Plasmo | Plasmo | ◯ | ◎ | 中 |
| C: 手動 Webpack | Webpack 5 + webextension-polyfill | △ 手動設定 | △ | 高 |
| D: 手動 Vite | Vite + webextension-polyfill | △ 手動設定 | ◯ | 中 |

Plasmo は有力な候補だが、独自の抽象化が強く将来の乗り換えコストが高い。
手動構成は MV2/MV3 の差異を自前で吸収する必要があり、保守コストが増える。

## Decision

**A（WXT）** を採用する。

- ビルドツール: WXT (Web Extension Toolkit) + Vite
- MV3/MV2 の差分は WXT が自動的に吸収する（`browser` 引数で切り替え）
- エントリーポイントは `src/entrypoints/` に配置し、WXT が manifest に自動登録
- React モジュール (`@wxt-dev/module-react`) で JSX 変換を設定
- `browser.*` API は WXT が提供するポリフィル経由で統一的に呼び出す

## Consequences

### ✅ 良い点

- Chrome ZIP / Firefox XPI のビルドがコマンド 1 発で完了する
- HMR により開発中のポップアップ・設定ページ確認が高速
- manifest の大半を WXT が生成するため、`wxt.config.ts` だけ管理すればよい
- `browser.*` API のポリフィルが組み込まれており、`chrome.*` / `browser.*` を意識しなくてよい

### ❌ トレードオフ

- WXT 自体がまだ比較的新しい（v0.x）ため、破壊的変更のリスクがある
- WXT 固有の抽象化（`defineBackground`、`defineContentScript` 等）を学ぶ必要がある
- Plasmo と比べると公式プラグインのエコシステムはまだ小さい

## References

- [WXT 公式ドキュメント](https://wxt.dev/)
- `wxt.config.ts`
