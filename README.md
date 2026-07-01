# optimization-map

Optimization Map は、現実課題を **ProblemClass、モデリング方針、Algorithm、Solver** へつなげて探索するための静的な知識ベース / 教育アプリです。

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
npm run dev
npm run build
```

- `npm run validate`: YAML の件数、ID 参照、source policy、relation endpoint、診断ケース、比較判断軸を検査します。
- `npm run dev`: static explorer を `http://127.0.0.1:5173/` で起動します。
- `npm run build`: validation 後に production build を作ります。

ローカル開発では Vite の通常 base `/` を使います。GitHub Actions 上の Pages build では `/optimization-map/` base を使い、`main` への push 後に `dist/` を GitHub Pages へ公開します。

## Current MVP

- ClassificationAxis: 25 件
- ProblemClass: 20 件
- Algorithm: 20 件
- Solver: 19 件
- Relation: 90 本
- Diagnosis golden cases: 30 件

Static explorer では ProblemClass 検索、core axis filter、詳細カード、比較ビュー、relation tracing、モデリング診断、診断ベンチケース、TSV コピー、CSV export を扱えます。

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
- [Data Model](docs/data-model.md)
- [Diagnosis Flow](docs/diagnosis-flow.md)
- [ProblemClass Comparison Template](docs/problem-class-comparison-template.md)
- [Knowledge Graph](docs/knowledge-graph.md)
- [Visualization](docs/visualization.md)
- [Research Sources](docs/research-sources.md)

## Source Policy

正式データの source は、公式ドキュメント、大学講義、教科書、査読論文、公式 GitHub、主要 Solver 公式資料を優先します。Qiita / Zenn / 個人ブログは理解補助として読めますが、`data/*.yml` の根拠にはしません。

詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## Next Milestones

1. 診断 golden cases の自動スコア評価を追加する。
2. 比較ビューの判断軸を `confused_with` relation 全体へ広げる。
3. ProblemClass map と solver 対応表をより探索しやすくする。
4. source coverage と古典 / 最新資料の区別を継続的に更新する。
