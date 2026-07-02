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
const visualSupplements = readYaml("data/visual_supplements.yml").visual_supplements;
const solveStories = readYaml("data/solve_stories.yml").solve_stories;
const optimizationTraces = readYaml("data/optimization_traces.yml").optimization_traces;
const aiCodingBriefs = readYaml("data/ai_coding_briefs.yml").ai_coding_briefs;
const learningPaths = readYaml("data/learning_paths.yml").learning_paths;
const modelingWizard = readYaml("data/modeling_wizard.yml").modeling_wizard;

assertArray(axes, "classification axes", 24);
assertArray(problems, "problem classes", 15);
assertArray(algorithms, "algorithms", 15);
assertArray(solvers, "solvers", 15);
assertArray(relations, "relations", 80);
assertArray(cases, "example cases", 30);
assertArray(diagnosis, "diagnosis questions", 8);
assertArray(visualSupplements, "visual supplements", 20);
assertArray(solveStories, "solve stories", 50);
assertArray(optimizationTraces, "optimization traces", 6);
assertArray(aiCodingBriefs, "AI coding briefs", 20);
assertArray(learningPaths, "learning paths", 6);
assertArray(modelingWizard, "modeling wizard steps", 8);

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
const aiCodingBriefIds = uniqueById(aiCodingBriefs, "AI coding briefs");
uniqueById(learningPaths, "learning paths");
const wizardStepIds = uniqueById(modelingWizard, "modeling wizard steps");

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

const highPriorityV02ProblemIds = [
  "multi_objective_optimization",
  "network_flow_graph_optimization",
  "mixed_integer_nonlinear_programming",
];

for (const id of highPriorityV02ProblemIds) {
  if (!problemIds.has(id)) {
    fail(`v0.2 high-priority problem class is missing: ${id}`);
  }
  const connectedCases = cases.filter((example) => (example.expected_top3 ?? []).includes(id));
  if (connectedCases.length < 2) {
    fail(`${id} needs at least 2 connected example cases, got ${connectedCases.length}`);
  }
}

const visualTargetIdsByAlgorithm = new Map();
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
  if (supplement.static_trace_ok !== true) {
    fail(`visual supplement ${supplement.id} must declare static_trace_ok: true`);
  }
  if (supplement.realtime_solve_required !== false) {
    fail(`visual supplement ${supplement.id} must declare realtime_solve_required: false`);
  }
  if (supplement.target_type === "algorithm") {
    if (!algorithmIds.has(supplement.target_id)) {
      fail(`visual supplement ${supplement.id} references missing algorithm ${supplement.target_id}`);
    }
    const list = visualTargetIdsByAlgorithm.get(supplement.target_id) ?? [];
    list.push(supplement.id);
    visualTargetIdsByAlgorithm.set(supplement.target_id, list);
  } else if (supplement.target_type === "problem_class") {
    if (!problemIds.has(supplement.target_id)) {
      fail(`visual supplement ${supplement.id} references missing problem class ${supplement.target_id}`);
    }
  } else {
    fail(`visual supplement ${supplement.id} has unsupported target_type ${supplement.target_type}`);
  }
  assertArray(supplement.required_fields, `visual supplement ${supplement.id}.required_fields`);
  assertArray(supplement.pseudo_code, `visual supplement ${supplement.id}.pseudo_code`);
}

const missingAlgorithmVisuals = [...algorithmIds].filter((id) => !visualTargetIdsByAlgorithm.has(id));
if (missingAlgorithmVisuals.length > 0) {
  fail(`all algorithms need a visual supplement; missing: ${missingAlgorithmVisuals.join(", ")}`);
}

for (const trace of optimizationTraces) {
  if (!trace.trace_type || !trace.title) {
    fail(`optimization trace ${trace.id} needs trace_type and title`);
  }
  assertArray(trace.states, `optimization trace ${trace.id}.states`);
}

let storiesWithTrace = 0;
let storiesWithBrief = 0;
const storyProblemCoverage = new Set();
for (const story of solveStories) {
  for (const field of [
    "title",
    "domain",
    "primary_problem_class",
    "decision_variables",
    "objective",
    "constraints",
    "candidate_algorithms",
    "candidate_solvers",
    "pseudo_code",
    "interpretation",
    "sources",
  ]) {
    if (story[field] === undefined || story[field] === null) {
      fail(`solve story ${story.id} is missing ${field}`);
    }
  }
  if (!story.case_id && !story.synthetic_case) {
    fail(`solve story ${story.id} needs case_id or synthetic_case`);
  }
  if (story.case_id && !caseIds.has(story.case_id)) {
    fail(`solve story ${story.id} references missing case ${story.case_id}`);
  }
  if (!problemIds.has(story.primary_problem_class)) {
    fail(`solve story ${story.id} references missing primary problem class ${story.primary_problem_class}`);
  }
  storyProblemCoverage.add(story.primary_problem_class);
  for (const classId of story.secondary_problem_classes ?? []) {
    if (!problemIds.has(classId)) {
      fail(`solve story ${story.id} references missing secondary problem class ${classId}`);
    }
  }
  assertArray(story.candidate_algorithms, `solve story ${story.id}.candidate_algorithms`);
  assertArray(story.candidate_solvers, `solve story ${story.id}.candidate_solvers`);
  assertArray(story.pseudo_code, `solve story ${story.id}.pseudo_code`);
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
  for (const sourceId of story.sources ?? []) {
    if (!problemIds.has(sourceId) && !algorithmIds.has(sourceId)) {
      fail(`solve story ${story.id} references missing source anchor ${sourceId}`);
    }
  }
  if (story.visual_trace_id) {
    if (!traceIds.has(story.visual_trace_id)) {
      fail(`solve story ${story.id} references missing trace ${story.visual_trace_id}`);
    }
    storiesWithTrace += 1;
  }
  if (story.ai_coding_brief_id) {
    if (!aiCodingBriefIds.has(story.ai_coding_brief_id)) {
      fail(`solve story ${story.id} references missing AI coding brief ${story.ai_coding_brief_id}`);
    }
    storiesWithBrief += 1;
  }
}

if (storiesWithTrace < 30) {
  fail(`need at least 30 solve stories with visual trace, got ${storiesWithTrace}`);
}

if (storiesWithBrief < 20) {
  fail(`need at least 20 solve stories with AI coding brief, got ${storiesWithBrief}`);
}

const missingStoryCoverage = [...problemIds].filter((id) => !storyProblemCoverage.has(id));
if (missingStoryCoverage.length > 0) {
  fail(`each problem class needs at least 1 primary solve story; missing: ${missingStoryCoverage.join(", ")}`);
}

const requiredBriefFields = [
  "target_type",
  "target_id",
  "title",
  "decision_variables",
  "objective",
  "constraints",
  "recommended_libraries",
  "implementation_plan",
  "cautions",
  "expected_output",
];
let problemBriefCount = 0;
let storyBriefCount = 0;
const briefTypes = new Set();
for (const brief of aiCodingBriefs) {
  for (const field of requiredBriefFields) {
    if (brief[field] === undefined || brief[field] === null) {
      fail(`AI coding brief ${brief.id} is missing ${field}`);
    }
  }
  briefTypes.add(brief.target_type);
  assertArray(brief.implementation_plan, `AI coding brief ${brief.id}.implementation_plan`);
  assertArray(brief.cautions, `AI coding brief ${brief.id}.cautions`);
  if (!Array.isArray(brief.recommended_libraries)) {
    fail(`AI coding brief ${brief.id}.recommended_libraries must be an array`);
  }
  for (const solverId of brief.recommended_libraries) {
    if (!solverIds.has(solverId)) {
      fail(`AI coding brief ${brief.id} references missing solver ${solverId}`);
    }
  }
  if (brief.target_type === "problem_class") {
    problemBriefCount += 1;
    if (!problemIds.has(brief.target_id)) {
      fail(`AI coding brief ${brief.id} references missing problem class ${brief.target_id}`);
    }
  } else if (brief.target_type === "solve_story") {
    storyBriefCount += 1;
    if (!solveStoryIds.has(brief.target_id)) {
      fail(`AI coding brief ${brief.id} references missing solve story ${brief.target_id}`);
    }
  } else if (brief.target_type === "algorithm_visual") {
    if (!visualSupplementIds.has(brief.target_id)) {
      fail(`AI coding brief ${brief.id} references missing visual supplement ${brief.target_id}`);
    }
  } else if (brief.target_type === "solver_usage") {
    if (!solverIds.has(brief.target_id)) {
      fail(`AI coding brief ${brief.id} references missing solver target ${brief.target_id}`);
    }
  } else if (brief.target_type === "modeling_pattern") {
    if (!patternIds.has(brief.target_id)) {
      fail(`AI coding brief ${brief.id} references missing modeling pattern ${brief.target_id}`);
    }
  } else if (brief.target_type === "not_optimization") {
    if (!solveStoryIds.has(brief.target_id)) {
      fail(`AI coding brief ${brief.id} references missing not_optimization story ${brief.target_id}`);
    }
  } else {
    fail(`AI coding brief ${brief.id} has unsupported target_type ${brief.target_type}`);
  }
}

if (problemBriefCount < 10) {
  fail(`need at least 10 problem-class AI coding briefs, got ${problemBriefCount}`);
}

if (storyBriefCount < 10) {
  fail(`need at least 10 solve-story AI coding briefs, got ${storyBriefCount}`);
}

for (const requiredType of ["problem_class", "solve_story", "algorithm_visual", "solver_usage", "modeling_pattern", "not_optimization"]) {
  if (!briefTypes.has(requiredType)) {
    fail(`AI coding briefs need target type ${requiredType}`);
  }
}

const learningAudiences = new Set();
for (const learningPath of learningPaths) {
  if (!learningPath.title || !learningPath.audience || !learningPath.summary) {
    fail(`learning path ${learningPath.id} needs title, audience, and summary`);
  }
  learningAudiences.add(learningPath.audience);
  assertArray(learningPath.steps, `learning path ${learningPath.id}.steps`, 5);
  if (learningPath.steps.length > 12) {
    fail(`learning path ${learningPath.id} must have at most 12 steps`);
  }
  for (const [index, step] of learningPath.steps.entries()) {
    if (!step.type) {
      fail(`learning path ${learningPath.id} step ${index + 1} is missing type`);
    }
    if (step.type === "concept") {
      if (!step.title) {
        fail(`learning path ${learningPath.id} concept step ${index + 1} needs title`);
      }
    } else if (step.type === "problem_class") {
      if (!problemIds.has(step.id)) {
        fail(`learning path ${learningPath.id} references missing problem class ${step.id}`);
      }
    } else if (step.type === "algorithm") {
      if (!algorithmIds.has(step.id)) {
        fail(`learning path ${learningPath.id} references missing algorithm ${step.id}`);
      }
    } else if (step.type === "solve_story") {
      if (!solveStoryIds.has(step.id)) {
        fail(`learning path ${learningPath.id} references missing solve story ${step.id}`);
      }
    } else if (step.type === "case") {
      if (!caseIds.has(step.id)) {
        fail(`learning path ${learningPath.id} references missing case ${step.id}`);
      }
    } else if (step.type === "brief") {
      if (!aiCodingBriefIds.has(step.id)) {
        fail(`learning path ${learningPath.id} references missing brief ${step.id}`);
      }
    } else if (step.type === "compare") {
      if (!problemIds.has(step.left) || !problemIds.has(step.right)) {
        fail(`learning path ${learningPath.id} has invalid compare step ${step.left}/${step.right}`);
      }
    } else {
      fail(`learning path ${learningPath.id} has unsupported step type ${step.type}`);
    }
  }
}

for (const audience of ["beginner", "practitioner", "ml_engineer", "researcher"]) {
  if (!learningAudiences.has(audience)) {
    fail(`learning paths need audience ${audience}`);
  }
}

for (const step of modelingWizard) {
  for (const field of ["question", "answers", "axis_effects", "class_scores", "next_questions"]) {
    if (step[field] === undefined || step[field] === null) {
      fail(`modeling wizard step ${step.id} is missing ${field}`);
    }
  }
  assertArray(step.answers, `modeling wizard step ${step.id}.answers`, 2);
  assertArray(step.axis_effects, `modeling wizard step ${step.id}.axis_effects`, 1);
  if (typeof step.class_scores !== "object" || Array.isArray(step.class_scores)) {
    fail(`modeling wizard step ${step.id}.class_scores must be an object`);
  }
  if (!Array.isArray(step.next_questions)) {
    fail(`modeling wizard step ${step.id}.next_questions must be an array`);
  }
  for (const axisId of step.axis_effects) {
    if (!axisIds.has(axisId)) {
      fail(`modeling wizard step ${step.id} references missing axis ${axisId}`);
    }
  }
  for (const questionId of step.next_questions) {
    if (!wizardStepIds.has(questionId)) {
      fail(`modeling wizard step ${step.id} references missing next question ${questionId}`);
    }
  }
  for (const answer of step.answers) {
    for (const field of ["label", "axis_effects", "class_scores", "next_questions"]) {
      if (answer[field] === undefined || answer[field] === null) {
        fail(`modeling wizard answer ${step.id}.${answer.id} is missing ${field}`);
      }
    }
    for (const axisId of Object.keys(answer.axis_effects ?? {})) {
      if (!axisIds.has(axisId)) {
        fail(`modeling wizard answer ${step.id}.${answer.id} references missing axis ${axisId}`);
      }
    }
    for (const classId of Object.keys(answer.class_scores ?? {})) {
      if (!problemIds.has(classId) && classId !== "not_optimization") {
        fail(`modeling wizard answer ${step.id}.${answer.id} references missing problem class ${classId}`);
      }
    }
    for (const patternId of Object.keys(answer.pattern_scores ?? {})) {
      if (!patternIds.has(patternId)) {
        fail(`modeling wizard answer ${step.id}.${answer.id} references missing modeling pattern ${patternId}`);
      }
    }
    for (const storyId of answer.story_suggestions ?? []) {
      if (!solveStoryIds.has(storyId)) {
        fail(`modeling wizard answer ${step.id}.${answer.id} references missing solve story ${storyId}`);
      }
    }
    for (const briefId of answer.brief_suggestions ?? []) {
      if (!aiCodingBriefIds.has(briefId)) {
        fail(`modeling wizard answer ${step.id}.${answer.id} references missing AI coding brief ${briefId}`);
      }
    }
    for (const questionId of answer.next_questions ?? []) {
      if (!wizardStepIds.has(questionId)) {
        fail(`modeling wizard answer ${step.id}.${answer.id} references missing next question ${questionId}`);
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
      guidedConfusedWithRelations: guidedConfusedWithCount,
      exampleCases: cases.length,
      expectedTop3CoveredProblemClasses: coveredProblemClassCount,
      notOptimizationCases: notOptimizationCaseCount,
      visualSupplements: visualSupplements.length,
      solveStories: solveStories.length,
      solveStoriesWithTrace: storiesWithTrace,
      solveStoriesWithBrief: storiesWithBrief,
      optimizationTraces: optimizationTraces.length,
      aiCodingBriefs: aiCodingBriefs.length,
      learningPaths: learningPaths.length,
      modelingWizardSteps: modelingWizard.length,
    },
    null,
    2,
  ),
);
