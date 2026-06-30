# Contribution Policy

Optimization Map の価値は、用語数ではなく「課題から問題クラスへ迷わず進めること」です。data 追加は必ず、診断・比較・関係グラフのどれに効くかを明確にしてから行います。

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

## ProblemClass Checklist

- [ ] `id`, `name_ja`, `name_en`, `summary`, `definition`, `canonical_form` がある。
- [ ] `tags` と主要 `axes` がある。
- [ ] `typical_when` と `not_good_when` が両方ある。
- [ ] `why_hard` が「難しい」で止まらず、理由を分解している。
- [ ] `candidate_algorithms` と `candidate_solvers` が既存 ID を参照している。
- [ ] `confused_with` が必要な比較先を持つ。
- [ ] source が最低1件、主要カードは2件以上ある。

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
