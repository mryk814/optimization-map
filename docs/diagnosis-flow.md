# Diagnosis Flow

このドキュメントは、「現実課題」から「候補となる最適化問題クラス」を返すための診断ロジックを整理する。

## 基本方針

診断は、単一の yes/no 決定木ではなく、複数の分類軸にスコアを付ける方式から始める。

```txt
user input
  → decision variables
  → objectives
  → constraints
  → uncertainty
  → time / feedback
  → information availability
  → solution requirements
  → ProblemClass scoring
```

## 診断質問 v0

| Step | 質問 | 目的 |
|---|---|---|
| 1 | 何を決めたいのか？ | 決定変数を特定する |
| 2 | 何を最大化 / 最小化したいのか？ | 目的関数を特定する |
| 3 | 必ず守るべき条件は何か？ | 制約を特定する |
| 4 | 変数は連続値か、整数か、二値か？ | LP / NLP / MILP / CP を分ける |
| 5 | 数式として評価関数を書けるか？ | white-box / black-box を分ける |
| 6 | 勾配や微分は使えるか？ | gradient-based / derivative-free を分ける |
| 7 | 評価は安いか高いか？ | BO / DFO / heuristic を分ける |
| 8 | 将来の不確実性はあるか？ | deterministic / SP / RO / DRO を分ける |
| 9 | 不確実性は分布で分かるか、範囲だけか？ | SP / RO / DRO を分ける |
| 10 | 一回だけ決めるか、逐次的に決めるか？ | static / online / control / RL を分ける |
| 11 | 状態遷移やフィードバックはあるか？ | optimal control / RL を分ける |
| 12 | 厳密解が必要か、十分良い解でよいか？ | exact / heuristic を分ける |
| 13 | 制約違反は危険か？ | robust / chance constraints / safety-aware methods を分ける |
| 14 | 解の説明責任は必要か？ | interpretable modeling を重視する |
| 15 | 何秒・何分で解く必要があるか？ | solver / approximation の選択に使う |

## Scoring Rule v0

各回答をタグに変換し、ProblemClass 側のタグと照合する。

```yaml
answers:
  variable_domain: [binary, integer]
  objective_form: linear_or_unknown
  constraints: [capacity, assignment, logical]
  blackboxness: white_box
  uncertainty: none
  time_structure: static
  exactness_requirement: high

scores:
  milp: 0.86
  constraint_programming: 0.72
  combinatorial_optimization: 0.69
  linear_programming: 0.41
```

## 診断結果カード

```yaml
likely_problem_classes:
  - id: milp
    score: 0.86
    reason:
      - integer_or_binary_variables
      - explicit_constraints
      - objective_likely_linear
candidate_algorithms:
  - branch_and_bound
  - cutting_planes
  - branch_and_cut
candidate_solvers:
  - gurobi
  - cplex
  - scip
  - ortools_cp_sat
caveats:
  - 整数変数が増えると計算時間が急増しやすい
relaxations_or_reformulations:
  - LP relaxation
  - Lagrangian relaxation
  - network flow reformulation if structure exists
next_questions:
  - 制約はすべて線形に書けますか？
  - 実行可能解が出れば十分ですか？
  - 何秒以内に解く必要がありますか？
```

## 問題クラス分岐の考え方

### LP / Convex / NLP

- 連続変数のみ
- 目的と制約が明示的
- 線形なら LP
- 凸なら Convex Optimization
- 一般非線形なら NLP
- 非凸なら local optimum / global optimization の注意を出す

### MILP / CP-SAT / Combinatorial

- 整数・二値・順序・割当・経路が出たら離散系へ
- 線形制約と目的が中心なら MILP
- 論理制約・充足・スケジューリング色が強ければ CP-SAT / CP
- グラフ構造が強ければ network flow / matching / TSP / VRP を候補にする

### SP / RO / DRO

- 不確実性があり、分布やシナリオがある → Stochastic Programming
- 分布は弱いが範囲や集合がある → Robust Optimization
- 分布そのものが不確実、サンプルから曖昧集合を作る → DRO

### Black-box / BO / Simulation Optimization

- 数式が書けず、評価だけできる → Black-box / DFO
- 評価が高価で逐次的に少数回だけ試す → Bayesian Optimization
- 評価がシミュレータで、ノイズや反復実験が中心 → Simulation Optimization

### Optimal Control / RL / Bandits

- 状態、入力、時間発展がある → Optimal Control / MPC
- 環境モデルが未知で試行錯誤から policy を学ぶ → RL
- 状態遷移が弱く、腕選択・実験割当・逐次探索が中心 → Bandits

## 「最適化で解くべきではない」警告

次の場合は、最適化問題として進める前に警告を出す。

- 制御可能な決定変数がない
- 目的が合意されていない
- 比較可能な評価尺度がない
- 制約や運用条件が曖昧すぎる
- データやシミュレーションが信頼できない
- 単純なルールで十分な可能性が高い
- 人間の意思決定・合意形成が本質で、数理モデル化が早すぎる
- 制約違反が危険なのに不確実性を無視している

## MVP で作る診断ケース

- 配送ルートを決めたい
- 工場の生産計画を作りたい
- 人員シフトを組みたい
- 広告予算を配分したい
- 少ない実験回数で材料条件を探したい
- ML のハイパーパラメータを調整したい
- 需要が不確実な在庫計画を立てたい
- 安全制約付きでロボットを制御したい
- 価格を最適化したい
- A/B テストの配分を逐次的に変えたい
- ポートフォリオを最適化したい
- グラフ上で最短経路 / 最大フローを解きたい
