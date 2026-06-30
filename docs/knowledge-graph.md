# Knowledge Graph

Optimization Map の graph は、分類ツリーではなく多軸 relation です。ProblemClass は複数の親や隣接概念を持ちます。

## Node Types

- ProblemClass
- Algorithm
- Solver
- ModelingPattern
- ExampleCase

## Edge Types

- `is_a`: 上位概念
- `overlaps_with`: 重なるが同義ではない
- `relaxes_to`: 難しい問題を緩和した先
- `reformulates_to`: モデル変換先
- `commonly_solved_by`: よく使うアルゴリズム
- `implemented_by`: solver / library
- `confused_with`: 比較ビューに出すべき近接概念
- `used_in`: 現実課題ケース

## MVP Graph Rules

- relation には必ず explanation を入れる。
- `confused_with` は最低 8 組を維持する。
- relation graph は 80 本以上を維持する。
- 可視化では edge type を色だけでなく label と線種で区別する。
