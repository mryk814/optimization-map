const hintsByProblem = {
  linear_programming: {
    kind: "linear",
    label: "線形",
    cue: "直線境界と最良点",
  },
  quadratic_programming: {
    kind: "quadratic",
    label: "二次",
    cue: "楕円等高線と谷",
  },
  convex_optimization: {
    kind: "convex",
    label: "凸",
    cue: "ひとつの谷",
  },
  socp_sdp: {
    kind: "conic",
    label: "円錐",
    cue: "錐と半正定値の内側",
  },
  nonlinear_programming: {
    kind: "nonlinear",
    label: "非線形",
    cue: "曲がった制約",
  },
  nonconvex_optimization: {
    kind: "nonconvex",
    label: "非凸",
    cue: "複数の谷",
  },
  mixed_integer_linear_programming: {
    kind: "integer",
    label: "整数",
    cue: "格子点と枝刈り",
  },
  combinatorial_optimization: {
    kind: "combinatorial",
    label: "組合せ",
    cue: "候補を選ぶ",
  },
  constraint_programming_sat_smt: {
    kind: "logical",
    label: "論理",
    cue: "制約を満たす探索",
  },
  stochastic_programming: {
    kind: "stochastic",
    label: "確率",
    cue: "シナリオの束",
  },
  robust_optimization: {
    kind: "robust",
    label: "ロバスト",
    cue: "悪いケースを包む",
  },
  distributionally_robust_optimization: {
    kind: "dro",
    label: "DRO",
    cue: "分布の曖昧さ",
  },
  blackbox_derivative_free: {
    kind: "blackbox",
    label: "Black-box",
    cue: "点で試す",
  },
  bayesian_optimization_problem: {
    kind: "bayesian",
    label: "BO",
    cue: "不確実性で次点を選ぶ",
  },
  simulation_optimization: {
    kind: "simulation",
    label: "Simulation",
    cue: "入力と出力の反復",
  },
  optimal_control: {
    kind: "control",
    label: "Control",
    cue: "軌道を操る",
  },
  dynamic_programming_rl: {
    kind: "rl",
    label: "RL / DP",
    cue: "状態から方策へ",
  },
  online_optimization_bandits: {
    kind: "bandit",
    label: "Online",
    cue: "探索と活用",
  },
  differentiable_optimization: {
    kind: "differentiable",
    label: "微分可能",
    cue: "勾配が流れる",
  },
  hpo_automl: {
    kind: "hpo",
    label: "HPO",
    cue: "設定空間を探索",
  },
};

function fallbackKind(problem) {
  const axes = problem.axes ?? {};
  const tags = new Set(problem.tags ?? []);
  if (axes.blackboxness === "blackbox" || tags.has("blackbox")) return "blackbox";
  if (axes.convexity === "nonconvex" || tags.has("nonconvex")) return "nonconvex";
  if (axes.variable_domain === "integer" || axes.variable_domain === "binary") return "integer";
  if (axes.time_structure === "sequential" || axes.feedback === "online_feedback") return "rl";
  if (axes.uncertainty_representation === "scenarios") return "stochastic";
  if (axes.uncertainty_representation === "uncertainty_set") return "robust";
  if (axes.uncertainty_representation === "ambiguity_set") return "dro";
  if (axes.linearity === "linear") return "linear";
  if (axes.convexity === "convex") return "convex";
  return "nonlinear";
}

export function getVisualHint(problem) {
  return hintsByProblem[problem.id] ?? {
    kind: fallbackKind(problem),
    label: "構造",
    cue: "軸から推定",
  };
}
