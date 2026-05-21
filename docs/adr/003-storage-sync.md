# ADR 003: chrome.storage.sync によるプロジェクト名管理

## Status

Accepted

## Context

ユーザーが設定するプロジェクト名（および「保存後にCosenseのページを開く」フラグ）を
どこに永続化するかを決める必要があった。

ブラウザ拡張機能で利用できる主な保存先:

| | 保存先 | 容量 | デバイス間同期 | 特徴 |
|---|---|---|---|---|
| A: `storage.sync` | Chrome アカウントに紐づくクラウド | 合計 100KB / item 8KB | ✅ | Chrome へのログインで同期される |
| B: `storage.local` | デバイスローカル | 合計 10MB | ❌ | 大容量保存に向く |
| C: `localStorage` | Web Storage | 制限なし（実質 5MB） | ❌ | 拡張機能からは使えない（MV3 で制約） |

プロジェクト名と保存動作フラグは小さいデータ（合計 100 バイト以下）であり、
複数デバイスで同じ設定を使いたいというユースケースが自然に想定される。

## Decision

**A（`chrome.storage.sync`）** を採用する。

- 保存キー: `cosenseProjectName`（プロジェクト名）/ `openPageOnSave`（保存時動作フラグ）
- 読み書きは `src/lib/storage.ts` に集約（`getSettings` / `saveProjectName` / `saveOpenPageOnSave`）
- `browser.storage.sync` 経由で WXT ポリフィルを通じてアクセスするため、Chrome/Firefox どちらでも動作する

## Consequences

### ✅ 良い点

- 自宅 PC と会社 PC で設定を共有できる（Chrome アカウントでログイン時）
- 設定データが小さいため `sync` の容量制限（100KB）に引っかかる心配がない
- `storage.local` より API が同じであり、将来的な切り替えコストも低い

### ❌ トレードオフ

- Chrome にログインしていない環境では同期されない（デバイスローカルにのみ保存される）
- Firefox では `storage.sync` がサポートされているが、Firefox Sync への連携は設定によっては無効になっている場合がある
- item ごとの容量上限が 8KB なので、将来大量のデータを保存する設計には向かない

## References

- `src/lib/storage.ts`
- [Chrome Extensions: storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
