# Roadmap

## Week 1: Data Skeleton

- ClassificationAxis を 24〜28 件定義する。
- ProblemClass を 15〜18 件定義する。
- Algorithm / Solver / ModelingPattern の初期データを置く。
- relation graph を 80 本以上にする。
- `npm run validate` で ID 参照と source policy を検査する。

Done in v0.1:

- `data/classification_axes.yml`: 26 axes
- `data/problem_classes.yml`: 16 classes
- `data/relations.yml`: 90 relations
- `scripts/validate-data.mjs`: schema-like validation

## Week 2: Diagnosis And Comparison

- 診断質問 8〜15 件を定義する。
- 代表ケース 20 件で expected top-3 を持つ。
- ProblemClass 比較ビューのテンプレートを決める。
- 「最適化で解くべきではない」ケースを含める。

Done in v0.1:

- `data/diagnosis_rules.yml`
- `data/example_cases.yml`
- `docs/diagnosis-flow.md`
- `docs/problem-class-comparison-template.md`

## Week 3: Static Explorer And Visualization

- YAML を読み込む static explorer を作る。
- 検索、axis filter、詳細、比較、relation 追跡を通す。
- MVP で作る view と後回し view を分ける。
- 表データをコピー / CSV export できるようにする。

Done in v0.1:

- `src/App.jsx`
- `src/data/loadData.js`
- `src/styles.css`

## Deferred

- solver 実行
- performance benchmark
- LLM 自動 taxonomy 生成
- 個別論文の網羅
- production backend
