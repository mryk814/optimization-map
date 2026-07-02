# Visual Spec Template

Visual demo / component を実装する前に、以下を埋める。

## Template

- `visual_id`:
- `target_type`: `problem_class` / `algorithm` / `solve_story`
- `target_id`:
- `learning_goal`:
- `user_story`:
- `visual_type`:
- `input_data_schema`:
- `state_fields`:
- `interaction`: autoplay / loop / slider / step buttons
- `labels`:
- `step_explanations`:
- `edge_cases`:
- `implementation_constraints`:
- `ai_coding_brief`:
- `acceptance_checks`:

## Example: LP Feasible Region

- `visual_id`: `visual_lp_feasible_region_demo`
- `target_type`: `solve_story`
- `target_id`: `story_lp_production_planning`
- `learning_goal`: 実行可能領域、目的関数の等値線、最適点がどのように対応するかを理解する。
- `user_story`: 初学者が、生産量を変数にした LP の解が制約の交点に出ることを見る。
- `visual_type`: `feasible_region_2d`
- `input_data_schema`: `constraints[]`, `feasible_polygon`, `objective_lines[]`, `states[]`
- `state_fields`: `step`, `x`, `y`, `objective`, `note`
- `interaction`: slider または step buttons。autoplay は 3〜5 秒 loop。
- `labels`: x軸=製品A、y軸=製品B、目的線、材料制約、設備制約、最適点。
- `step_explanations`: 原点、境界、目的線の移動、交点。
- `edge_cases`: 実行不能、非有界、同じ目的値を持つ辺。
- `implementation_constraints`: React + SVG。色・余白・角丸は design token を使う。live solver 実行はしない。
- `ai_coding_brief`: `data/ai_coding_briefs.yml` の LP brief を使う。
- `acceptance_checks`: route から到達できる、trace が再生できる、数値ラベルが溢れない、`npm run validate` と `npm run build` が通る。

## Example: Branch-and-Bound Tree

- `visual_id`: `visual_branch_and_bound_tree_demo`
- `target_type`: `algorithm`
- `target_id`: `branch_and_bound`
- `learning_goal`: bound と incumbent で枝を刈る意味を理解する。
- `user_story`: MILP が全列挙ではなく探索木を絞ることを見る。
- `visual_type`: `search_tree`
- `input_data_schema`: `nodes[]`, `edges[]`, `states[]`
- `state_fields`: `node_id`, `parent_id`, `bound`, `incumbent`, `status`, `branch_condition`
- `interaction`: autoplay loop または step buttons。
- `labels`: active, pruned by bound, incumbent, infeasible。
- `step_explanations`: root relaxation、branch、incumbent 更新、prune。
- `edge_cases`: incumbent なし、同値 bound、time limit。
- `implementation_constraints`: 30 node 以下の初期表示。大きい tree は filter を促す。
- `ai_coding_brief`: `brief_visual_branch_and_bound`
- `acceptance_checks`: node detail、edge explanation、TSV/JSON export、reduced motion 対応。
