import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import yaml from "js-yaml";

const root = process.cwd();

function readYaml(relativePath) {
  return yaml.load(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function byId(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function countBy(items, getter) {
  const counts = new Map();
  for (const item of items) {
    for (const key of getter(item)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

function asRows(ids, counts) {
  return ids.map((id) => ({ id, count: counts.get(id) ?? 0 }));
}

function markdownTable(headers, rows) {
  const line = `| ${headers.join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${headers.map((header) => row[header] ?? "").join(" | ")} |`);
  return [line, rule, ...body].join("\n");
}

const axes = readYaml("data/classification_axes.yml").axes;
const problems = readYaml("data/problem_classes.yml").problem_classes;
const algorithms = readYaml("data/algorithms.yml").algorithms;
const solvers = readYaml("data/solvers.yml").solvers;
const patterns = readYaml("data/modeling_patterns.yml").patterns;
const relations = readYaml("data/relations.yml").relations;
const cases = readYaml("data/example_cases.yml").example_cases;
const visualSupplements = readYaml("data/visual_supplements.yml").visual_supplements;
const solveStories = readYaml("data/solve_stories.yml").solve_stories;
const traces = readYaml("data/optimization_traces.yml").optimization_traces;
const aiBriefs = readYaml("data/ai_coding_briefs.yml").ai_coding_briefs;
const learningPaths = readYaml("data/learning_paths.yml").learning_paths;
const modelingWizard = readYaml("data/modeling_wizard.yml").modeling_wizard;

const problemMap = byId(problems);
const algorithmMap = byId(algorithms);
const solverMap = byId(solvers);
const caseMap = byId(cases);

const graphIds = new Set([
  ...problems.map((item) => item.id),
  ...algorithms.map((item) => item.id),
  ...solvers.map((item) => item.id),
  ...patterns.map((item) => item.id),
  ...cases.map((item) => item.id),
  "not_optimization",
]);

const missingRelationEndpoints = relations.filter((relation) => !graphIds.has(relation.source) || !graphIds.has(relation.target));
const relationDegree = new Map();
for (const relation of relations) {
  relationDegree.set(relation.source, (relationDegree.get(relation.source) ?? 0) + 1);
  relationDegree.set(relation.target, (relationDegree.get(relation.target) ?? 0) + 1);
}

const storyByProblem = countBy(solveStories, (story) => [story.primary_problem_class, ...(story.secondary_problem_classes ?? [])]);
const visualByProblem = countBy(visualSupplements, (visual) => (visual.target_type === "problem_class" ? [visual.target_id] : []));
for (const story of solveStories) {
  if (story.visual_trace_id) {
    visualByProblem.set(story.primary_problem_class, (visualByProblem.get(story.primary_problem_class) ?? 0) + 1);
  }
}
const visualByAlgorithm = countBy(visualSupplements, (visual) => (visual.target_type === "algorithm" ? [visual.target_id] : []));
const solverSupport = countBy(solvers, (solver) => solver.supports ?? []);
const confusedRelations = relations.filter((relation) => relation.type === "confused_with");
const guidedConfusedRelations = confusedRelations.filter(
  (relation) => relation.shared && relation.choose_source_when && relation.choose_target_when && relation.decision_note,
);
const expectedTop3Coverage = new Set(cases.flatMap((example) => example.expected_top3 ?? []).filter((id) => problemMap[id]));
const aiBriefByProblem = countBy(aiBriefs, (brief) => (brief.target_type === "problem_class" ? [brief.target_id] : []));
const learningByProblem = countBy(learningPaths, (learningPath) =>
  learningPath.steps
    .filter((step) => step.type === "problem_class")
    .map((step) => step.id),
);

const orphanNodes = [...graphIds].filter((id) => id !== "not_optimization" && (relationDegree.get(id) ?? 0) === 0);
const problemRows = problems.map((problem) => ({
  ProblemType: problem.name_ja,
  Sources: problem.sources.length,
  SolveStories: storyByProblem.get(problem.id) ?? 0,
  Visuals: visualByProblem.get(problem.id) ?? 0,
  AIBriefs: aiBriefByProblem.get(problem.id) ?? 0,
  LearningPaths: learningByProblem.get(problem.id) ?? 0,
}));

const algorithmRows = algorithms.map((algorithm) => ({
  Algorithm: algorithm.name_ja ?? algorithm.id,
  Visuals: visualByAlgorithm.get(algorithm.id) ?? 0,
  GoodFor: (algorithm.good_for ?? []).length,
}));

const solverRows = solvers.map((solver) => ({
  Solver: solver.name,
  SupportedProblemTypes: solverSupport.get(solver.id) ?? solver.supports?.length ?? 0,
  DeclaredSupports: (solver.supports ?? []).length,
}));

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    axes: axes.length,
    problemTypes: problems.length,
    algorithms: algorithms.length,
    solvers: solvers.length,
    relations: relations.length,
    exampleCases: cases.length,
    solveStories: solveStories.length,
    visualSupplements: visualSupplements.length,
    optimizationTraces: traces.length,
    aiCodingBriefs: aiBriefs.length,
    learningPaths: learningPaths.length,
    modelingWizardSteps: modelingWizard.length,
  },
  coverage: {
    problemSourceCounts: asRows(problems.map((item) => item.id), new Map(problems.map((item) => [item.id, item.sources.length]))),
    problemSolveStoryCounts: asRows(problems.map((item) => item.id), storyByProblem),
    problemVisualCounts: asRows(problems.map((item) => item.id), visualByProblem),
    algorithmVisualCounts: asRows(algorithms.map((item) => item.id), visualByAlgorithm),
    solverSupportedProblemTypeCounts: solvers.map((solver) => ({ id: solver.id, count: solver.supports?.length ?? 0 })),
    confusedWithGuidance: {
      guided: guidedConfusedRelations.length,
      total: confusedRelations.length,
    },
    expectedTop3CoveredProblemTypes: expectedTop3Coverage.size,
    aiCodingBriefProblemTypes: [...aiBriefByProblem.values()].filter((count) => count > 0).length,
    learningPathProblemTypes: [...learningByProblem.values()].filter((count) => count > 0).length,
  },
  issues: {
    missingRelationEndpoints,
    orphanNodes,
    problemTypesWithoutSource: problems.filter((problem) => problem.sources.length === 0).map((problem) => problem.id),
    problemTypesWithoutSolveStory: problems.filter((problem) => (storyByProblem.get(problem.id) ?? 0) === 0).map((problem) => problem.id),
    algorithmsWithoutVisual: algorithms.filter((algorithm) => (visualByAlgorithm.get(algorithm.id) ?? 0) === 0).map((algorithm) => algorithm.id),
  },
};

const problemTable = markdownTable(
  ["ProblemType", "Sources", "SolveStories", "Visuals", "AIBriefs", "LearningPaths"],
  problemRows,
);
const algorithmTable = markdownTable(["Algorithm", "Visuals", "GoodFor"], algorithmRows);
const solverTable = markdownTable(["Solver", "SupportedProblemTypes", "DeclaredSupports"], solverRows);

const markdown = `# Data Quality Report

Generated: ${report.generatedAt}

## Totals

${markdownTable(
  ["Metric", "Count"],
  Object.entries(report.totals).map(([Metric, Count]) => ({ Metric, Count })),
)}

## Coverage

- guided confused_with: ${guidedConfusedRelations.length} / ${confusedRelations.length}
- expected_top3 problem coverage: ${expectedTop3Coverage.size} / ${problems.length}
- AI Coding Brief problem coverage: ${report.coverage.aiCodingBriefProblemTypes} / ${problems.length}
- LearningPath direct problem coverage: ${report.coverage.learningPathProblemTypes} / ${problems.length}
- missing relation endpoints: ${missingRelationEndpoints.length}
- orphan nodes: ${orphanNodes.length}

## ProblemType Coverage

${problemTable}

## Algorithm Visual Coverage

${algorithmTable}

## Solver Support Coverage

${solverTable}
`;

fs.writeFileSync(path.join(root, "docs/data-quality-report.md"), markdown, "utf8");
fs.writeFileSync(path.join(root, "docs/data-quality-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      status: "ok",
      markdown: "docs/data-quality-report.md",
      json: "docs/data-quality-report.json",
      totals: report.totals,
      missingRelationEndpoints: missingRelationEndpoints.length,
      orphanNodes: orphanNodes.length,
    },
    null,
    2,
  ),
);
