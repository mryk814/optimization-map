import { IconMap, IconRoute } from "@tabler/icons-react";

import { Badge, ButtonLink, PageHeader } from "../components/ui.jsx";
import { data, getLearningStepHref, labelFor, maps } from "../data/loadData.js";

const stepLabels = {
  algorithm: "Algorithm",
  brief: "Brief",
  case: "Case",
  compare: "Compare",
  concept: "Concept",
  problem_class: "ProblemType",
  solve_story: "SolveStory",
};

function StepCard({ index, step }) {
  const href = getLearningStepHref(step);
  const title =
    step.title ??
    (step.type === "compare" ? `${labelFor(step.left)} vs ${labelFor(step.right)}` : labelFor(step.id));
  const body =
    step.type === "problem_class" ? maps.problems[step.id]?.summary :
    step.type === "solve_story" ? maps.solveStories[step.id]?.interpretation :
    step.type === "algorithm" ? maps.algorithms[step.id]?.tradeoffs :
    step.type === "brief" ? maps.aiCodingBriefs[step.id]?.expected_output :
    "";

  const content = (
    <>
      <span className="step-index num">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <Badge tone={step.type === "concept" ? "idle" : "active"}>{stepLabels[step.type] ?? step.type}</Badge>
        <strong>{title}</strong>
        {body && <p>{body}</p>}
      </div>
    </>
  );

  if (href) {
    return <a className="learning-step-card" href={href}>{content}</a>;
  }

  return <article className="learning-step-card">{content}</article>;
}

export function LearningView() {
  return (
    <div className="view-stack">
      <PageHeader
        action={<Badge tone="idle">{data.learningPaths.length} paths</Badge>}
        eyebrow="Learning Paths"
        title="読む順番を選ぶ"
      >
        目的別に ProblemType、Algorithm、SolveStory、Brief を短い道順として辿ります。
      </PageHeader>

      <section className="learning-path-grid">
        {data.learningPaths.map((path) => (
          <a className="learning-path-card" href={`#/learning/${path.id}`} key={path.id}>
            <IconMap aria-hidden="true" size={22} />
            <div>
              <p className="eyebrow">{path.audience}</p>
              <h2>{path.title}</h2>
              <p>{path.summary}</p>
            </div>
            <Badge tone="active">{path.steps.length} steps</Badge>
          </a>
        ))}
      </section>
    </div>
  );
}

export function LearningDetailView({ pathId }) {
  const learningPath = maps.learningPaths[pathId] ?? data.learningPaths[0];

  return (
    <div className="view-stack">
      <PageHeader
        action={<ButtonLink href="#/learning" icon={IconRoute}>Path 一覧</ButtonLink>}
        eyebrow={learningPath.audience}
        title={learningPath.title}
      >
        {learningPath.summary}
      </PageHeader>

      <section className="panel">
        <div className="learning-step-list">
          {learningPath.steps.map((step, index) => (
            <StepCard index={index} key={`${step.type}:${step.id ?? step.title ?? index}`} step={step} />
          ))}
        </div>
      </section>
    </div>
  );
}
