import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import yaml from "js-yaml";

const root = process.cwd();
const requiredProblemFields = [
  "id",
  "name_ja",
  "name_en",
  "summary",
  "definition",
  "canonical_form",
  "tags",
  "typical_when",
  "not_good_when",
  "why_hard",
  "candidate_algorithms",
  "candidate_solvers",
  "confused_with",
  "relaxations_or_reformulations",
  "sources",
];

const relationTypes = new Set([
  "is_a",
  "overlaps_with",
  "relaxes_to",
  "reformulates_to",
  "commonly_solved_by",
  "implemented_by",
  "confused_with",
  "used_in",
]);

const visualTargetTypes = new Set(["problem_class", "algorithm", "solver", "case", "modeling_pattern"]);

function readYaml(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return yaml.load(fs.readFileSync(absolutePath, "utf8"));
}

function fail(message) {
  throw new Error(message);
}

function assertArray(value, label, minItems = 1) {
  if (!Array.isArray(value) || value.length < minItems) {
    fail(`${label} must have at least ${minItems} item(s)`);
  }
}

function uniqueById(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id || typeof item.id !== "string") {
      fail(`${label} item is missing id`);
    }
    if (seen.has(item.id)) {
      fail(`${label} has duplicate id: ${item.id}`);
    }
    seen.add(item.id);
  }
  return seen;
}

const axes = readYaml("data/classification_axes.yml").axes;
const problems = readYaml("data/problem_classes.yml").problem_classes;
const algorithms = readYaml("data/algorithms.yml").algorithms;
const solvers = readYaml("data/solvers.yml").solvers;
const patterns = readYaml("data/modeling_patterns.yml").patterns;
const relations = readYaml("data/relations.yml").relations;
const cases = readYaml("data/example_cases.yml").example_cases;
const diagnosis = readYaml("data/diagnosis_rules.yml").questions;
const visualSupplements = readYaml("data/visual_supplements.yml").visual_supplements;
const solveStories = readYaml("data/solve_stories.yml").solve_stories;
const optimizationTraces = readYaml("data/optimization_traces.yml").optimization_traces;

assertArray(axes, "classification axes", 24);
assertArray(problems, "problem classes", 15);
assertArray(algorithms, "algorithms", 15);
assertArray(solvers, "solvers", 15);
assertArray(relations, "relations", 80);
assertArray(cases, "example cases", 30);
assertArray(diagnosis, "diagnosis questions", 8);
assertArray(visualSupplements, "visual supplements", algorithms.length);
assertArray(solveStories, "solve stories", 4);
assertArray(optimizationTraces, "optimization traces", 4);

const axisIds = uniqueById(axes, "classification axes");
const problemIds = uniqueById(problems, "problem classes");
const algorithmIds = uniqueById(algorithms, "algorithms");
const solverIds = uniqueById(solvers, "solvers");
const patternIds = uniqueById(patterns, "patterns");
const relationIds = uniqueById(relations, "relations");
const caseIds = uniqueById(cases, "example cases");
uniqueById(diagnosis, "diagnosis questions");
const visualSupplementIds = uniqueById(visualSupplements, "visual supplements");
const solveStoryIds = uniqueById(solveStories, "solve stories");
const traceIds = uniqueById(optimizationTraces, "optimization traces");

const graphIds = new Set([
  ...problemIds,
  ...algorithmIds,
  ...solverIds,
  ...patternIds,
  ...caseIds,
  "not_optimization",
]);

function hasTarget(targetType, targetId) {
  if (targetType === "problem_class") return problemIds.has(targetId);
  if (targetType === "algorithm") return algorithmIds.has(targetId);
  if (targetType === "solver") return solverIds.has(targetId);
  if (targetType === "case") return caseIds.has(targetId);
  if (targetType === "modeling_pattern") return patternIds.has(targetId);
  return false;
}

for (const axis of axes) {
  for (const field of ["name_ja", "name_en", "category", "description", "diagnostic_question", "ui_widget"]) {
    if (!axis[field]) {
      fail(`axis ${axis.id} is missing ${field}`);
    }
  }
  if (typeof axis.core !== "boolean") {
    fail(`axis ${axis.id} must declare core boolean`);
  }
  assertArray(axis.values, `axis ${axis.id}.values`, 2);
}

const coreAxisCount = axes.filter((axis) => axis.core).length;
if (coreAxisCount < 12 || coreAxisCount > 15) {
  fail(`core axis count must be 12-15 for MVP diagnosis, got ${coreAxisCount}`);
}

for (const problem of problems) {
  for (const field of requiredProblemFields) {
    if (problem[field] === undefined || problem[field] === null) {
      fail(`problem ${problem.id} is missing ${field}`);
    }
  }
  assertArray(problem.candidate_algorithms, `problem ${problem.id}.candidate_algorithms`);
  assertArray(problem.candidate_solvers, `problem ${problem.id}.candidate_solvers`);
  assertArray(problem.typical_when, `problem ${problem.id}.typical_when`);
  assertArray(problem.not_good_when, `problem ${problem.id}.not_good_when`);
  assertArray(problem.sources, `problem ${problem.id}.sources`);
  for (const algorithmId of problem.candidate_algorithms) {
    if (!algorithmIds.has(algorithmId)) {
      fail(`problem ${problem.id} references missing algorithm ${algorithmId}`);
    }
  }
  for (const solverId of problem.candidate_solvers) {
    if (!solverIds.has(solverId)) {
      fail(`problem ${problem.id} references missing solver ${solverId}`);
    }
  }
  for (const confusedId of problem.confused_with ?? []) {
    if (!problemIds.has(confusedId)) {
      fail(`problem ${problem.id} confused_with missing problem ${confusedId}`);
    }
  }
  for (const source of problem.sources) {
    if (!source.title || !source.url || !source.type || !source.trust) {
      fail(`problem ${problem.id} has incomplete source`);
    }
    if (String(source.url).includes("qiita.com") || String(source.url).includes("zenn.dev")) {
      fail(`problem ${problem.id} includes disallowed source ${source.url}`);
    }
  }
}

const sourcedProblems = problems.filter((problem) => problem.sources.length >= 2).length;
if (sourcedProblems < 12) {
  fail(`at least 12 problem classes need 2+ sources, got ${sourcedProblems}`);
}

let confusedWithCount = 0;
let guidedConfusedWithCount = 0;
for (const relation of relations) {
  if (!relationTypes.has(relation.type)) {
    fail(`relation ${relation.id} has invalid type ${relation.type}`);
  }
  if (!relationIds.has(relation.id)) {
    fail(`relation ${relation.id} is not registered`);
  }
  if (!graphIds.has(relation.source)) {
    fail(`relation ${relation.id} has missing source ${relation.source}`);
  }
  if (!graphIds.has(relation.target)) {
    fail(`relation ${relation.id} has missing target ${relation.target}`);
  }
  if (!relation.explanation) {
    fail(`relation ${relation.id} is missing explanation`);
  }
  if (relation.type === "confused_with") {
    confusedWithCount += 1;
    if (
      relation.shared &&
      relation.choose_source_when &&
      relation.choose_target_when &&
      relation.decision_note &&
      Array.isArray(relation.decision_axes) &&
      relation.decision_axes.length >= 3
    ) {
      guidedConfusedWithCount += 1;
    }
  }
}

if (confusedWithCount < 8) {
  fail(`need at least 8 confused_with relations, got ${confusedWithCount}`);
}

if (guidedConfusedWithCount !== confusedWithCount) {
  fail(`all confused_with relations need decision guidance, got ${guidedConfusedWithCount}/${confusedWithCount}`);
}

let notOptimizationCaseCount = 0;
const expectedTop3Coverage = new Set();
for (const example of cases) {
  for (const field of ["title", "narrative", "signals"]) {
    if (!example[field]) {
      fail(`example ${example.id} is missing ${field}`);
    }
  }
  assertArray(example.signals, `example ${example.id}.signals`, 1);
  assertArray(example.expected_top3, `example ${example.id}.expected_top3`, 3);
  if (new Set(example.expected_top3).size !== example.expected_top3.length) {
    fail(`example ${example.id}.expected_top3 must not contain duplicate classes`);
  }
  for (const id of example.expected_top3) {
    if (!problemIds.has(id) && id !== "not_optimization") {
      fail(`example ${example.id} references missing expected class ${id}`);
    }
    expectedTop3Coverage.add(id);
  }
  if (example.expected_top3.includes("not_optimization")) {
    notOptimizationCaseCount += 1;
  }
}

if (notOptimizationCaseCount < 3) {
  fail(`need at least 3 not_optimization example cases, got ${notOptimizationCaseCount}`);
}

const coveredProblemClassCount = [...expectedTop3Coverage].filter((id) => problemIds.has(id)).length;
if (coveredProblemClassCount !== problemIds.size) {
  const missing = [...problemIds].filter((id) => !expectedTop3Coverage.has(id));
  fail(`expected_top3 coverage must include every problem class; missing: ${missing.join(", ")}`);
}

for (const question of diagnosis) {
  if (!axisIds.has(question.axis)) {
    fail(`diagnosis question ${question.id} references missing axis ${question.axis}`);
  }
  assertArray(question.answers, `diagnosis question ${question.id}.answers`, 2);
  for (const answer of question.answers) {
    for (const classId of Object.keys(answer.class_scores ?? {})) {
      if (!problemIds.has(classId) && classId !== "not_optimization") {
        fail(`diagnosis question ${question.id} references missing class ${classId}`);
      }
    }
  }
}

const visualSupplementsByAlgorithm = new Map();
for (const supplement of visualSupplements) {
  for (const field of [
    "target_type",
    "target_id",
    "title",
    "visual_type",
    "learning_goal",
    "what_moves",
    "what_user_should_notice",
    "required_fields",
    "pseudo_code",
    "ai_coding_brief",
  ]) {
    if (supplement[field] === undefined || supplement[field] === null) {
      fail(`visual supplement ${supplement.id} is missing ${field}`);
    }
  }
  if (!visualTargetTypes.has(supplement.target_type)) {
    fail(`visual supplement ${supplement.id} has invalid target_type ${supplement.target_type}`);
  }
  if (!hasTarget(supplement.target_type, supplement.target_id)) {
    fail(`visual supplement ${supplement.id} references missing ${supplement.target_type} ${supplement.target_id}`);
  }
  assertArray(supplement.what_moves, `visual supplement ${supplement.id}.what_moves`, 1);
  assertArray(supplement.what_user_should_notice, `visual supplement ${supplement.id}.what_user_should_notice`, 1);
  assertArray(supplement.required_fields, `visual supplement ${supplement.id}.required_fields`, 1);
  if (supplement.static_trace_ok !== true) {
    fail(`visual supplement ${supplement.id} must declare static_trace_ok: true`);
  }
  if (supplement.realtime_solve_required !== false) {
    fail(`visual supplement ${supplement.id} must declare realtime_solve_required: false`);
  }
  if (supplement.target_type === "algorithm") {
    const count = visualSupplementsByAlgorithm.get(supplement.target_id) ?? 0;
    visualSupplementsByAlgorithm.set(supplement.target_id, count + 1);
  }
}

const algorithmsWithoutVisuals = [...algorithmIds].filter((algorithmId) => !visualSupplementsByAlgorithm.has(algorithmId));
if (algorithmsWithoutVisuals.length > 0) {
  fail(`every algorithm needs at least one visual supplement; missing: ${algorithmsWithoutVisuals.join(", ")}`);
}

for (const trace of optimizationTraces) {
  if (!trace.trace_type) {
    fail(`optimization trace ${trace.id} is missing trace_type`);
  }
  assertArray(trace.states, `optimization trace ${trace.id}.states`, 1);
}

for (const story of solveStories) {
  for (const field of [
    "title",
    "case_id",
    "domain",
    "primary_problem_class",
    "secondary_problem_classes",
    "modeling_pattern",
    "decision_variables",
    "objective",
    "constraints",
    "candidate_algorithms",
    "candidate_solvers",
    "visual_trace_id",
    "pseudo_code",
    "interpretation",
    "ai_coding_brief",
  ]) {
    if (story[field] === undefined || story[field] === null) {
      fail(`solve story ${story.id} is missing ${field}`);
    }
  }
  if (!caseIds.has(story.case_id)) {
    fail(`solve story ${story.id} references missing case ${story.case_id}`);
  }
  if (!problemIds.has(story.primary_problem_class)) {
    fail(`solve story ${story.id} references missing primary problem class ${story.primary_problem_class}`);
  }
  for (const problemId of story.secondary_problem_classes ?? []) {
    if (!problemIds.has(problemId)) {
      fail(`solve story ${story.id} references missing secondary problem class ${problemId}`);
    }
  }
  if (!patternIds.has(story.modeling_pattern)) {
    fail(`solve story ${story.id} references missing modeling pattern ${story.modeling_pattern}`);
  }
  assertArray(story.decision_variables, `solve story ${story.id}.decision_variables`, 1);
  assertArray(story.constraints, `solve story ${story.id}.constraints`, 1);
  assertArray(story.candidate_algorithms, `solve story ${story.id}.candidate_algorithms`, 1);
  assertArray(story.candidate_solvers, `solve story ${story.id}.candidate_solvers`, 1);
  assertArray(story.interpretation, `solve story ${story.id}.interpretation`, 1);
  for (const algorithmId of story.candidate_algorithms) {
    if (!algorithmIds.has(algorithmId)) {
      fail(`solve story ${story.id} references missing algorithm ${algorithmId}`);
    }
  }
  for (const solverId of story.candidate_solvers) {
    if (!solverIds.has(solverId)) {
      fail(`solve story ${story.id} references missing solver ${solverId}`);
    }
  }
  if (!traceIds.has(story.visual_trace_id)) {
    fail(`solve story ${story.id} references missing trace ${story.visual_trace_id}`);
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      axes: axes.length,
      coreAxes: coreAxisCount,
      problemClasses: problems.length,
      algorithms: algorithms.length,
      solvers: solvers.length,
      relations: relations.length,
      confusedWithRelations: confusedWithCount,
      guidedConfusedWithRelations: guidedConfusedWithCount,
      exampleCases: cases.length,
      expectedTop3CoveredProblemClasses: coveredProblemClassCount,
      notOptimizationCases: notOptimizationCaseCount,
      visualSupplements: visualSupplements.length,
      visualSupplementedAlgorithms: visualSupplementsByAlgorithm.size,
      solveStories: solveStoryIds.size,
      optimizationTraces: traceIds.size,
      visualSupplementIds: visualSupplementIds.size,
    },
    null,
    2,
  ),
);
