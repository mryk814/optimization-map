# Data Model

Optimization Map は、用語集ではなく、検索・診断・比較・可視化に使える構造化データとして設計する。

## Entity Overview

| Entity | 役割 |
|---|---|
| ProblemClass | LP / MILP / BO / RL などの問題クラス |
| ClassificationAxis | 変数型、凸性、ブラックボックス性などの分類軸 |
| Algorithm | branch-and-bound, interior-point, BO などの手法 |
| Solver | Gurobi, CVXPY, OR-Tools, BoTorch などの実装候補 |
| ModelingPattern | 現実課題をモデルへ変換する型 |
| ExampleCase | 診断・教育用の具体例 |
| DomainUseCase | 産業・業務ドメイン上のユースケース |
| LearningPath | 学習順序 |
| Relation | ノード間の関係 |

## ProblemClass

```yaml
id: milp
name: Mixed-Integer Linear Programming
aliases:
  - MILP
  - MIP
definition: >
  線形目的関数と線形制約を持ち、一部または全部の変数が整数または二値に制約された最適化問題。
canonical_form:
  objective: linear
  constraints: linear
  variable_domain:
    - continuous
    - integer
    - binary
classification:
  convexity: nonconvex_due_to_integrality
  linearity: linear
  time_structure: static
  blackboxness: white_box
why_hard:
  - 整数変数により実行可能領域が離散化される
  - 組合せ爆発が起きる
candidate_algorithms:
  - branch_and_bound
  - cutting_planes
  - branch_and_cut
candidate_solvers:
  - gurobi
  - cplex
  - scip
  - ortools_cp_sat
confused_with:
  - constraint_programming
  - combinatorial_optimization
relaxations_or_reformulations:
  - lp_relaxation
  - lagrangian_relaxation
  - network_flow_reformulation
```

## ClassificationAxis

```yaml
id: convexity
name_ja: 凸性
name_en: Convexity
description: >
  目的関数と実行可能領域が凸構造を持つかどうか。
values:
  - convex
  - nonconvex
  - unknown
diagnosis_questions:
  - 目的関数は凸ですか？
  - 制約で定まる実行可能領域は凸ですか？
ui:
  widget: segmented_control
```

## Algorithm

```yaml
id: interior_point
name: Interior-point Method
family: continuous_convex_optimization
suitable_for:
  - lp
  - qp
  - socp
  - sdp
assumptions:
  - structured_constraints
  - differentiability_or_barrier_available
guarantees:
  - polynomial_time_for_many_convex_classes
caveats:
  - very_large_sparse_instances_may_need_specialized_methods
```

## Solver

```yaml
id: gurobi
name: Gurobi Optimizer
kind: commercial_solver
supported_problem_classes:
  - lp
  - qp
  - qcp
  - milp
  - miqp
  - miqcp
language_bindings:
  - Python
  - C
  - C++
  - Java
  - Julia
license: commercial_with_academic_options
strengths:
  - high_performance_mip
  - strong_industry_adoption
caveats:
  - commercial_license
```

## ModelingPattern

```yaml
id: assignment_problem
name: Assignment Pattern
natural_language_triggers:
  - どの人をどの仕事に割り当てるか
  - どのリソースをどの需要に対応させるか
candidate_problem_classes:
  - linear_programming
  - mixed_integer_linear_programming
  - network_flow
common_variables:
  - x[i,j] in {0,1}
common_constraints:
  - each_task_assigned_once
  - capacity_constraints
common_objectives:
  - minimize_cost
  - maximize_score
```

## ExampleCase

```yaml
id: delivery_route_small
name: 小規模配送ルート設計
narrative: >
  複数の配送先を、車両容量と時間窓を守りながら最小距離で回りたい。
decision_variables:
  - route_order
  - vehicle_assignment
objectives:
  - minimize_total_distance
constraints:
  - vehicle_capacity
  - time_windows
  - visit_each_customer_once
likely_problem_classes:
  - vehicle_routing_problem
  - mixed_integer_linear_programming
  - constraint_programming
candidate_solvers:
  - ortools_cp_sat
  - gurobi
  - scip
```

## Relation

```yaml
source: linear_programming
target: convex_optimization
relation_type: is_a
explanation: 線形目的関数と線形制約は凸構造を持つため、LP は凸最適化の一部である。
confidence: high
sources:
  - https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf
```

## Relation Types

| relation_type | 意味 |
|---|---|
| is_a | 包含関係 |
| overlaps_with | 交差・重なり |
| relaxes_to | 緩和すると到達する |
| reformulates_to | 等価または近似的に再定式化できる |
| commonly_solved_by | よく使われるアルゴリズム |
| implemented_by | 対応ソルバー / ライブラリ |
| used_in | 応用領域 |
| confused_with | 初学者が混同しやすい |
| compared_with | 比較対象 |
| prerequisite_for | 学習順序 |

## Design Notes

- `ProblemClass` は相互排他的にしない。
- `Solver` は性能保証ではなく「候補」として扱う。
- `Relation` には可能な限り `explanation` と `sources` を持たせる。
- 診断ロジックは `ClassificationAxis` と `ProblemClass.classification` の距離計算として実装する。
- LLM の出力は直接保存せず、review 済みの構造化データだけ main に入れる。
