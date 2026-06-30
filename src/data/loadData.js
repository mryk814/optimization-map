import yaml from "js-yaml";

import axesRaw from "../../data/classification_axes.yml?raw";
import algorithmsRaw from "../../data/algorithms.yml?raw";
import diagnosisRaw from "../../data/diagnosis_rules.yml?raw";
import examplesRaw from "../../data/example_cases.yml?raw";
import patternsRaw from "../../data/modeling_patterns.yml?raw";
import problemsRaw from "../../data/problem_classes.yml?raw";
import relationsRaw from "../../data/relations.yml?raw";
import solversRaw from "../../data/solvers.yml?raw";

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
};

export const maps = {
  axes: Object.fromEntries(data.axes.map((axis) => [axis.id, axis])),
  algorithms: Object.fromEntries(data.algorithms.map((algorithm) => [algorithm.id, algorithm])),
  cases: Object.fromEntries(data.exampleCases.map((example) => [example.id, example])),
  patterns: Object.fromEntries(data.patterns.map((pattern) => [pattern.id, pattern])),
  problems: Object.fromEntries(data.problemClasses.map((problem) => [problem.id, problem])),
  solvers: Object.fromEntries(data.solvers.map((solver) => [solver.id, solver])),
};

export function labelFor(id) {
  const node =
    maps.problems[id] ??
    maps.algorithms[id] ??
    maps.solvers[id] ??
    maps.patterns[id] ??
    maps.cases[id] ??
    (id === "not_optimization" ? { title: "最適化の前に分析する" } : null);
  return node?.name_ja ?? node?.name ?? node?.title ?? id;
}

export function getRelated(problemId) {
  return data.relations.filter((relation) => relation.source === problemId || relation.target === problemId);
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
