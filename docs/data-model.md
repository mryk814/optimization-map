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

`confused_with` relation は比較ビューの判断軸としても使います。優先ペアでは次の任意フィールドを持ちます。

- `shared`: 同じところ
- `decision_axes`: 違いを見る観点
- `choose_source_when` / `choose_target_when`: どちらを選ぶか
- `decision_note`: 判断のまとめ

### ExampleCase

診断の評価セットです。`narrative` が現実課題の説明、`signals` が診断で拾いたい特徴、`expected_top3` が候補に含めるべき問題タイプです。`expected_top3` は一つの正解ではなく、妥当な候補集合です。

### VisualSupplement

Algorithm または ProblemClass に対し、「何をどう動かして見せるか」を定義します。UI component そのものではなく、AI に実装依頼できる visual spec の正本です。

- `target_type` / `target_id`: Algorithm または ProblemClass への参照
- `visual_type`: `descent_trace_2d`, `search_tree`, `trial_history` など
- `learning_goal`: その visual で理解させたいこと
- `what_moves`: 画面上で動く要素
- `what_user_should_notice`: 利用者が見るべき判断点
- `static_trace_ok`: 事前計算済み trace で成立するか
- `realtime_solve_required`: live solver 実行が必須か

### SolveStory

現実課題から解法までの教育 story です。`case_id` または `synthetic_case` を持ち、`primary_problem_class`, `candidate_algorithms`, `candidate_solvers`, `visual_trace_id`, `ai_coding_brief_id` へ接続します。

### OptimizationTrace

motion preview や story detail で使う事前計算済み状態列です。solver を browser 上で実行せずに再生できる形にします。

### AICodingBrief

ProblemClass、SolveStory、VisualSupplement、Solver、ModelingPattern を AI 実装指示へ持ち出すための正本です。Markdown copy と JSON export の両方で使います。

### LearningPath

audience 別の読解順です。step は `concept`, `case`, `problem_class`, `algorithm`, `solve_story`, `brief`, `compare` を参照できます。

### ModelingWizard

現実課題を ProblemType 候補へ翻訳する質問列です。各 step は `question`, `answers`, `axis_effects`, `class_scores`, `next_questions` を持ち、回答側で `pattern_scores`, `story_suggestions`, `brief_suggestions` へ接続します。

UI は `data/modeling_wizard.yml` を正本として読み、回答から次を返します。

- ProblemType top-3
- ModelingPattern 候補
- SolveStory 候補
- AI Coding Brief 候補
- `not_optimization` の場合の整理ステップ

## Validation

`npm run validate` は次を確認します。

- MVP 件数条件
- duplicate id
- relation endpoint
- algorithm / solver reference
- source completeness
- Qiita / Zenn exclusion
- `confused_with` relation count
- guided comparison fields for priority `confused_with` pairs
- example case required fields and expected classes
- `not_optimization` example case count
- v0.2 high-priority ProblemClass の存在と case 接続
- 全 Algorithm の VisualSupplement
- SolveStory 50本以上、trace 30本以上、AI brief 20本以上
- 全 ProblemClass の SolveStory coverage
- AI Coding Brief の target type と参照整合性
- LearningPath の audience と step 参照整合性
- ModelingWizard の step、axis、ProblemClass、ModelingPattern、SolveStory、AI Coding Brief 参照整合性

## Persistence

ブラウザ UI は static data explorer です。正式データは YAML に置き、UI の選択状態や絞り込みだけを component state として扱います。
