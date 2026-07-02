# Visualization

Visualization の目的は、最適化分野の「現在地」と「隣に何があるか」を見せることです。

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

### Algorithm Motion Gallery

- Meaning: Algorithm ごとの `what_moves` / `what_user_should_notice` と motion preview を見る
- URL: `#/algorithms`, `#/algorithms/:id`
- Data: `data/visual_supplements.yml`, `data/optimization_traces.yml`

### SolveStory Library

- Meaning: 現実課題を `課題 -> 変数 -> 目的 -> 制約 -> 手法 -> trace -> 解釈` として読む
- URL: `#/stories`, `#/stories/:id`
- Data: `data/solve_stories.yml`, `data/optimization_traces.yml`, `data/ai_coding_briefs.yml`

### Learning Paths

- Meaning: audience 別に ProblemType / Algorithm / SolveStory / Brief を短い順路で辿る
- URL: `#/learning`, `#/learning/:id`
- Data: `data/learning_paths.yml`

### Knowledge Graph Explorer

- Node: ProblemType
- Edge: `is_a`, `overlaps_with`, `confused_with`
- Filter: core axis, tag, relation type
- Meaning: 分野の近さと混同しやすい関係
- URL: `#/graph`, `#/graph/:focus`

Explorer mode:

- Beginner Map: 現実課題 -> ProblemType -> Algorithm -> Solver
- Concept Map: `is_a`, `overlaps_with`, `confused_with`, `relaxes_to`, `reformulates_to`
- Method Map: ProblemType -> Algorithm -> Solver
- Source Map: ProblemType -> Case

### Coverage Dashboard

- Meaning: Source、SolveStory、VisualSupplement、AI Coding Brief、LearningPath、relation endpoint の coverage を見る
- URL: `#/quality`
- Data: `npm run report` の出力と同じ指標

## Deferred Views

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

- interactive force-directed graph with manual layout save
- performance benchmark dashboard
- solver execution UI
- source citation network

## AI Implementation Templates

- Visual component を AI に依頼する前に、[Visual Spec Template](visual-spec-template.md) を埋める。
- 実装指示として持ち出す場合は、[AI Coding Brief Template](ai-coding-brief-template.md) の項目を満たす。
- live solver 実行を前提にしない。必要性の判断は [Live Execution Options](live-execution-options.md) に分離する。

## Visual Encoding

- Node color uses category colors, not semantic danger/success.
- Edge type is shown by label and stroke style.
- Selected node uses accent border and subtle background.
- Heatmap uses single-hue intensity; do not use rainbow.
- Table data must support TSV copy and CSV export.
