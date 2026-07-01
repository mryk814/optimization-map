# Problem Type Comparison Template

比較ビューは「似ているが違う概念」を選ぶための道具です。定義の横並びではなく、判断軸ごとに違いを見せます。

## Template

| 比較軸 | A | B | 判断の目安 |
|---|---|---|---|
| 決定変数 |  |  |  |
| 目的関数 |  |  |  |
| 制約 |  |  |  |
| 不確実性 |  |  |  |
| 時間構造 |  |  |  |
| 利用可能な情報 |  |  |  |
| 典型用途 |  |  |  |
| よく使う手法 |  |  |  |
| ソルバー / ライブラリ |  |  |  |
| 混同しやすいポイント |  |  |  |
| どちらを選ぶか |  |  |  |

## Priority Pairs

1. LP vs Convex Optimization
2. NLP vs Non-convex Optimization
3. MILP vs CP-SAT
4. Black-box Optimization vs Bayesian Optimization
5. Stochastic Programming vs Robust Optimization vs DRO
6. Optimal Control vs Reinforcement Learning
7. Online Optimization vs RL vs Bandits
8. Multi-objective Optimization vs Constrained Optimization

## Filled v0 Pairs

The explorer can compare any two problem type records. Priority `confused_with` relations carry the decision guidance used by the UI:

- `shared`: 同じところ
- `decision_axes`: 違うところを見る観点
- `choose_source_when`
- `choose_target_when`
- `decision_note`

The first five priority groups are covered by guided relations:

- `linear_programming` vs `convex_optimization`
- `nonlinear_programming` vs `nonconvex_optimization`
- `mixed_integer_linear_programming` vs `constraint_programming_sat_smt`
- `blackbox_derivative_free` vs `bayesian_optimization_problem`
- `stochastic_programming` vs `robust_optimization`
- `stochastic_programming` vs `distributionally_robust_optimization`
- `robust_optimization` vs `distributionally_robust_optimization`
