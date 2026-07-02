# optimization-map

Optimization Map は、現実課題を **問題タイプ、モデリング方針、Algorithm、Solver** へつなげて探索するための静的な知識ベース / 教育アプリです。

Demo: https://mryk814.github.io/optimization-map/

## What This Repo Answers

- 自分の課題は、どの最適化問題に近いのか？
- この問題に使えそうな Algorithm や Solver は何か？
- なぜこの問題は難しいのか？
- どの前提を置けば、より解きやすい問題になるのか？
- LP と Convex、MILP と CP-SAT、SP と RO/DRO のような近い概念をどう使い分けるのか？
- いつ「これは最適化で解く前に整理すべき」と判断するのか？

## Quick Start

```bash
npm install
npm run validate
npm run report
npm run dev
npm run build
```

- `npm run validate`: YAML の件数、ID 参照、source policy、relation endpoint、診断ケース、Visual/SolveStory/Trace/Brief/LearningPath、全 `confused_with` の比較判断軸を検査します。
- `npm run report`: coverage report を `docs/data-quality-report.md` と `docs/data-quality-report.json` へ出力します。
- `npm run dev`: static explorer を `http://127.0.0.1:5173/` で起動します。
- `npm run build`: validation 後に production build を作ります。

ローカル開発では Vite の通常 base `/` を使います。GitHub Actions 上の Pages build では `/optimization-map/` base を使い、`main` への push 後に `dist/` を GitHub Pages へ公開します。

## Current State

- ClassificationAxis: 25 件
- 問題タイプ（内部データ名: ProblemClass）: 23 件
- Algorithm: 20 件
- Solver: 19 件
- Relation: 116 本
- Guided confused_with: 13 / 13 本
- Diagnosis golden cases: 32 件
- expected_top3 coverage: ProblemClass 23 / 23 件
- VisualSupplement: 20 件
- SolveStory: 66 本
- OptimizationTrace: 10 件
- AI Coding Brief: 58 件
- LearningPath: 6 本
- ModelingWizard: 8 steps

Static explorer は hash route を持つ読解サイト型の構成です。ケース入口、問題タイプの記事、Modeling Wizard、モデリング診断、比較ビュー、Algorithm Motion Gallery、SolveStory Library、LearningPath、Knowledge Graph、Coverage Dashboard、TSV コピー、CSV export を扱えます。

## Repo Structure

```txt
optimization-map/
  data/                  # YAML source of truth
  docs/                  # product, data model, diagnosis, visualization notes
  schemas/               # JSON schema references for key entities
  scripts/               # validation and data lint checks
  src/                   # Vite + React static explorer
  design-standard/       # UI tokens and design guide
  .github/workflows/     # validate/build CI and GitHub Pages deploy
```

## Core Docs

- [Product Brief](docs/product-brief.md)
- [Roadmap](docs/roadmap.md)
- [v1 Optimization Atlas](docs/v1-optimization-atlas.md)
- [Data Model](docs/data-model.md)
- [Diagnosis Flow](docs/diagnosis-flow.md)
- [問題タイプ比較テンプレート](docs/problem-class-comparison-template.md)
- [Knowledge Graph](docs/knowledge-graph.md)
- [Visualization](docs/visualization.md)
- [Visual Spec Template](docs/visual-spec-template.md)
- [AI Coding Brief Template](docs/ai-coding-brief-template.md)
- [Live Execution Options](docs/live-execution-options.md)
- [Data Quality Report](docs/data-quality-report.md)
- [Research Sources](docs/research-sources.md)

## Source Policy

正式データの source は、公式ドキュメント、大学講義、教科書、査読論文、公式 GitHub、主要 Solver 公式資料を優先します。Qiita / Zenn / 個人ブログは理解補助として読めますが、`data/*.yml` の根拠にはしません。

詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## Next Milestones

1. Medium priority の Chance-constrained / Bilevel を ProblemClass 化するか、現状の story/docs 扱いを継続するかを決める。
2. Algorithm Motion Preview の trace を増やし、実装 brief から component 化できる粒度を上げる。
3. live execution は `docs/live-execution-options.md` の判断軸で v1.0 以降に分離して検討する。
