# Visualization

Visualization の目的は、最適化分野の「現在地」と「隣に何があるか」を見せることです。

## MVP Views

### ProblemClass Map

- Node: ProblemClass
- Edge: `is_a`, `overlaps_with`, `confused_with`
- Filter: core axis, tag, relation type
- Meaning: 分野の近さと混同しやすい関係

### Relation Graph

- Node: ProblemClass / Algorithm / Solver / ModelingPattern / ExampleCase
- Edge: all relation types
- Meaning: 課題から solver までの経路

### Difficulty Heatmap

- Rows: ProblemClass
- Columns: hardness factors such as integer, nonconvex, blackbox, uncertainty, time
- Meaning: なぜ難しいかを一語で止めず分解する

### ProblemClass x Algorithm

- Bipartite graph or matrix
- Meaning: 問題クラスから手法候補へ進む

### ProblemClass x Solver

- Table first, graph second
- Meaning: 実装候補を比較する

### Pipeline View

`課題 -> モデル化パターン -> ProblemClass -> Algorithm -> Solver`

## Deferred Views

- interactive force-directed graph with manual layout save
- performance benchmark dashboard
- solver execution UI
- source citation network

## Visual Encoding

- Node color uses category colors, not semantic danger/success.
- Edge type is shown by label and stroke style.
- Selected node uses accent border and subtle background.
- Heatmap uses single-hue intensity; do not use rainbow.
- Table data must support TSV copy and CSV export.
