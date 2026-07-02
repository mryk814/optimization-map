import yaml from "js-yaml";

import axesRaw from "../../data/classification_axes.yml?raw";
import algorithmsRaw from "../../data/algorithms.yml?raw";
import aiBriefsRaw from "../../data/ai_coding_briefs.yml?raw";
import diagnosisRaw from "../../data/diagnosis_rules.yml?raw";
import examplesRaw from "../../data/example_cases.yml?raw";
import learningPathsRaw from "../../data/learning_paths.yml?raw";
import modelingWizardRaw from "../../data/modeling_wizard.yml?raw";
import patternsRaw from "../../data/modeling_patterns.yml?raw";
import tracesRaw from "../../data/optimization_traces.yml?raw";
import problemsRaw from "../../data/problem_classes.yml?raw";
import relationsRaw from "../../data/relations.yml?raw";
import solversRaw from "../../data/solvers.yml?raw";
import solveStoriesRaw from "../../data/solve_stories.yml?raw";
import visualSupplementsRaw from "../../data/visual_supplements.yml?raw";

function parse(raw, key) {
  return yaml.load(raw)[key];
}

export const data = {
  axes: parse(axesRaw, "axes"),
  aiCodingBriefs: parse(aiBriefsRaw, "ai_coding_briefs"),
  algorithms: parse(algorithmsRaw, "algorithms"),
  diagnosisQuestions: parse(diagnosisRaw, "questions"),
  exampleCases: parse(examplesRaw, "example_cases"),
  learningPaths: parse(learningPathsRaw, "learning_paths"),
  modelingWizard: parse(modelingWizardRaw, "modeling_wizard"),
  optimizationTraces: parse(tracesRaw, "optimization_traces"),
  patterns: parse(patternsRaw, "patterns"),
  problemClasses: parse(problemsRaw, "problem_classes"),
  relations: parse(relationsRaw, "relations"),
  solvers: parse(solversRaw, "solvers"),
  solveStories: parse(solveStoriesRaw, "solve_stories"),
  visualSupplements: parse(visualSupplementsRaw, "visual_supplements"),
};

export const maps = {
  axes: Object.fromEntries(data.axes.map((axis) => [axis.id, axis])),
  aiCodingBriefs: Object.fromEntries(data.aiCodingBriefs.map((brief) => [brief.id, brief])),
  algorithms: Object.fromEntries(data.algorithms.map((algorithm) => [algorithm.id, algorithm])),
  cases: Object.fromEntries(data.exampleCases.map((example) => [example.id, example])),
  learningPaths: Object.fromEntries(data.learningPaths.map((path) => [path.id, path])),
  modelingWizard: Object.fromEntries(data.modelingWizard.map((step) => [step.id, step])),
  patterns: Object.fromEntries(data.patterns.map((pattern) => [pattern.id, pattern])),
  problems: Object.fromEntries(data.problemClasses.map((problem) => [problem.id, problem])),
  solvers: Object.fromEntries(data.solvers.map((solver) => [solver.id, solver])),
  solveStories: Object.fromEntries(data.solveStories.map((story) => [story.id, story])),
  traces: Object.fromEntries(data.optimizationTraces.map((trace) => [trace.id, trace])),
  visualSupplements: Object.fromEntries(data.visualSupplements.map((visual) => [visual.id, visual])),
};

export function labelFor(id) {
  const node =
    maps.problems[id] ??
    maps.algorithms[id] ??
    maps.solvers[id] ??
    maps.patterns[id] ??
    maps.cases[id] ??
    maps.solveStories[id] ??
    maps.learningPaths[id] ??
    maps.aiCodingBriefs[id] ??
    maps.visualSupplements[id] ??
    (id === "not_optimization" ? { title: "最適化の前に分析する" } : null);
  return node?.name_ja ?? node?.name ?? node?.title ?? id;
}

export const tableColumns = [
  { label: "ID", value: (item) => item.id },
  { label: "問題タイプ", value: (item) => item.name_ja },
  { label: "Summary", value: (item) => item.summary },
  { label: "Tags", value: (item) => item.tags.join(" / ") },
  { label: "Algorithms", value: (item) => item.candidate_algorithms.map(labelFor).join(" / ") },
  { label: "Solvers", value: (item) => item.candidate_solvers.map(labelFor).join(" / ") },
];

export const relationLabels = {
  is_a: "上位関係",
  overlaps_with: "重なる領域",
  confused_with: "混同注意",
  relaxes_to: "緩和",
  reformulates_to: "変換",
  commonly_solved_by: "手法",
  implemented_by: "実装",
  used_in: "用途",
};

export const relationTones = {
  confused_with: "blocked",
  relaxes_to: "review",
  reformulates_to: "review",
  commonly_solved_by: "active",
  implemented_by: "done",
  used_in: "done",
};

export function axisValueLabel(axisId, valueId) {
  if (!valueId) {
    return "-";
  }
  const axis = maps.axes[axisId];
  const value = axis?.values.find((item) => item.id === valueId);
  return value?.name_ja ?? valueId;
}

export function getRelated(problemId) {
  return data.relations.filter((relation) => relation.source === problemId || relation.target === problemId);
}

export function getProblemCases(problemId) {
  const usedInCaseIds = data.relations
    .filter((relation) => relation.type === "used_in" && relation.source === problemId)
    .map((relation) => relation.target);
  const expectedCaseIds = data.exampleCases
    .filter((example) => example.expected_top3.includes(problemId) || example.likely_traps?.includes(problemId))
    .map((example) => example.id);
  return [...new Set([...usedInCaseIds, ...expectedCaseIds])]
    .map((id) => maps.cases[id])
    .filter(Boolean);
}

export function getStoriesForProblem(problemId) {
  return data.solveStories.filter(
    (story) =>
      story.primary_problem_class === problemId ||
      (story.secondary_problem_classes ?? []).includes(problemId),
  );
}

export function getStoriesForCase(caseId) {
  return data.solveStories.filter((story) => story.case_id === caseId);
}

export function getVisualForAlgorithm(algorithmId) {
  return data.visualSupplements.find((visual) => visual.target_type === "algorithm" && visual.target_id === algorithmId);
}

export function getVisualsForProblem(problemId) {
  const direct = data.visualSupplements.filter((visual) => visual.target_type === "problem_class" && visual.target_id === problemId);
  const storyVisuals = getStoriesForProblem(problemId)
    .map((story) => maps.traces[story.visual_trace_id])
    .filter(Boolean);
  return { direct, storyVisuals };
}

export function getBriefForTarget(targetType, targetId) {
  return data.aiCodingBriefs.find((brief) => brief.target_type === targetType && brief.target_id === targetId);
}

export function getBriefMarkdown(brief) {
  if (!brief) {
    return "";
  }
  return [
    `# AI Coding Brief: ${brief.title}`,
    "",
    "## 決定変数",
    brief.decision_variables,
    "",
    "## 目的",
    brief.objective,
    "",
    "## 制約",
    brief.constraints,
    "",
    "## 推奨ライブラリ",
    (brief.recommended_libraries ?? []).map(labelFor).join(" / ") || "なし",
    "",
    "## 実装方針",
    ...(brief.implementation_plan ?? []).map((item) => `- ${item}`),
    "",
    "## 注意点",
    ...(brief.cautions ?? []).map((item) => `- ${item}`),
    "",
    "## 期待出力",
    brief.expected_output,
  ].join("\n");
}

export function getLearningStepHref(step) {
  if (step.type === "problem_class") {
    return `#/problems/${step.id}`;
  }
  if (step.type === "algorithm") {
    return `#/algorithms/${step.id}`;
  }
  if (step.type === "solve_story") {
    return `#/stories/${step.id}`;
  }
  if (step.type === "case") {
    return `#/cases/${step.id}`;
  }
  if (step.type === "brief") {
    return `#/briefs/${step.id}`;
  }
  if (step.type === "compare") {
    return `#/compare/${step.left}/${step.right}`;
  }
  return null;
}

function addScores(scores, values = {}, weight = 1) {
  for (const [id, value] of Object.entries(values)) {
    scores.set(id, (scores.get(id) ?? 0) + value * weight);
  }
}

function rankScores(scores, resolver) {
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score, item: resolver(id), label: labelFor(id) }))
    .filter((row) => row.item || row.id === "not_optimization")
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "ja"));
}

function collectRankedIds(ids, scores, resolver) {
  for (const id of ids ?? []) {
    scores.set(id, (scores.get(id) ?? 0) + 2);
  }
  return rankScores(scores, resolver).map((row) => row.item).filter(Boolean);
}

export function scoreModelingWizard(answers) {
  const classScores = new Map();
  const patternScores = new Map();
  const storyScores = new Map();
  const briefScores = new Map();
  const explicitNextQuestions = new Set();
  const answeredSteps = [];

  for (const step of data.modelingWizard) {
    const answerId = answers[step.id];
    const answer = step.answers.find((item) => item.id === answerId);
    if (!answer) {
      continue;
    }
    answeredSteps.push({ step, answer });
    addScores(classScores, answer.class_scores);
    addScores(patternScores, answer.pattern_scores);
    for (const storyId of answer.story_suggestions ?? []) {
      storyScores.set(storyId, (storyScores.get(storyId) ?? 0) + 2);
    }
    for (const briefId of answer.brief_suggestions ?? []) {
      briefScores.set(briefId, (briefScores.get(briefId) ?? 0) + 2);
    }
    for (const questionId of answer.next_questions ?? step.next_questions ?? []) {
      if (!answers[questionId]) {
        explicitNextQuestions.add(questionId);
      }
    }
  }

  const topProblems = rankScores(classScores, (id) => maps.problems[id]).slice(0, 5);
  const topPatterns = rankScores(patternScores, (id) => maps.patterns[id]).slice(0, 4);
  const topProblemIds = topProblems.map((row) => row.id);
  const fallbackStories = data.solveStories
    .filter((story) => topProblemIds.includes(story.primary_problem_class))
    .slice(0, 4)
    .map((story) => story.id);
  const storySuggestions = collectRankedIds(fallbackStories, storyScores, (id) => maps.solveStories[id]).slice(0, 4);

  for (const problemId of topProblemIds) {
    const brief = getBriefForTarget("problem_class", problemId);
    if (brief) {
      briefScores.set(brief.id, (briefScores.get(brief.id) ?? 0) + 1);
    }
  }
  for (const story of storySuggestions) {
    const brief = getBriefForTarget("solve_story", story.id);
    if (brief) {
      briefScores.set(brief.id, (briefScores.get(brief.id) ?? 0) + 1);
    }
  }

  const briefSuggestions = rankScores(briefScores, (id) => maps.aiCodingBriefs[id])
    .slice(0, 4)
    .map((row) => row.item)
    .filter(Boolean);
  const nextQuestions = [
    ...explicitNextQuestions,
    ...data.modelingWizard.filter((step) => !answers[step.id]).map((step) => step.id),
  ]
    .filter((id, index, list) => list.indexOf(id) === index)
    .slice(0, 2)
    .map((id) => maps.modelingWizard[id])
    .filter(Boolean);

  const needsFraming = topProblems[0]?.id === "not_optimization";

  return {
    answeredSteps,
    topProblems,
    topPatterns,
    storySuggestions,
    briefSuggestions,
    nextQuestions,
    framingSteps: needsFraming
      ? ["意思決定変数を1つの文にする", "最小化・最大化する指標と守る条件を分ける", "予測や分析だけで足りる部分を先に切り出す"]
      : [],
  };
}

export function getQualitySnapshot() {
  const problemStoryCounts = new Map();
  const problemVisualCounts = new Map();
  const algorithmVisualCounts = new Map();
  const problemBriefCounts = new Map();

  for (const story of data.solveStories) {
    const classIds = [story.primary_problem_class, ...(story.secondary_problem_classes ?? [])];
    for (const classId of classIds) {
      problemStoryCounts.set(classId, (problemStoryCounts.get(classId) ?? 0) + 1);
    }
    if (story.visual_trace_id) {
      problemVisualCounts.set(story.primary_problem_class, (problemVisualCounts.get(story.primary_problem_class) ?? 0) + 1);
    }
  }

  for (const visual of data.visualSupplements) {
    if (visual.target_type === "algorithm") {
      algorithmVisualCounts.set(visual.target_id, (algorithmVisualCounts.get(visual.target_id) ?? 0) + 1);
    }
    if (visual.target_type === "problem_class") {
      problemVisualCounts.set(visual.target_id, (problemVisualCounts.get(visual.target_id) ?? 0) + 1);
    }
  }

  for (const brief of data.aiCodingBriefs) {
    if (brief.target_type === "problem_class") {
      problemBriefCounts.set(brief.target_id, (problemBriefCounts.get(brief.target_id) ?? 0) + 1);
    }
  }

  const confused = data.relations.filter((relation) => relation.type === "confused_with");
  const guided = confused.filter((relation) => relation.shared && relation.decision_note);
  const missingRelationEndpoints = data.relations.filter((relation) => !labelFor(relation.source) || !labelFor(relation.target));

  return {
    totals: {
      problemClasses: data.problemClasses.length,
      algorithms: data.algorithms.length,
      solvers: data.solvers.length,
      relations: data.relations.length,
      exampleCases: data.exampleCases.length,
      solveStories: data.solveStories.length,
      visualSupplements: data.visualSupplements.length,
      optimizationTraces: data.optimizationTraces.length,
      aiCodingBriefs: data.aiCodingBriefs.length,
      learningPaths: data.learningPaths.length,
      modelingWizardSteps: data.modelingWizard.length,
    },
    problemRows: data.problemClasses.map((problem) => ({
      id: problem.id,
      name: problem.name_ja,
      sources: problem.sources.length,
      stories: problemStoryCounts.get(problem.id) ?? 0,
      visuals: problemVisualCounts.get(problem.id) ?? 0,
      briefs: problemBriefCounts.get(problem.id) ?? 0,
    })),
    algorithmRows: data.algorithms.map((algorithm) => ({
      id: algorithm.id,
      name: algorithm.name_ja,
      visuals: algorithmVisualCounts.get(algorithm.id) ?? 0,
      goodFor: algorithm.good_for?.length ?? 0,
    })),
    solverRows: data.solvers.map((solver) => ({
      id: solver.id,
      name: solver.name,
      supported: solver.supports?.length ?? 0,
    })),
    confusedWith: { guided: guided.length, total: confused.length },
    missingRelationEndpoints: missingRelationEndpoints.length,
  };
}

export function getCaseProblems(caseId) {
  const example = maps.cases[caseId];
  if (!example) {
    return [];
  }
  return example.expected_top3
    .map((id) => maps.problems[id])
    .filter(Boolean);
}

export function getComparisonGuidance(leftId, rightId) {
  const relation = data.relations.find(
    (item) =>
      item.type === "confused_with" &&
      ((item.source === leftId && item.target === rightId) || (item.source === rightId && item.target === leftId)),
  );
  if (!relation?.decision_note) {
    return null;
  }

  const reversed = relation.source !== leftId;
  return {
    shared: relation.shared,
    decisionAxes: relation.decision_axes ?? [],
    leftChoice: reversed ? relation.choose_target_when : relation.choose_source_when,
    rightChoice: reversed ? relation.choose_source_when : relation.choose_target_when,
    note: relation.decision_note,
  };
}

export function getDefaultComparison(problemId) {
  const problem = maps.problems[problemId] ?? data.problemClasses[0];
  const rightId = problem.confused_with?.find((id) => maps.problems[id]) ?? "convex_optimization";
  return { leftId: problem.id, rightId };
}

export function getPathForCase(caseId) {
  const example = maps.cases[caseId];
  if (!example) {
    return null;
  }
  const problems = getCaseProblems(caseId);
  const primary = problems[0];
  return {
    example,
    problems,
    primary,
    algorithms: primary?.candidate_algorithms.map((id) => maps.algorithms[id]).filter(Boolean) ?? [],
    solvers: primary?.candidate_solvers.map((id) => maps.solvers[id]).filter(Boolean) ?? [],
  };
}

export function filterProblems(query, axisFilter = "all") {
  const normalized = query.trim().toLowerCase();
  return data.problemClasses.filter((problem) => {
    const haystack = [problem.id, problem.name_ja, problem.name_en, problem.summary, ...problem.tags].join(" ").toLowerCase();
    const matchesQuery = normalized.length === 0 || haystack.includes(normalized);
    const matchesAxis =
      axisFilter === "all" ||
      Object.values(problem.axes ?? {}).includes(axisFilter) ||
      problem.tags.includes(axisFilter);
    return matchesQuery && matchesAxis;
  });
}

export function scoreDiagnosis(answers) {
  const scores = new Map();
  const reasons = new Map();
  const warnings = [];

  for (const question of data.diagnosisQuestions) {
    const answerId = answers[question.id];
    const answer = question.answers.find((item) => item.id === answerId);
    if (!answer) {
      continue;
    }
    if (answer.warning) {
      warnings.push(answer.warning);
    }
    for (const [classId, score] of Object.entries(answer.class_scores ?? {})) {
      scores.set(classId, (scores.get(classId) ?? 0) + score);
      const list = reasons.get(classId) ?? [];
      list.push(`${question.label}: ${answer.label}`);
      reasons.set(classId, list);
    }
  }

  return [...scores.entries()]
    .map(([id, score]) => ({
      id,
      score,
      problem: maps.problems[id],
      label: labelFor(id),
      reasons: reasons.get(id) ?? [],
      warnings,
    }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "ja"));
}

export function toTsv(rows, columns) {
  const header = columns.map((column) => column.label).join("\t");
  const body = rows
    .map((row) => columns.map((column) => String(column.value(row) ?? "").replace(/\s+/g, " ")).join("\t"))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename, rows, columns) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    columns.map((column) => escape(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => escape(column.value(row))).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
