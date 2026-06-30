# Research Sources

このファイルは、Optimization Map の根拠資料を整理するための入口です。基本方針は、一次情報・大学講義・教科書・公式ドキュメント・公式 GitHub・学術論文を優先することです。

Qiita / Zenn は情報源として使いません。

## Source Policy

優先度:

1. 公式ドキュメント
2. 大学講義資料
3. 教科書・出版社ページ
4. 学術論文・サーベイ論文
5. arXiv / INFORMS / SIAM / IEEE / ACM / Springer / Cambridge / MIT Press など
6. 公式 GitHub リポジトリ
7. 主要ソルバー・モデリング言語の公式資料
8. 信頼できる企業・研究所の技術ブログ

## Core Textbooks and Courses

### Convex Optimization

- Boyd & Vandenberghe, Convex Optimization  
  https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf
- Stanford EE364a  
  https://ee364a.stanford.edu/
- Stanford Online Convex Optimization  
  https://online.stanford.edu/courses/soe-yeecvx101-convex-optimization

### Linear / Integer / Nonlinear Programming

- MIT 15.053 Optimization Methods in Management Science  
  https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/
- Goemans, Linear Programming notes  
  https://math.mit.edu/~goemans/18310S15/lpnotes310.pdf
- MIT integer programming lecture  
  https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/994cbaeb3ba44ca864de668cdf3c3dcc_MIT15_053S13_lec10.pdf
- Bertsekas, Nonlinear Programming slides  
  https://web.mit.edu/dimitrib/www/NLP_Slides_2005.pdf

### Optimal Control / Dynamic Programming / RL

- MIT Underactuated Robotics  
  https://underactuated.mit.edu/
- Dynamic Programming chapter  
  https://underactuated.mit.edu/dp.html
- Trajectory Optimization chapter  
  https://underactuated.mit.edu/trajopt.html
- Berkeley CS285 Deep Reinforcement Learning  
  https://rail.eecs.berkeley.edu/deeprlcourse/

### Online Optimization / Bandits

- Hazan, Introduction to Online Convex Optimization  
  https://arxiv.org/abs/1909.05207
- Lattimore & Szepesvári, Bandit Algorithms  
  https://tor-lattimore.com/downloads/book/book.pdf

## Problem-class Specific References

### Semidefinite Programming

- Vandenberghe & Boyd, Semidefinite Programming  
  https://web.stanford.edu/~boyd/papers/pdf/semidef_prog.pdf

### Stochastic Programming

- Birge & Louveaux, Introduction to Stochastic Programming  
  https://epubs.siam.org/doi/10.1137/1.9780898718751

### Robust Optimization

- Bertsimas, Brown, Caramanis, Theory and Applications of Robust Optimization  
  https://dspace.mit.edu/bitstream/handle/1721.1/66198/Bertsimas-2011-Theory%20and%20Applicati.pdf
- Ben-Tal, El Ghaoui, Nemirovski, Robust Optimization  
  https://www2.isye.gatech.edu/~nemirovs/FullBookDec11.pdf

### Distributionally Robust Optimization

- Rahimian & Mehrotra, Distributionally Robust Optimization: A Review  
  https://arxiv.org/abs/1908.05659
- Kuhn, Esfahani, Nguyen, Shafieezadeh-Abadeh, Wasserstein Distributionally Robust Optimization  
  https://www.cambridge.org/core/journals/acta-numerica/article/distributionally-robust-optimization/5B4E65E3A5A2AEF24E218A6B34E6EAA2

### Derivative-free / Black-box Optimization

- Conn, Scheinberg, Vicente, Introduction to Derivative-Free Optimization  
  https://epubs.siam.org/doi/abs/10.1137/1.9780898718768
- Larson, Menickelly, Wild, Derivative-free optimization methods  
  https://www.math.ucdavis.edu/~saito/data/ZerothOrderOptim/larson-etal_derivative-free-optimization-methods.pdf

### Bayesian Optimization

- Bayesian Optimization book  
  https://bayesoptbook.com/
- BoTorch documentation  
  https://botorch.org/docs/introduction

### Simulation Optimization

- INFORMS simulation optimization tutorial  
  https://pubsonline.informs.org/doi/10.1287/educ.2023.0264

### PDE-constrained Optimization / Calculus of Variations

- Hinze et al., Optimization with PDE Constraints  
  https://epubs.siam.org/doi/10.1137/1.9780898718935
- Allaire, PDE-constrained optimization course  
  https://www.cmap.polytechnique.fr/~allaire/PDE-constrained-optimization.html

### Bilevel Optimization

- Dempe & Zemkoho, Bilevel Optimization: Advances and Next Challenges  
  https://arxiv.org/abs/1705.06270
- Bilevel Optimization community site  
  https://bilevel-optimization.org/

### Differentiable Optimization / Predict-then-Optimize

- Agrawal et al., Differentiable Convex Optimization Layers  
  https://arxiv.org/abs/1910.12430
- CVXPYlayers  
  https://github.com/cvxpy/cvxpylayers
- PyEPO  
  https://github.com/khalil-research/PyEPO

### HPO / AutoML

- Optuna  
  https://optuna.org/
- auto-sklearn  
  https://automl.github.io/auto-sklearn/
- FLAML  
  https://microsoft.github.io/FLAML/

## Knowledge Hubs and Communities

- NEOS Server  
  https://neos-server.org/
- NEOS Solver Categories  
  https://neos-server.org/neos/solvers/
- Optimization Online  
  https://optimization-online.org/
- Optimization Online Categories  
  https://optimization-online.org/categories/
- Mittelmann Benchmarks  
  https://plato.asu.edu/bench.html
- INFORMS Optimization Society  
  https://connect.informs.org/optimizationsociety/home
- SIAM Activity Group on Optimization  
  https://www.siam.org/get-involved/connect-with-a-community/activity-groups/optimization/
- Mathematical Optimization Society  
  https://www.mathopt.org/

## Modeling Languages and Solvers

### Modeling Languages

- CVXPY  
  https://www.cvxpy.org/
- CVXPY examples  
  https://www.cvxpy.org/examples/
- JuMP  
  https://jump.dev/JuMP.jl/stable/
- MathOptInterface  
  https://jump.dev/MathOptInterface.jl/stable/
- Pyomo  
  https://www.pyomo.org/
- AMPL  
  https://ampl.com/
- AMPL book  
  https://ampl.com/resources/ampl-book/

### Solvers

- Gurobi Optimizer  
  https://docs.gurobi.com/projects/optimizer/en/current/index.html
- IBM ILOG CPLEX Optimization Studio  
  https://www.ibm.com/products/ilog-cplex-optimization-studio
- OR-Tools  
  https://developers.google.com/optimization
- OR-Tools CP-SAT  
  https://developers.google.com/optimization/cp/cp_solver
- SCIP  
  https://www.scipopt.org/
- HiGHS  
  https://highs.dev/
- MOSEK  
  https://www.mosek.com/documentation/
- Ipopt  
  https://coin-or.github.io/Ipopt/

### Black-box / BO / HPO Tools

- BoTorch  
  https://botorch.org/
- Ax  
  https://ax.dev/
- Nevergrad  
  https://facebookresearch.github.io/nevergrad/
- Optuna  
  https://optuna.org/

### Control / Engineering Design

- CasADi  
  https://web.casadi.org/
- OpenMDAO  
  https://openmdao.org/

## To Curate Later

- 代表的な各 ProblemClass の標準教科書
- 実務向けソルバー選定ガイド
- 主要ベンチマークセット
- 日本語で安全に参照できる大学講義資料
- 産業別の ModelingPattern 事例
- 各問題クラスの `confused_with` ペアに対する一次情報
