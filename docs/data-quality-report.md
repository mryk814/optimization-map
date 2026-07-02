# Data Quality Report

Generated: 2026-07-02T04:35:25.606Z

## Totals

| Metric | Count |
| --- | --- |
| axes | 25 |
| problemTypes | 23 |
| algorithms | 20 |
| solvers | 19 |
| relations | 116 |
| exampleCases | 32 |
| solveStories | 66 |
| visualSupplements | 20 |
| optimizationTraces | 10 |
| aiCodingBriefs | 58 |
| learningPaths | 6 |
| modelingWizardSteps | 8 |

## Coverage

- guided confused_with: 13 / 13
- expected_top3 problem coverage: 23 / 23
- AI Coding Brief problem coverage: 10 / 23
- LearningPath direct problem coverage: 11 / 23
- missing relation endpoints: 0
- orphan nodes: 35

## ProblemType Coverage

| ProblemType | Sources | SolveStories | Visuals | AIBriefs | LearningPaths |
| --- | --- | --- | --- | --- | --- |
| 線形計画 | 2 | 17 | 4 | 1 | 2 |
| 二次計画 | 2 | 5 | 1 | 1 | 0 |
| 凸最適化 | 2 | 12 | 3 | 1 | 2 |
| 円錐最適化 / 半正定値計画 | 2 | 4 | 2 | 0 | 1 |
| 非線形計画 | 2 | 7 | 3 | 0 | 0 |
| 非凸最適化 | 2 | 6 | 3 | 0 | 0 |
| 混合整数線形計画 | 2 | 21 | 6 | 1 | 1 |
| 組合せ最適化 | 2 | 16 | 6 | 0 | 0 |
| CP / SAT / SMT | 2 | 5 | 3 | 1 | 1 |
| 確率計画 | 2 | 14 | 6 | 1 | 1 |
| ロバスト最適化 | 2 | 8 | 4 | 1 | 0 |
| 分布ロバスト最適化 | 2 | 4 | 2 | 0 | 1 |
| ブラックボックス / 微分不要最適化 | 2 | 5 | 1 | 0 | 0 |
| Bayesian Optimization | 2 | 7 | 3 | 1 | 3 |
| シミュレーション最適化 | 2 | 3 | 2 | 0 | 0 |
| 最適制御 / MPC | 2 | 4 | 1 | 1 | 0 |
| 動的計画 / 強化学習 | 2 | 6 | 2 | 0 | 0 |
| オンライン最適化 / Bandits | 2 | 8 | 4 | 1 | 1 |
| 微分可能最適化 / Predict-then-Optimize | 2 | 3 | 2 | 0 | 1 |
| HPO / AutoML | 2 | 4 | 1 | 0 | 1 |
| 多目的最適化 | 2 | 1 | 1 | 0 | 0 |
| Network Flow / Graph Optimization | 2 | 1 | 1 | 0 | 0 |
| 混合整数非線形計画 / MINLP | 2 | 1 | 1 | 0 | 0 |

## Algorithm Visual Coverage

| Algorithm | Visuals | GoodFor |
| --- | --- | --- |
| 単体法 | 1 | 1 |
| 内点法 | 1 | 3 |
| Branch-and-Bound | 1 | 2 |
| Cutting Planes | 1 | 1 |
| Branch-and-Cut | 1 | 1 |
| 動的計画法 | 1 | 2 |
| 制約伝播 | 1 | 1 |
| 局所非線形最適化 | 1 | 2 |
| SQP | 1 | 2 |
| 円錐ソルバー | 1 | 2 |
| Benders 分解 | 1 | 2 |
| 列生成 | 1 | 2 |
| Robust Counterpart | 1 | 1 |
| Sample Average Approximation | 1 | 2 |
| Bayesian Optimization | 1 | 2 |
| 進化的探索 | 1 | 2 |
| Model Predictive Control | 1 | 1 |
| Policy Gradient | 1 | 1 |
| UCB / Bandit | 1 | 1 |
| Differentiable Optimization Layer | 1 | 1 |

## Solver Support Coverage

| Solver | SupportedProblemTypes | DeclaredSupports |
| --- | --- | --- |
| SciPy linprog | 1 | 1 |
| SciPy optimize | 2 | 2 |
| CVXPY | 3 | 3 |
| Gurobi | 3 | 3 |
| IBM CPLEX | 3 | 3 |
| SCIP | 3 | 3 |
| HiGHS | 2 | 2 |
| OR-Tools | 3 | 3 |
| Z3 | 1 | 1 |
| Pyomo | 3 | 3 |
| Ipopt | 2 | 2 |
| CasADi | 2 | 2 |
| MOSEK | 2 | 2 |
| SDPA | 1 | 1 |
| BoTorch | 2 | 2 |
| Optuna | 2 | 2 |
| Nevergrad | 1 | 1 |
| Stable-Baselines3 | 1 | 1 |
| JAXopt | 2 | 2 |
