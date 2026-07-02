# Contribution Policy

Optimization Map の価値は、用語数ではなく「課題から問題クラスへ迷わず進めること」です。data 追加は必ず、診断・比較・関係グラフ・可視化・学習導線のどれに効くかを明確にしてから行います。

## Source Policy

- 一次情報を優先します。公式ドキュメント、大学講義、教科書、査読論文、公式 GitHub を優先します。
- Qiita / Zenn / 個人ブログは根拠として使いません。理解補助として読んでも、`data/*.yml` の source には入れません。
- 古典的資料と最新資料は分けて扱います。古典は基礎概念、最新資料は実装や最近の survey の根拠に使います。
- `source.trust` は `high` / `medium` / `low` の3段階です。MVP の正式データでは原則 `high` または `medium` だけを使います。

## Data Review Policy

PR では次を確認します。

- `npm run validate` が成功する。
- 新しい ID が重複していない。
- relation の `source` / `target` が実在する。
- ProblemClass は単独で読め、`typical_when` / `not_good_when` / `why_hard` が空でない。
- 似た概念がある場合は `confused_with` を追加する。
- 診断に効く分類軸なら `data/diagnosis_rules.yml` か docs の理由を更新する。
- 情報を増やす前に、診断・比較・可視化・学習導線・AI Coding Brief のどれに効くかを書く。
- 新規 data は一覧から詳細へ通常操作で到達できる。
- report 対象の coverage が落ちる場合は、意図と補完予定を書く。

## ProblemClass Checklist

- [ ] `id`, `name_ja`, `name_en`, `summary`, `definition`, `canonical_form` がある。
- [ ] `tags` と主要 `axes` がある。
- [ ] `typical_when` と `not_good_when` が両方ある。
- [ ] `why_hard` が「難しい」で止まらず、理由を分解している。
- [ ] `candidate_algorithms` と `candidate_solvers` が既存 ID を参照している。
- [ ] `confused_with` が必要な比較先を持つ。
- [ ] source が最低1件、主要カードは2件以上ある。
- [ ] 既存 ProblemClass で表現できない理由がある。
- [ ] 関連 ExampleCase が最低1件ある。新規 v0.2 クラスは最低2件。
- [ ] 関連 SolveStory または後回し理由がある。

## Algorithm Checklist

- [ ] 既存 ID と重複しない。
- [ ] `good_for` が既存 ProblemClass を参照している。
- [ ] tradeoff が「速い/遅い」で止まらず、使いどころを説明している。
- [ ] `data/visual_supplements.yml` に motion の説明がある。
- [ ] `what_moves` と `what_user_should_notice` が色なしでも読める。

## VisualSupplement Checklist

- [ ] `target_type`, `target_id`, `visual_type`, `learning_goal` がある。
- [ ] `what_moves` がある。
- [ ] `what_user_should_notice` がある。
- [ ] `static_trace_ok: true` と `realtime_solve_required: false` を明示する。
- [ ] `required_fields` と `pseudo_code` がある。
- [ ] `ai_coding_brief` が AI に実装依頼できる粒度になっている。

## SolveStory Checklist

- [ ] `case_id` または `synthetic_case` がある。
- [ ] `primary_problem_class` が既存 ProblemClass を参照している。
- [ ] `decision_variables`, `objective`, `constraints` がある。
- [ ] `candidate_algorithms`, `candidate_solvers` が既存 ID を参照している。
- [ ] `visual_trace_id` がある場合、trace が browser 上で solver 実行なしに再生できる。
- [ ] AI 実装へ渡す場合は `ai_coding_brief_id` がある。

## Source Review Checklist

- [ ] 公式ドキュメント、大学講義、教科書、査読論文、公式 GitHub を優先している。
- [ ] Qiita / Zenn / 個人ブログを正式 source にしていない。
- [ ] source の type と trust がある。
- [ ] 新しい source が何を支えているか、ProblemClass / SolveStory / VisualSupplement のいずれかで分かる。

## Relation Checklist

- [ ] `id` は `rNNN` 形式で重複しない。
- [ ] `type` は schema にある enum だけを使う。
- [ ] `source` と `target` は data 内に存在する。
- [ ] `explanation` は relation の意味を一文で説明する。
- [ ] `confused_with` は比較ビューで使える粒度になっている。

## Local Validation

```bash
npm install
npm run validate
npm run build
```

`npm run validate` は data の形、ID 参照、source policy、MVP の件数条件をまとめて検査します。

`npm run report` は `docs/data-quality-report.md` と `docs/data-quality-report.json` を更新します。coverage dashboard に関わる変更では、report の差分も確認してください。
