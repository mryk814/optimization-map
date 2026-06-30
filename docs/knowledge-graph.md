# Knowledge Graph

Optimization Map は、最適化分野を単一の分類ツリーではなく、複数種類のノードとエッジからなる知識グラフとして表現する。

## なぜ木構造では足りないか

- LP は Convex Optimization の一部だが、Linear Programming という独自領域でもある。
- SDP は Convex Optimization でも Conic Optimization でもあり、Combinatorial Optimization の relaxation としても使われる。
- Bayesian Optimization は Black-box Optimization の一部だが、すべての black-box optimization が BO ではない。
- RL は Optimal Control と近いが、通常は未知環境での policy learning を含む。
- MILP は線形だが、整数性により一般には非凸で難しい。

このため、`is_a` だけでなく、`overlaps_with`, `relaxes_to`, `confused_with`, `commonly_solved_by` などが必要になる。

## Node Types

| Node Type | 例 |
|---|---|
| ProblemClass | LP, MILP, BO, RL, Robust Optimization |
| ClassificationAxis | convexity, variable_domain, blackboxness |
| AxisValue | convex, nonconvex, integer, black_box |
| Algorithm | interior-point, branch-and-bound, ADMM |
| Solver | Gurobi, CVXPY, OR-Tools, BoTorch |
| ModelingPattern | assignment, routing, portfolio, experimental_design |
| ExampleCase | delivery_route_small, portfolio_risk_control |
| DomainUseCase | scheduling, supply_chain, pricing, A/B testing |
| Source | textbook, paper, docs, lecture |

## Edge Types

| Edge Type | Direction | 意味 |
|---|---|---|
| is_a | child → parent | 包含関係 |
| overlaps_with | A ↔ B | 交差するが同義ではない |
| relaxes_to | hard → easier | 緩和により到達する |
| reformulates_to | A → B | 再定式化できる |
| approximated_by | exact → approximate | 近似手法 |
| commonly_solved_by | ProblemClass → Algorithm | よく使う手法 |
| implemented_by | Algorithm/ProblemClass → Solver | 実装・ソルバー対応 |
| used_in | ProblemClass → DomainUseCase | 応用領域 |
| confused_with | A ↔ B | 初学者が混同しやすい |
| prerequisite_for | A → B | 学習順序 |
| supported_by_source | Node → Source | 根拠資料 |

## Initial Graph Example

```yaml
nodes:
  - id: linear_programming
    type: ProblemClass
  - id: convex_optimization
    type: ProblemClass
  - id: mixed_integer_linear_programming
    type: ProblemClass
  - id: combinatorial_optimization
    type: ProblemClass
  - id: black_box_optimization
    type: ProblemClass
  - id: bayesian_optimization
    type: ProblemClass
  - id: stochastic_programming
    type: ProblemClass
  - id: robust_optimization
    type: ProblemClass
  - id: distributionally_robust_optimization
    type: ProblemClass
  - id: optimal_control
    type: ProblemClass
  - id: reinforcement_learning
    type: ProblemClass

edges:
  - source: linear_programming
    target: convex_optimization
    relation_type: is_a
  - source: mixed_integer_linear_programming
    target: linear_programming
    relation_type: relaxes_to
  - source: mixed_integer_linear_programming
    target: combinatorial_optimization
    relation_type: overlaps_with
  - source: bayesian_optimization
    target: black_box_optimization
    relation_type: is_a
  - source: distributionally_robust_optimization
    target: stochastic_programming
    relation_type: overlaps_with
  - source: distributionally_robust_optimization
    target: robust_optimization
    relation_type: overlaps_with
  - source: reinforcement_learning
    target: optimal_control
    relation_type: overlaps_with
```

## Difficulty Profile

ProblemClass には、単一の `difficulty` ではなく、次のような難しさの分解を持たせる。

```yaml
hardness_profile:
  discreteness: high
  nonconvexity: medium
  uncertainty: low
  sequentiality: low
  blackboxness: low
  constraint_safety: medium
  scalability_risk: high
  real_time_pressure: low
```

これにより、「なぜ難しいのか」を UI で説明できる。

## Important Relation Patterns

### Relaxation

```txt
MILP → LP relaxation
Combinatorial Optimization → SDP relaxation
Nonconvex Optimization → Convex relaxation
Chance-constrained Optimization → Conservative deterministic approximation
```

### Reformulation

```txt
Assignment → Bipartite Matching / LP / MILP
Shortest Path → Network Flow / Dynamic Programming
Scheduling → MILP / CP-SAT
Portfolio Optimization → QP / SOCP / Robust Optimization
```

### Confusion Pairs

```txt
Black-box Optimization vs Bayesian Optimization
Stochastic Programming vs Robust Optimization vs DRO
Optimal Control vs Reinforcement Learning
MILP vs Constraint Programming
Linear Programming vs Convex Optimization
Nonlinear Programming vs Non-convex Optimization
Multi-objective Optimization vs Constrained Optimization
```

## Query Examples

### 自分の課題に近い問題を探す

```txt
variables: binary + assignment
constraints: capacity + logical
objective: minimize cost
→ MILP / CP-SAT / Network Flow
```

### どの前提を置けば易しくなるか

```txt
MILP
  relaxes_to: LP
  approximated_by: greedy / local search
  decomposed_by: Benders / Dantzig-Wolfe
```

### どのソルバーが候補か

```txt
MILP
  implemented_by: Gurobi, CPLEX, SCIP, HiGHS, OR-Tools
```

## MVP Graph Requirements

- ProblemClass nodes: 15〜18
- Algorithm nodes: 30〜40
- Solver nodes: 15〜20
- ModelingPattern nodes: 10〜20
- Relation edges: 80〜120
- Confusion pairs: 8〜12
- Source links: 各 ProblemClass に最低 1〜2 件
