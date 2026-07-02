# v1 Optimization Atlas

Optimization Map v1.0 は、用語集ではなく **課題をモデル化し、候補を比較し、小さく見て、AI に実装依頼できる知識へ渡す地図** として扱う。

## Core Loop

```text
現実課題
  -> 決定変数・目的・制約を整理
  -> ProblemType top-3 を得る
  -> 近い概念を比較する
  -> 小さな SolveStory / OptimizationTrace で動きを見る
  -> Algorithm / Solver / Library 候補を見る
  -> AI Coding Brief をコピーまたは JSON で持ち出す
```

## Product Pillars

- 課題ベース入口: ケースと Modeling Wizard から入る。
- ProblemType Atlas: 定義、使いどころ、避けどころ、難しさ、候補手法を読む。
- Algorithm Visual Gallery: すべての Algorithm に「何が動くか」を持たせる。
- SolveStory Library: 課題、変数、目的、制約、手法、trace、解釈を一つの story にする。
- Knowledge Graph Explorer: ProblemType、Algorithm、Solver、Case の近傍をモード別に見る。
- Learning Paths: 初学者、実務家、ML エンジニア、研究者寄りの順路を持つ。
- AI Coding Brief Export: ProblemType、SolveStory、Visual、Solver、Pattern を実装指示へ変換する。
- Data Quality Dashboard: source、story、visual、brief、relation の coverage を検査する。

## Success Checks

- 初学者が 3 分以内に、自分の課題に近い ProblemType 候補へ到達できる。
- `#/wizard` で 5 分以内に 1 ケースを整理できる。
- すべての既存 ProblemType が source、SolveStory、Algorithm、Solver の導線を持つ。
- すべての既存 Algorithm が visual supplement を持つ。
- 代表 demo は live solver 実行なしで説明できる。
- AI Coding Brief は Markdown と JSON で持ち出せる。
- `npm run validate`, `npm run report`, `npm run build` が公開前の品質 gate として機能する。

## Non Goals

- 商用 solver を browser で実行する。
- Pyodide / backend solver を v1.0 の必須機能にする。
- 全問題クラスや論文を網羅する。
- LLM 任せで taxonomy を自動生成する。
- performance benchmark を本格運用する。
