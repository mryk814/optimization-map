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

assertArray(axes, "classification axes", 24);
assertArray(problems, "problem classes", 15);
assertArray(algorithms, "algorithms", 15);
assertArray(solvers, "solvers", 15);
assertArray(relations, "relations", 80);
assertArray(cases, "example cases", 20);
assertArray(diagnosis, "diagnosis questions", 8);

const axisIds = uniqueById(axes, "classification axes");
const problemIds = uniqueById(problems, "problem classes");
const algorithmIds = uniqueById(algorithms, "algorithms");
const solverIds = uniqueById(solvers, "solvers");
const patternIds = uniqueById(patterns, "patterns");
const relationIds = uniqueById(relations, "relations");
const caseIds = uniqueById(cases, "example cases");
uniqueById(diagnosis, "diagnosis questions");

const graphIds = new Set([
  ...problemIds,
  ...algorithmIds,
  ...solverIds,
  ...patternIds,
  ...caseIds,
  "not_optimization",
]);

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
  }
}

if (confusedWithCount < 8) {
  fail(`need at least 8 confused_with relations, got ${confusedWithCount}`);
}

for (const example of cases) {
  assertArray(example.expected_top3, `example ${example.id}.expected_top3`, 3);
  for (const id of example.expected_top3) {
    if (!problemIds.has(id) && id !== "not_optimization") {
      fail(`example ${example.id} references missing expected class ${id}`);
    }
  }
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
      exampleCases: cases.length,
    },
    null,
    2,
  ),
);
