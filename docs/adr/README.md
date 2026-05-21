# Architecture Decision Records (ADR)

## 概要

Cosense Link Clipper の主要な設計判断を ADR (Architecture Decision Record) 形式で記録する。
1 判断 1 ファイルで Status / Context / Decision / Consequences を書く。

プロジェクトの重要な設計判断を時系列で記録する。

## 一覧

| 番号 | タイトル | ステータス |
|------|----------|-----------|
| 001  | WXT フレームワークの採用 | Accepted |
| 002  | Cosense URL API によるページ作成 | Accepted |
| 003  | chrome.storage.sync によるプロジェクト名管理 | Accepted |
| 004  | Manifest V3 + WXT による Chrome/Firefox クロスブラウザ対応 | Accepted |

> 中身は必要になったタイミングで追加していく。骨組みだけ先に用意。

## フォーマット

新規 ADR は以下のテンプレートで作成:

```markdown
# ADR NNN: タイトル

## Status
Proposed / Accepted / Superseded by ADR 00X / Deprecated

## Context
なぜこの判断が必要か、当時の状況・制約・選択肢

## Decision
何を決めたか

## Consequences
- ✅ 良い結果
- ❌ 悪い結果・トレードオフ

## References
関連 PR / Issue / 外部資料
```

## 運用ルール

- ファイル名: `NNN-kebab-case.md`（NNN は 3桁ゼロ埋め）
- **既存 ADR は書き換えない**。覆す場合は新しい ADR を作り、旧 ADR の Status を `Superseded by ADR 00X` に変更するのみ
- 小さな判断（コードスタイル・リファクタ）は ADR にしない。プロジェクト方針に影響する判断のみ
