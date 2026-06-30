# Roadmap

## 方針

最初からアプリを作り込みすぎず、まずは **構造化された知識ベース** を育てる。UI は知識構造を検証するための薄いプロトタイプから始める。

## Phase 0: Repository Foundation

目的: repo を育てられる状態にする。

- [ ] README を整える
- [ ] docs を作る
- [ ] data ディレクトリを作る
- [ ] issue template を作る
- [ ] 初期 issue を立てる
- [ ] 情報源ポリシーを明文化する

## Phase 1: Data Foundation

目的: Optimization Map の核となるデータを作る。

- [ ] ClassificationAxis を 24〜28 個定義
- [ ] ProblemClass を 15〜18 個定義
- [ ] Algorithm を 30〜40 個定義
- [ ] Solver / Library を 15〜20 個定義
- [ ] Relation を 80〜120 本定義
- [ ] ModelingPattern を 10〜20 個定義
- [ ] ExampleCase を 10〜20 個定義

### 最初に入れる ProblemClass

- Linear Programming
- Quadratic Programming
- Conic Optimization
- Semidefinite Programming
- Convex Optimization
- Nonlinear Programming
- Non-convex Optimization
- Integer / Mixed-Integer Programming
- Combinatorial Optimization
- Constraint Programming / SAT / SMT
- Stochastic Programming
- Robust Optimization
- Distributionally Robust Optimization
- Black-box / Derivative-free Optimization
- Bayesian Optimization
- Simulation Optimization
- Optimal Control / MPC
- Reinforcement Learning
- Online Optimization / Bandits
- Differentiable Optimization
- Hyperparameter Optimization / AutoML

## Phase 2: Diagnosis MVP

目的: 現実課題から候補問題クラスを返せるようにする。

- [ ] 診断質問を定義
- [ ] 回答値と ClassificationAxis を対応付け
- [ ] ProblemClass ごとの scoring rule を作る
- [ ] 診断結果カードの仕様を作る
- [ ] 代表ケース 20 件で手動評価する

### 診断結果カードに必要なもの

- likely_problem_classes
- why
- caveats
- candidate_algorithms
- candidate_solvers
- relaxations_or_reformulations
- next_learning_links

## Phase 3: Static UI Prototype

目的: data を読むだけの検索 / 比較 / 地図 UI を作る。

- [ ] ProblemClass 一覧
- [ ] 分類軸フィルター
- [ ] ProblemClass 詳細カード
- [ ] 2 クラス比較ビュー
- [ ] Relation graph ビュー
- [ ] Solver 対応表
- [ ] ExampleCase 一覧

## Phase 4: Educational Content

目的: 初学者が学べる導線を作る。

- [ ] 用語辞書
- [ ] よく混同する概念の比較記事
- [ ] 学習パス
- [ ] 代表例題の「課題 → 数式 → 解法 → 実装」ページ

### 優先比較記事

- LP vs Convex Optimization
- MILP vs CP-SAT
- Stochastic Programming vs Robust Optimization vs DRO
- Black-box Optimization vs Bayesian Optimization
- Optimal Control vs Reinforcement Learning
- Multi-objective Optimization vs Constrained Single-objective Optimization
- Nonlinear vs Non-convex Optimization

## Phase 5: LLM-Assisted Modeling

目的: 自然言語の課題説明からタグ候補を抽出する。

- [ ] 自然言語から変数・目的・制約候補を抽出
- [ ] 推定分類軸を提示
- [ ] ルールベース診断に渡す
- [ ] 失敗事例を eval に蓄積

LLM は最終判断者ではなく、入力整理の補助として使う。

## 最初の 3 週間

### Week 1: Knowledge Base Skeleton

- [ ] schema を決める
- [ ] ProblemClass 15〜18 件を作る
- [ ] ClassificationAxis 24〜28 件を作る
- [ ] Algorithm / Solver の初期データを作る
- [ ] Relation 80 本を作る
- [ ] docs/research-sources.md を整える

### Week 2: Diagnosis and Search

- [ ] 診断質問 12〜15 個を作る
- [ ] scoring rule v0 を作る
- [ ] 20 個の診断テストケースを作る
- [ ] CLI または簡易 Web UI で検索できるようにする
- [ ] ProblemClass 比較ビューを作る

### Week 3: Visualization and Examples

- [ ] 知識グラフ可視化を作る
- [ ] 難しさヒートマップを作る
- [ ] 代表例題 6 件を作る
- [ ] 初回ユーザーテストをする
- [ ] 誤診断・混同ポイントを issue に戻す

## 失敗しやすいポイント

- 分類軸を増やしすぎて入力が重くなる
- ProblemClass を相互排他的カテゴリとして扱ってしまう
- ソルバー推薦を断定しすぎる
- UI を先に作り込み、データ品質が追いつかない
- LLM に分類を任せすぎて検証不能になる
- 理論説明が深くなりすぎ、初学者の入口が消える
- 出典なしの説明が増え、知識ベースとして信頼性が落ちる

## 評価指標

- 診断ケースの top-3 hit rate
- 初学者が正しい比較軸を説明できるか
- 「なぜ難しいか」を理解できたか
- 推薦ソルバーが妥当か
- 例題から再利用可能な modeling pattern を抽出できるか
- 情報源が一次情報中心になっているか
