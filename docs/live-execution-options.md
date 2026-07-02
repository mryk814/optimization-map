# Live Execution Options

v1.0 では live solver execution を必須にしない。Optimization Map の主目的は、まず「どの問題として読むか」「どの手法がどう動くか」を理解することだからです。

## Options

| Option | Benefits | Constraints | Fit |
|---|---|---|---|
| Static trace | 軽い、速い、安全、GitHub Pages で動く | 事前に trace を作る必要がある | v0.2/v1.0 の既定 |
| Pyodide / browser Python | ブラウザ完結で Python demo が動く | bundle size、load time、package 制約が重い | 小型 LP/QP toy のみ検討 |
| WebAssembly solver | UI から実行できる | solver 選定、build、license、debug が重い | 明確な教材価値がある場合 |
| Server-side Python execution | SciPy/CVXPY/Pyomo を使いやすい | backend、sandbox、secret、費用、運用が必要 | 個人 app 化後に検討 |
| Precomputed trace pipeline | 実行は外で行い、UI は再生に集中できる | pipeline と data review が必要 | 今後の推奨拡張 |
| Notebook export | 実験・検証に強い | UI 体験とは別成果物になる | advanced user 向け |
| Cloud execution | 重い solver も扱える | 認証、課金、商用 solver license、sandbox が必要 | 現時点では対象外 |

## Decision Rules

- Static trace で理解目標が満たせるなら live execution は入れない。
- live execution が必要なのは、入力を変えた結果が学習上どうしても必要な場合だけ。
- API key、secret、商用 solver license を browser に置かない。
- backend execution を採用する前に、保存場所、queue、timeout、sandbox、error recovery、cost を設計する。
- v1.0 では live execution は必須機能にしない。

## Current Decision

Current app uses static YAML traces:

- `data/optimization_traces.yml`
- `data/solve_stories.yml`
- `data/visual_supplements.yml`

This keeps GitHub Pages deployment simple and makes validation deterministic. Live execution is deferred until a concrete story proves that static trace replay cannot teach the concept.
