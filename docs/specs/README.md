# 機能仕様 (Specifications)

## 概要

Cosense Link Clipper の各機能の仕様書（1 機能 1 ファイル）のインデックス。
書き方の方針と運用ルールも示す。

実装と運用の乖離を埋めるのが目的で、**1 機能 1 ファイル**。
書き方は Joel Spolsky の ["Painless Functional Specifications"](https://www.joelonsoftware.com/2000/10/02/painless-functional-specifications-part-1-why-bother/) を踏襲し、*雑に書いてもいい・随時更新する* 前提。

## 一覧

| ファイル | 機能 |
|---|---|
| [spec-popup.md](spec-popup.md) | ポップアップからのクリップ操作 |
| [spec-options.md](spec-options.md) | 設定ページ（プロジェクト名・保存時動作） |
| [spec-context-menu.md](spec-context-menu.md) | 右クリックメニューからのクリップ |

## Spec のフォーマット

各 Spec は以下の 3 部構成:

1. **概要** — この機能は何か、なぜあるのか
2. **機能仕様** — Joel 風。免責・著者・シナリオ・非ゴール・UI の流れ・未解決課題などを*人間が読む想定*で書く
3. **詳細仕様** — 実装に踏み込んだエッジケース・データ・関連ファイル

## 運用ルール

- 実装変更と Spec 変更は同じ PR で揃える
- 「未解決課題」欄を空にしない（現時点で未解決なら正直に書いておく）
- 書いた日付・最終更新を著者欄に残す
- 設計判断（なぜこの方式にしたか）は Spec ではなく [ADR](../adr/) に書く
