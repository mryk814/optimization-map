# Visual Spec Template

Optimization Map の visual demo は、最初から live solver を実行しない。事前に用意した `OptimizationTrace` を読み、React / SVG などで再生する。

このテンプレートの目的は、AI に実装を依頼できる程度に、何を描き、何が動き、ユーザーに何を理解させるかを明確にすること。

## Template

```yaml
visual_id: visual_lp_feasible_region
target:
  type: problem_class | algorithm | case | solve_story
  id: linear_programming
visual_type: feasible_region_2d
learning_goal: 2変数LPで、制約が feasible region を作り、目的線が最適点を選ぶことを理解する。
user_story: >
  初学者が、変数・目的・制約・最適解の関係を2D図で見る。
input_data_schema:
  constraints:
    - id: string
      label: string
      coefficients: number[]
      relation: "<= | >= | =="
      rhs: number
  feasible_polygon: number[][]
  objective_lines:
    - step: number
      value: number
      points: number[][]
  states:
    - step: number
      point: number[]
      objective: number
      note: string
state_fields:
  - active step
  - current objective line
  - current point
  - note
interaction:
  - step slider
  - play / pause optional
  - hover constraint label optional
labels:
  x_axis: x_A
  y_axis: x_B
  objective: 利益
step_explanations:
  - 原点は実行可能だが利益はない。
  - 各端点を比較する。
  - 制約が交わる点が最適候補になる。
edge_cases:
  - feasible_polygon がない場合は table fallback を表示する
  - objective_lines が1本もない場合は点だけ表示する
implementation_constraints:
  - 既存 CSS token を使う
  - 独自色を増やさない
  - SVG の viewBox を固定し、responsive にする
ai_coding_brief: >
  React + SVG で feasible_region_2d component を実装してください。
  props は trace object です。feasible_polygon, constraints, objective_lines, states を読み、
  slider で step を切り替えて現在点と objective line を強調表示してください。
acceptance_checks:
  - すべての step で note が表示される
  - 現在点が feasible region 内に表示される
  - slider を動かすと objective line と点が変わる
  - mobile 幅でも図がはみ出さない
```

## AI Coding Brief Template

```md
# AI Coding Brief: <visual title>

## Goal
<ユーザーに理解させたいこと>

## Component
- Name: `<ComponentName>`
- Input: `<trace object>`
- Output: visual demo section

## Data shape
```ts
type Trace = {
  id: string;
  trace_type: string;
  states: Array<Record<string, unknown>>;
};
```

## Interaction
- step slider
- optional play/pause
- hover labels if simple

## Rendering rules
- Use React.
- Prefer SVG for geometry.
- Use existing CSS classes / tokens.
- Do not introduce new color palette.
- Do not execute solver in browser.

## Acceptance checks
- `npm run build` passes.
- Missing optional fields do not crash the UI.
- The user can understand what changes from step to step.
```

## Example 1: LP Feasible Region

```yaml
visual_id: visual_lp_production_feasible_region
target:
  type: solve_story
  id: lp_production_planning_story
visual_type: feasible_region_2d
learning_goal: LPでは制約が作る多角形の中から、目的関数を最も良くする点を選ぶことを理解する。
user_story: 生産計画で、製品A/Bの生産量をどう配分するかを見る。
input_data_schema:
  constraints: [material, labor, nonnegative]
  feasible_polygon: [[0,0], [4,0], [2.67,2.67], [0,4]]
  objective_lines: objective_lines[]
  states: states[]
interaction:
  - step slider
  - current step explanation
  - highlight optimum at final step
ai_coding_brief: >
  `lp_production_planning_trace` を読み、2D座標に feasible polygon、制約線、objective line、現在点を描画する。
  step sliderで objective line と point を更新し、最終stepでは optimum badge を表示する。
acceptance_checks:
  - feasible polygon が表示される
  - objective line がstepごとに移動する
  - optimum が明示される
```

## Example 2: Branch-and-Bound Tree

```yaml
visual_id: visual_milp_branch_bound_tree
target:
  type: solve_story
  id: milp_branch_bound_story
visual_type: search_tree
learning_goal: MILPで、緩和解・分枝・枝刈り・incumbent・gap がどう働くかを理解する。
user_story: 施設配置のようなbinary decisionで探索木が広がる様子を見る。
input_data_schema:
  states:
    - step: number
      active_node: string | null
      incumbent: number | null
      lower_bound: number
      upper_bound: number | null
      gap: number | null
      nodes:
        - id: string
          label: string
          bound: number
          status: active | open | branched | incumbent | pruned
      edges:
        - source: string
          target: string
interaction:
  - step slider
  - click node to show bound and prune reason
  - show incumbent / gap panel
ai_coding_brief: >
  `milp_branch_bound_trace` を読み、各stepのnodes/edgesを木として表示する。
  node status に応じて既存 badge tone を使い、active node、incumbent、pruned node を区別する。
  右側に incumbent, lower_bound, upper_bound, gap を表示する。
acceptance_checks:
  - step 0 では root のみ表示される
  - step が進むとnodeが増える
  - incumbent と gap が更新される
  - pruned node が区別できる
```

## Notes

- 実装をAIへ依頼するときは、`trace_type` ごとに component を分ける。
- 最初から全 visual_type を実装しない。
- `static_trace_ok: true` を前提に、solver 実行ではなく trace 再生で成立させる。
- 詳細な数学説明より、まず「何が動き、何を見ればよいか」を優先する。
