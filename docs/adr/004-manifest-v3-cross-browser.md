# ADR 004: Manifest V3 + WXT による Chrome/Firefox クロスブラウザ対応

## Status

Accepted

## Context

Chrome は Manifest V3（MV3）を必須としており、MV2 拡張機能の新規申請を受け付けていない。
一方、Firefox は MV3 をサポートしているが、MV2 との互換性もある程度維持している。

2 つのブラウザに対応する際の選択肢:

| | 方式 | Chrome | Firefox | 保守コスト |
|---|---|---|---|---|
| A: MV3 のみ | manifest_version: 3 | ✅ | △（動作するが MV3 の一部 API が未対応） | 低 |
| B: MV2 のみ | manifest_version: 2 | ❌（新規申請不可） | ✅ | — |
| C: WXT による自動変換 | Chrome: MV3 / Firefox: MV2 | ✅ | ✅ | 低（WXT が差分を吸収） |

Firefox の MV3 実装は MV2 と比べてまだ差異がある（`service_worker` 対応など）。
WXT はビルド時に `browser` 引数に応じて `manifest_version` や `background` の記述形式を
自動で切り替える機能を持っている。

## Decision

**C（WXT による自動変換）** を採用する。

- Chrome 向け: Manifest V3（`manifest_version: 3`）、バックグラウンドは Service Worker
- Firefox 向け: Manifest V2（`manifest_version: 2`）、バックグラウンドは `background.scripts`
- `wxt.config.ts` の `manifest` を関数形式 `({ browser }) => ({...})` にして Firefox 専用の `browser_specific_settings` を追加
- Firefox の gecko ID は `cosense-link-clipper@tnmt`、最低バージョンは 91.0

```typescript
// wxt.config.ts（抜粋）
manifest: ({ browser }) => ({
  permissions: ["storage", "tabs", "contextMenus"],
  ...(browser === "firefox" && {
    browser_specific_settings: {
      gecko: { id: "cosense-link-clipper@tnmt", strict_min_version: "91.0" },
    },
  }),
}),
```

## Consequences

### ✅ 良い点

- Chrome/Firefox どちらにも公式の方法で配布できる
- MV2/MV3 の差分を WXT が吸収するため、アプリケーションコードで分岐しなくてよい
- Chrome Web Store と Firefox Add-ons の両方で申請可能

### ❌ トレードオフ

- Firefox 向けは MV2 でビルドされるため、将来 Firefox が MV2 のサポートを完全に終了した場合に対応が必要になる
- MV3 の Service Worker は MV2 の `background page` と異なり、状態を永続化できない（現在は問題なし）
- ビルド成果物が Chrome 用と Firefox 用の 2 種類になり、リリース作業が 2 回分発生する

## References

- `wxt.config.ts`
- `.github/workflows/release.yml`
- [WXT: Firefox support](https://wxt.dev/guide/essentials/target-different-browsers.html)
- [ADR 001](001-wxt-framework.md)
