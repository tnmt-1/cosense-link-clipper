# ADR 002: Cosense URL API によるページ作成

## Status

Accepted

## Context

Web ページを Cosense（旧 Scrapbox）に保存する方法として、どのインターフェースを
使うかを選定する必要があった。

Cosense にページを作成する手段として大きく 2 通り存在する:

| | 方式 | 認証 | 動作 |
|---|---|---|---|
| A: URL 方式 | `https://scrapbox.io/{project}/{title}?body={url}` | 不要 | ブラウザで開くとページ作成画面が開く |
| B: REST API | `POST https://scrapbox.io/api/pages/{project}` | OAuth / セッション Cookie 必要 | プログラムからページを作成 |

URL 方式はブラウザで開くだけでページ作成画面が開くパブリックな仕様。
REST API は認証が必要で、拡張機能から OAuth フローを実装するのは複雑。

追加の制約:

- **ユーザーの確認を経てページが作成される**: URL 方式では Cosense 上でユーザーが「保存」ボタンを押すまでページは確定しない。意図しない保存を防げる
- **認証情報を拡張機能に持たせたくない**: セキュリティ上のリスクを避けたい

## Decision

**A（URL 方式）** を採用する。

```
https://scrapbox.io/{projectName}/{encodedTitle}?body={encodedUrl}
```

- `{projectName}`: ユーザーが設定ページで入力したプロジェクト名
- `{encodedTitle}`: 現在のタブのタイトルを `encodeURIComponent` でエンコード
- `{encodedUrl}`: 現在のタブの URL を `encodeURIComponent` でエンコード
- 上記 URL を新しいタブで開くことでページ作成画面に遷移する

実装は `src/lib/cosense.ts::buildCosenseUrl` に集約。

## Consequences

### ✅ 良い点

- OAuth や Cookie の取り扱いが一切不要。認証情報を持たないため安全
- ユーザーが Cosense 側で内容を確認・編集してから保存できる
- Cosense 公式が提供している方式であり、将来的な互換性リスクが低い
- `permissions` に `storage` / `tabs` / `contextMenus` だけで済む（`host_permissions` 不要）

### ❌ トレードオフ

- ページ作成が「確定」するのはユーザーが Cosense 上で保存操作をしたとき。拡張機能側で保存完了を検知できない
- Cosense のページ作成 URL 仕様が変わった場合は `buildCosenseUrl` の修正が必要
- body に埋め込めるのは URL 文字列のみ（リッチなテンプレートは使えない）

## References

- `src/lib/cosense.ts`
- [Scrapbox ヘルプ: ページを作成する](https://scrapbox.io/help-ja/)
