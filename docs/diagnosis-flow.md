# Diagnosis Flow v0

診断は「唯一の正解」を返すものではなく、課題から候補 ProblemClass へ進むための説明可能な scoring です。LLM なしで動くルールベース v0 から始めます。

## Input Loop

1. 意思決定変数があるかを確認する。
2. 変数領域、線形性、凸性、ブラックボックス性を確認する。
3. 不確実性と時間構造を確認する。
4. 評価コストとフィードバックを確認する。
5. top candidates、理由、注意点、次に読む ProblemClass を返す。

## Rule Data

`data/diagnosis_rules.yml` が scoring の正本です。

- `questions[].axis`: 対応する ClassificationAxis
- `answers[].class_scores`: 回答による ProblemClass score
- `answers[].warning`: 最適化以外の整理が先の場合の警告

## Result Card

診断結果は次を含めます。

- candidate ProblemClass
- score
- reasons: どの回答が効いたか
- candidate algorithms
- candidate solvers
- cautions: `not_good_when` と warning
- next questions: 未回答の診断質問
- next reads: `confused_with` と source

`not_optimization` が上位に出た場合は通常の ProblemClass として扱わず、最適化前に整理すべき論点を示す warning card として表示します。

## Evaluation Set

`data/example_cases.yml` は 30 件以上の代表ケースを持ちます。各ケースは `id`, `title`, `narrative`, `signals`, `expected_top3` を持ちます。`not_optimization` を含むケースは最低 3 件維持します。

v0 の合格ライン:

- 代表ケース 30 件以上を UI の診断ベンチケースで確認できる。
- 「最適化で解くべきではない」ケースを警告できる。
- 診断結果 top-5 が理由、注意点、candidate algorithms、candidate solvers、次に確認すべき質問を持つ。

## Improvement Backlog

- expected top-3 の自動評価 script を追加する。
- `signals` と diagnosis rules の対応を明示し、ケースベース regression にする。
- 制約違反リスク、安全性、説明責任を scoring に入れる。
- 問題クラスだけでなく modeling pattern も推薦する。
