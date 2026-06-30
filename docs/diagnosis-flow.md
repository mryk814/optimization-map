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
- cautions: `not_good_when` と warning
- next reads: `confused_with` と source

## Evaluation Set

`data/example_cases.yml` は 20 件の代表ケースを持ちます。各ケースは `expected_top3` を持ちます。

v0 の合格ライン:

- 代表ケース 10 件以上で expected top-3 のどれかが上位3件に入る。
- 「最適化で解くべきではない」ケースを警告できる。
- 診断結果が理由と注意点を持つ。

## Improvement Backlog

- expected top-3 の自動評価 script を追加する。
- `signals` と diagnosis rules の対応を明示し、ケースベース regression にする。
- 制約違反リスク、安全性、説明責任を scoring に入れる。
- 問題クラスだけでなく modeling pattern も推薦する。
