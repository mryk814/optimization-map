# optimization-map

Optimization Map は、最適化を **「現実課題 → 問題クラス → モデリング方針 → アルゴリズム候補 → ソルバー候補」** として探索できる知識ベース / 教育アプリのためのリポジトリです。

この repo は、単なる用語集ではなく、最適化の広大な領域を **分類軸・関係グラフ・診断フロー・例題・ソルバー対応** として構造化することを目的にしています。

## 作るもの

最初に作るべきものは、アプリそのものよりも **Optimization Map as Data** です。

- 最適化問題クラスの構造化カタログ
- 分類軸のデータベース
- 問題クラス・アルゴリズム・ソルバー・ユースケースの関係グラフ
- 現実課題をモデル化するための診断フロー
- 似ている概念の比較表
- 教育アプリ / 検索 UI / 可視化 UI の設計資料

## この repo が答えたい問い

- 自分の課題は、どの最適化問題に近いのか？
- この問題に使えそうなアルゴリズムは何か？
- この問題を解けるソルバーやライブラリは何か？
- なぜこの問題は難しいのか？
- どの前提を置けば、より解きやすい問題になるのか？
- 線形化、凸化、緩和、近似、分解で何ができるのか？
- ブラックボックスなら何が変わるのか？
- 勾配が取れるなら何が嬉しいのか？
- 整数変数、不確実性、逐次意思決定が入ると何が変わるのか？
- いつ「これは最適化で解くべきではない」と判断するのか？

## 最初の MVP 範囲

最初は、広く深くではなく、横断検索に必要な骨格を作ります。

### 扱う

- LP / QP / SOCP / SDP
- Convex Optimization
- NLP / Non-convex Optimization
- IP / MILP / MINLP
- Combinatorial Optimization
- CSP / SAT / SMT / CP-SAT
- Stochastic Programming
- Robust Optimization
- Distributionally Robust Optimization
- Black-box / Derivative-free Optimization
- Bayesian Optimization
- Simulation Optimization
- Optimal Control / MPC
- Dynamic Programming / RL
- Online Optimization / Bandits
- Differentiable Optimization / Predict-then-Optimize
- HPO / AutoML

### 最初は深追いしない

- 個別ソルバーの性能ベンチマーク再現
- 独自ソルバー実装
- PDE 制約付き最適化の詳細離散化
- 均衡問題・変分不等式・補完性問題の詳細理論
- すべてのメタヒューリスティクスの網羅
- 産業別の詳細実装ノウハウ

## Repo 構成

```txt
optimization-map/
  README.md
  docs/
    product-brief.md
    roadmap.md
    research-sources.md
    data-model.md
    diagnosis-flow.md
    knowledge-graph.md
    visualization.md
  data/
    classification_axes.yml
    problem_classes.yml
    algorithms.yml
    solvers.yml
    relations.yml
    modeling_patterns.yml
    example_cases.yml
  schemas/
    problem_class.schema.json
  .github/
    ISSUE_TEMPLATE/
      task.md
```

## 方針

### 1. 問題クラスを階層だけでなくファセットで扱う

LP は Convex Optimization の一部ですが、MILP は線形でも整数性により一般に非凸です。Bayesian Optimization は Black-box Optimization と重なりますが同義ではありません。Optimization Map では、単一の分類ツリーではなく、複数の分類軸を組み合わせた知識グラフとして扱います。

### 2. 初学者の疑問をデータ構造に入れる

各 ProblemClass には、定義だけでなく `confused_with`, `why_hard`, `typical_when`, `not_good_when`, `relaxations_or_reformulations` を持たせます。

### 3. 診断ロジックをルールベースから始める

LLM は自然言語入力のタグ候補抽出には使えますが、最初の問題クラス診断は検証しやすいルールベースで始めます。

### 4. 一次情報を優先する

公式ドキュメント、大学講義、教科書、学術論文、公式 GitHub、主要ソルバー公式資料を優先します。Qiita / Zenn は情報源として使いません。

## 主要 docs

- [Product Brief](docs/product-brief.md)
- [Roadmap](docs/roadmap.md)
- [Research Sources](docs/research-sources.md)
- [Data Model](docs/data-model.md)
- [Diagnosis Flow](docs/diagnosis-flow.md)
- [Knowledge Graph](docs/knowledge-graph.md)
- [Visualization](docs/visualization.md)

## 最初の 3 週間

1. **Week 1:** taxonomy / data schema / initial dataset
2. **Week 2:** diagnosis flow / comparison logic / search prototype
3. **Week 3:** example cases / visualization / evaluation set

詳細は [Roadmap](docs/roadmap.md) を参照。
