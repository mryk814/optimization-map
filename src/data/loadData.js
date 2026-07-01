import yaml from "js-yaml";

import axesRaw from "../../data/classification_axes.yml?raw";
import algorithmsRaw from "../../data/algorithms.yml?raw";
import diagnosisRaw from "../../data/diagnosis_rules.yml?raw";
import examplesRaw from "../../data/example_cases.yml?raw";
import patternsRaw from "../../data/modeling_patterns.yml?raw";
import problemsRaw from "../../data/problem_classes.yml?raw";
import relationsRaw from "../../data/relations.yml?raw";
import solversRaw from "../../data/solvers.yml?raw";
import tracesRaw from "../../data/optimization_traces.yml?raw";
import solveStoriesRaw from "../../data/solve_stories.yml?raw";
import visualSupplementsRaw from "../../data/visual_supplements.yml?raw";

function parse(raw, key) {
  return yaml.load(raw)[key];
}

export const data = {
  axes: parse(axesRaw, "axes"),
  algorithms: parse(algorithmsRaw, "algorithms"),
  diagnosisQuestions: parse(diagnosisRaw, "questions"),
  exampleCases: parse(examplesRaw, "example_cases"),
  patterns: parse(patternsRaw, "patterns"),
  problemClasses: parse(problemsRaw, "problem_classes"),
  relations: parse(relationsRaw, "relations"),
  solvers: parse(solversRaw, "solvers"),
  optimizationTraces: parse(tracesRaw, "optimization_traces"),
  solveStories: parse(solveStoriesRaw, "solve_stories"),
  visualSupplements: parse(visualSupplementsRaw, "visual_supplements"),
};

export const maps = {
  axes: Object.fromEntries(data.axes.map((axis) => [axis.id, axis])),
  algorithms: Object.fromEntries(data.algorithms.map((algorithm) => [algorithm.id, algorithm])),
  cases: Object.fromEntries(data.exampleCases.map((example) => [example.id, example])),
  patterns: Object.fromEntries(data.patterns.map((pattern) => [pattern.id, pattern])),
  problems: Object.fromEntries(data.problemClasses.map((problem) => [problem.id, problem])),
  solvers: Object.fromEntries(data.solvers.map((solver) => [solver.id, solver])),
  traces: Object.fromEntries(data.optimizationTraces.map((trace) => [trace.id, trace])),
  solveStories: Object.fromEntries(data.solveStories.map((story) => [story.id, story])),
  visualSupplements: Object.fromEntries(data.visualSupplements.map((supplement) => [supplement.id, supplement])),
};

export function labelFor(id) {
  const node =
    maps.problems[id] ??
    maps.algorithms[id] ??
    maps.solvers[id] ??
    maps.patterns[id] ??
    maps.cases[id] ??
    maps.solveStories[id] ??
    maps.traces[id] ??
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
    stories: getStoriesForCase(caseId),
  };
}

export function getStoriesForCase(caseId) {
  return data.solveStories.filter((story) => story.case_id === caseId);
}

export function getStoriesForProblem(problemId) {
  return data.solveStories.filter(
    (story) => story.primary_problem_class === problemId || story.secondary_problem_classes?.includes(problemId),
  );
}

export function getStoriesForAlgorithm(algorithmId) {
  return data.solveStories.filter((story) => story.candidate_algorithms?.includes(algorithmId));
}

export function getStoryTrace(storyId) {
  const story = maps.solveStories[storyId];
  if (!story) {
    return null;
  }
  return maps.traces[story.visual_trace_id] ?? null;
}

export function getVisualSupplementForAlgorithm(algorithmId) {
  return data.visualSupplements.find((supplement) => supplement.target_type === "algorithm" && supplement.target_id === algorithmId) ?? null;
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
