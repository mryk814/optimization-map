# AI Coding Brief Template

AI に実装を渡すときは、コードではなく実装契約として以下を埋める。

## Template

```md
# AI Coding Brief: {title}

## 課題
何を解くか。現実課題として一文で書く。

## 決定変数
何を変えられるか。index と domain を書く。

## 目的
最小化 / 最大化する量。単位と penalty を書く。

## 制約
守る条件。hard と soft を分ける。

## 推奨ライブラリ
候補 solver / library と、選ぶ理由。

## 実装方針
- 入力 schema
- model construction
- solve / static trace replay
- output formatting

## 注意点
- 実行不能時の扱い
- solver status
- 数値 scale
- live execution をしない場合の trace 前提

## 期待出力
表、JSON、trace、diagnostics など。
```

## Required Fields In Data

`data/ai_coding_briefs.yml` では次を必須にする。

- `target_type`
- `target_id`
- `title`
- `decision_variables`
- `objective`
- `constraints`
- `recommended_libraries`
- `implementation_plan`
- `cautions`
- `expected_output`

## Export

UI では Markdown copy と JSON export の両方を提供する。brief はアプリ内に閉じ込めず、AI coding session や notebook へ持ち出せることを前提にする。
