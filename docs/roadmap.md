# Roadmap

## Week 1: Data Skeleton

- ClassificationAxis を 24〜28 件定義する。
- 問題タイプ（内部データ名: ProblemClass）を 15〜18 件定義する。
- Algorithm / Solver / ModelingPattern の初期データを置く。
- relation graph を 80 本以上にする。
- `npm run validate` で ID 参照と source policy を検査する。

Done in v0.1:

- `data/classification_axes.yml`: 25 axes
- `data/problem_classes.yml`: 20 classes
- `data/relations.yml`: 90 relations
- `scripts/validate-data.mjs`: schema-like validation

## Week 2: Diagnosis And Comparison

- 診断質問 8〜15 件を定義する。
- 代表ケース 30 件で expected top-3 を持つ。
- 問題タイプ比較ビューのテンプレートを決める。
- 「最適化で解くべきではない」ケースを含める。

Done in v0.1:

- `data/diagnosis_rules.yml`
- `data/example_cases.yml`
- `data/relations.yml` の priority `confused_with` 10 本すべてに判断軸を追加
- `docs/diagnosis-flow.md`
- `docs/problem-class-comparison-template.md`

## Week 3: Static Explorer And Visualization

- YAML を読み込む static explorer を作る。
- 検索、axis filter、詳細、比較、relation 追跡を通す。
- MVP で作る view と後回し view を分ける。
- 表データをコピー / CSV export できるようにする。

Done in v0.1:

- `src/App.jsx`
- `src/components/`
- `src/data/loadData.js`
- `src/views/`
- `src/styles.css`

Reading-site refresh:

- Hash routes: `#/`, `#/cases`, `#/cases/:id`, `#/problems/:id`, `#/diagnosis`, `#/compare/:left/:right`, `#/paths/:id`
- Home は長い一覧ではなく、ケース、診断、問題タイプ検索への入口にする。
- Map tab は relation count dashboard ではなく、課題を候補タイプ・手法・solver へ翻訳する解き方ビューに置き換える。

## v0.2: Visual Learning Layer

Done:

- `data/visual_supplements.yml`: 既存 Algorithm 20 件すべてに visual supplement
- `data/solve_stories.yml`: 66 stories
- `data/optimization_traces.yml`: 10 static traces
- `data/ai_coding_briefs.yml`: ProblemType / SolveStory / Algorithm visual / Solver / ModelingPattern / not_optimization brief
- `data/learning_paths.yml`: 6 audience-based paths
- `#/algorithms`, `#/algorithms/:id`: Algorithm Motion Gallery
- `#/stories`, `#/stories/:id`: SolveStory Library
- `#/learning`, `#/learning/:id`: LearningPath
- `#/graph`, `#/graph/:focus`: Knowledge Graph Explorer
- `#/quality`: Coverage Dashboard
- `#/wizard`: Interactive Modeling Wizard
- `npm run report`: Markdown/JSON data quality report

Lineup expansion:

- High priority ProblemClass added: Multi-objective Optimization, Network Flow / Graph Optimization, MINLP
- Medium priority Chance-constrained Optimization and Bilevel Optimization are represented as SolveStory/docs for now.
- Medium priority will become ProblemClass only when at least two cases, sources, relation guidance, and UI value are clear.

## v1.0: Optimization Atlas

North star:

- 現実課題を受け取り、決定変数・目的・制約・不確実性を整理する。
- Modeling Wizard で ProblemType top-3、ModelingPattern、SolveStory、AI Coding Brief 候補を返す。
- ProblemType / Algorithm / Solver / Case の関係を Knowledge Graph で探索できる。
- Algorithm Motion Gallery と SolveStory Library を、live solver 実行なしで教育導線として成立させる。
- AI Coding Brief を Markdown / JSON で持ち出せる。
- `npm run validate`, `npm run report`, `npm run build` を公開前の品質 gate にする。

See also: [v1 Optimization Atlas](./v1-optimization-atlas.md).

## Deferred

- solver 実行
- performance benchmark
- LLM 自動 taxonomy 生成
- 個別論文の網羅
- production backend
