# Visualization

Visualization の目的は、最適化分野の「現在地」と「隣に何があるか」を見せることです。

ビジュアル実装の仕様化には [Visual Spec Template](visual-spec-template.md) を使います。最初から live solver を動かすのではなく、`OptimizationTrace` を再生する静的デモとして設計します。

## Current MVP Views

### Case-first Solving Flow

`ExampleCase -> signals -> ProblemType -> Algorithm -> Solver`

- Meaning: 問題名を知らない利用者が、現実課題の手がかりから候補タイプ、手法、実装候補へ進む
- URL: `#/cases/:id`, `#/paths/:id`

### Problem Type Article

- Meaning: 1つの問題タイプについて、形、使う場面、避ける場面、難しさ、手法、solver、sources を読解順に見る
- URL: `#/problems/:id`

### Comparison View

- Meaning: 似た概念を並べ、どちらから考えるべきかを判断する
- URL: `#/compare/:left/:right`

### Diagnosis View

- Meaning: 変数、線形性、不確実性などから次に読む問題タイプ候補を絞る
- URL: `#/diagnosis`

## v0.2 Visual Learning Layer

### SolveStory

- Node: ExampleCase / ProblemType / Algorithm / Solver
- Meaning: `課題 → 変数 → 目的 → 制約 → 手法 → trace → 解釈` の流れを読む
- Data: `data/solve_stories.yml`

### OptimizationTrace Player

- Node: SolveStory
- Meaning: 事前計算された状態列を step-by-step に再生する
- Data: `data/optimization_traces.yml`

### Algorithm Visual Supplement

- Node: Algorithm
- Meaning: その手法で「何が動くと理解しやすいか」を明示する
- Data: `data/visual_supplements.yml`

## Deferred Graph Views

### Problem Type Map

- Node: ProblemType
- Edge: `is_a`, `overlaps_with`, `confused_with`
- Filter: core axis, tag, relation type
- Meaning: 分野の近さと混同しやすい関係

### Relation Graph

- Node: ProblemType / Algorithm / Solver / ModelingPattern / ExampleCase
- Edge: all relation types
- Meaning: 課題を候補タイプ、手法、solver 候補へ翻訳する流れ

### Difficulty Heatmap

- Rows: ProblemType
- Columns: hardness factors such as integer, nonconvex, blackbox, uncertainty, time
- Meaning: なぜ難しいかを一語で止めず分解する

### Problem Type x Algorithm

- Bipartite graph or matrix
- Meaning: 問題タイプから手法候補へ進む

### Problem Type x Solver

- Table first, graph second
- Meaning: 実装候補を比較する

## Deferred Views

- interactive force-directed graph with manual layout save
- performance benchmark dashboard
- solver execution UI
- source citation network
- live Python / Pyodide execution

## Visual Encoding

- Node color uses category colors, not semantic danger/success.
- Edge type is shown by label and stroke style.
- Selected node uses accent border and subtle background.
- Heatmap uses single-hue intensity; do not use rainbow.
- Table data must support TSV copy and CSV export.

## Implementation Rule

- Prefer static trace replay before live execution.
- Every visual demo should declare `learning_goal`, `what_moves`, and `what_user_should_notice`.
- AI coding briefs should be specific enough to implement a component without reading optimization textbooks.
