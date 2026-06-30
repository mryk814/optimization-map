# Data Model

Optimization Map の正本は `data/*.yml` です。UI は YAML から読み込んだ投影であり、UI 固有のコピーを正本にしません。

## Entities

### ClassificationAxis

診断、検索、可視化の共通軸です。

- `core: true`: MVP 診断で使う 12〜15 軸
- `core: false`: 詳細比較や後続 UI で使う advanced 軸
- `values`: 診断回答や filter option に使う

### ProblemClass

検索、比較、診断結果の中心カードです。

- `definition`: 定義
- `canonical_form`: 代表的な数式形
- `typical_when`: 使うべき状況
- `not_good_when`: 避けるべき状況
- `why_hard`: 難しさの理由
- `candidate_algorithms` / `candidate_solvers`: 既存 ID 参照
- `confused_with`: 比較ビュー候補
- `sources`: 根拠

### Relation

知識グラフの edge です。

Allowed types:

- `is_a`
- `overlaps_with`
- `relaxes_to`
- `reformulates_to`
- `commonly_solved_by`
- `implemented_by`
- `confused_with`
- `used_in`

### ExampleCase

診断の評価セットです。`expected_top3` は一つの正解ではなく、候補に含めるべき問題クラスです。

## Validation

`npm run validate` は次を確認します。

- MVP 件数条件
- duplicate id
- relation endpoint
- algorithm / solver reference
- source completeness
- Qiita / Zenn exclusion
- `confused_with` relation count
- example case expected classes

## Persistence

ブラウザ UI は static data explorer です。正式データは YAML に置き、UI の選択状態や絞り込みだけを component state として扱います。
