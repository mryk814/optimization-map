# Visualization

Optimization Map の UI は、単なる一覧ではなく「現在地」と「関係」を見せることを重視する。

## 1. Optimization Map View

### 目的

最適化全体の地図を俯瞰し、問題クラス同士の近さ・包含・重なりを見せる。

### ノード

- ProblemClass
- Algorithm
- Solver は最初は表示しないか、切替式にする

### エッジ

- is_a
- overlaps_with
- relaxes_to
- confused_with

### 色

- 連続最適化
- 離散 / 組合せ最適化
- 不確実性あり
- ブラックボックス / 実験系
- 動的 / 逐次意思決定
- ML / differentiable optimization

### フィルター

- convexity
- variable_domain
- blackboxness
- uncertainty
- time_structure
- exactness_requirement
- solver availability

## 2. Faceted Search View

### 目的

分類軸を選ぶことで、候補 ProblemClass を絞り込む。

### UI

```txt
[変数] continuous / integer / binary / mixed
[目的] linear / quadratic / nonlinear / black-box
[制約] none / equality / inequality / logic / chance / dynamic
[凸性] convex / nonconvex / unknown
[勾配] available / unavailable / expensive
[不確実性] none / distribution / uncertainty set / ambiguity set
[時間] static / sequential / online / feedback
```

### 出力

- 候補 ProblemClass
- 候補理由
- 近いが違う ProblemClass
- 推奨 next question

## 3. ProblemClass Detail Card

### 含める情報

- 定義
- canonical form
- typical when
- not good when
- why hard
- candidate algorithms
- candidate solvers
- relaxations / reformulations
- confused with
- examples
- sources

## 4. Comparison View

### 目的

似ているが異なる概念を横並びで比較する。

### 初期比較ペア

- LP vs Convex Optimization
- MILP vs CP-SAT
- Black-box Optimization vs Bayesian Optimization
- Stochastic Programming vs Robust Optimization vs DRO
- Optimal Control vs Reinforcement Learning
- NLP vs Non-convex Optimization
- Multi-objective vs Constrained Optimization

### 表示軸

- 決定変数
- 目的関数
- 制約
- 不確実性
- 時間性
- 入力情報
- 典型用途
- アルゴリズム
- ソルバー
- 注意点

## 5. Difficulty Heatmap

### 目的

「なぜ難しいのか」を分解して表示する。

### 軸

| Difficulty Factor | 例 |
|---|---|
| discreteness | 整数・順序・割当 |
| nonconvexity | 局所解・global optimum |
| uncertainty | シナリオ・分布・ロバスト性 |
| sequentiality | 時間・状態・policy |
| blackboxness | 評価のみ・高価・ノイズ |
| scale | 変数数・制約数・シナリオ数 |
| safety | 制約違反リスク |
| realtime | レイテンシ要求 |

## 6. Pipeline View

### 目的

現実課題から実装候補までの流れを見せる。

```txt
現実課題
  → ModelingPattern
  → ProblemClass
  → Algorithm
  → Solver / Library
  → Example Implementation
```

例:

```txt
配送ルート
  → routing pattern
  → VRP / MILP / CP-SAT
  → branch-and-bound / constraint propagation
  → OR-Tools / Gurobi / SCIP
```

## 7. Learning Roadmap

### 目的

初学者がどの順番で学ぶべきかを示す。

### 初期ロードマップ

```txt
Optimization Basics
  → LP
  → Convex Optimization
  → Duality
  → Integer Programming
  → Combinatorial Optimization
  → Uncertainty: SP / RO / DRO
  → Black-box / BO
  → Dynamic / Control / RL
```

## 8. Relation Explorer

### 目的

「この問題クラスから何に行けるか」を探索する。

### 例

MILP を選ぶと:

- relaxes_to: LP
- commonly_solved_by: branch-and-bound, cutting planes
- implemented_by: Gurobi, CPLEX, SCIP, HiGHS
- confused_with: CP-SAT, Combinatorial Optimization
- used_in: scheduling, facility location, supply chain

## MVP Priorities

1. Faceted Search View
2. ProblemClass Detail Card
3. Comparison View
4. Pipeline View
5. Simple Knowledge Graph View

高度な force-directed graph は後回しでよい。最初は、静的 JSON / YAML を読んでフィルターと比較ができれば十分。
