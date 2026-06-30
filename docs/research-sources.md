# Research Sources

この repo の source は、ProblemClass から直接参照できる粒度で管理します。根拠なしの説明文が増えると、診断と比較の信頼性が落ちるためです。

## Source Types

| type | 用途 |
|---|---|
| `official_docs` | solver / library の対応範囲、API、実装上の制約 |
| `official_github` | 実装・パッケージ・公式 example |
| `university_course` | 教育的定義、標準的な問題分類 |
| `textbook` | 古典的定義、理論背景 |
| `survey` | 分野の整理、比較、最近の位置づけ |
| `paper` | 特定手法や重要概念の根拠 |

## ProblemClass Source Map

- LP: MIT OCW, SciPy linprog
- QP: CVXPY, MOSEK Modeling Cookbook
- Convex Optimization: Boyd and Vandenberghe, Stanford EE364a
- SOCP / SDP: MOSEK Modeling Cookbook, CVXPY
- NLP: Ipopt, SciPy optimize
- MILP: Gurobi, SCIP
- CP / SAT / SMT: OR-Tools CP-SAT, Z3 Guide
- Stochastic Programming: Pyomo, Birge and Louveaux
- Robust Optimization: Bertsimas et al., Ben-Tal et al.
- DRO: Rahimian and Mehrotra, Esfahani and Kuhn
- Black-box / DFO: Nevergrad, SciPy optimize
- Bayesian Optimization: Bayesian Optimization book, BoTorch
- Optimal Control: MIT Underactuated Robotics, CasADi
- RL: Sutton and Barto, Stable-Baselines3
- HPO / AutoML: AutoML book, Optuna

## Review Notes

- Qiita / Zenn は source に含めません。
- 古典資料は古くても `trust: high` にできます。ただし実装 API の根拠には使いません。
- source を増やすだけの PR でも `npm run validate` を通します。
