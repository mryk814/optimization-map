import {
  IconArrowRight,
  IconArrowsDiff,
  IconClipboard,
  IconDownload,
  IconExternalLink,
  IconRoute,
} from "@tabler/icons-react";

import { OptimizationGlyph } from "./OptimizationGlyph.jsx";
import { axisValueLabel, labelFor, maps } from "../data/loadData.js";

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function ButtonLink({ children, href, icon: Icon = IconArrowRight, variant = "secondary" }) {
  return (
    <a className={`button button-${variant}`} href={href}>
      <span>{children}</span>
      {Icon && <Icon aria-hidden="true" size={16} />}
    </a>
  );
}

export function IconButton({ children, icon: Icon, onClick, variant = "secondary", title }) {
  return (
    <button className={`button button-${variant}`} onClick={onClick} title={title} type="button">
      <Icon aria-hidden="true" size={16} />
      <span>{children}</span>
    </button>
  );
}

export function CopyExportActions({ onCopy, onExport }) {
  return (
    <div className="inline-actions">
      <IconButton icon={IconClipboard} onClick={onCopy} title="一覧をTSVでコピー">コピー</IconButton>
      <IconButton icon={IconDownload} onClick={onExport} title="一覧をCSVで保存">CSV</IconButton>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, action }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

export function ProblemCard({ problem, compact = false }) {
  const axisSummary = Object.entries(problem.axes ?? {})
    .slice(0, compact ? 2 : 3)
    .map(([axisId, valueId]) => axisValueLabel(axisId, valueId));

  return (
    <a className={`problem-card${compact ? " problem-card-compact" : ""}`} href={`#/problems/${problem.id}`}>
      <OptimizationGlyph problem={problem} variant={compact ? "result" : "list"} />
      <span className="problem-card-main">
        <strong>{problem.name_ja}</strong>
        <span>{problem.name_en}</span>
        {!compact && <em>{problem.summary}</em>}
      </span>
      <span className="chip-list">
        {axisSummary.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </span>
    </a>
  );
}

export function CaseCard({ example }) {
  const comparableIds = example.expected_top3.filter((id) => maps.problems[id]).slice(0, 2);
  const compareHref =
    comparableIds.length >= 2 ? `#/compare/${comparableIds[0]}/${comparableIds[1]}` : `#/cases/${example.id}`;

  return (
    <article className="case-card">
      <a className="case-card-main-link" href={`#/cases/${example.id}`}>
        <h2>{example.title}</h2>
        <p>{example.narrative}</p>
      </a>
      <div className="chip-list">
        {example.expected_top3.slice(0, 3).map((id) => (
          <Badge key={id} tone="active">{labelFor(id)}</Badge>
        ))}
      </div>
      <div className="case-card-actions">
        <ButtonLink href={`#/cases/${example.id}`}>このケースを見る</ButtonLink>
        <ButtonLink href={`#/paths/${example.id}`} icon={IconRoute}>解き方を見る</ButtonLink>
        <ButtonLink href={compareHref} icon={IconArrowsDiff}>候補を比較</ButtonLink>
      </div>
    </article>
  );
}

export function RoutePath({ example, problem }) {
  const algorithms = problem?.candidate_algorithms.slice(0, 2).map(labelFor) ?? [];
  const solvers = problem?.candidate_solvers.slice(0, 2).map(labelFor) ?? [];
  const stages = [
    { href: example ? `#/cases/${example.id}` : undefined, label: "課題", value: example?.title ?? "現実課題" },
    { label: "手がかり", value: example?.signals?.slice(0, 4).join(" / ") ?? "条件" },
    { href: problem ? `#/problems/${problem.id}` : undefined, label: "候補タイプ", value: problem?.name_ja ?? "候補未選択", current: true },
    { label: "手法", value: algorithms.join(" / ") || "手法候補" },
    { label: "実装候補", value: solvers.join(" / ") || "solver 候補" },
  ];

  return (
    <div className="route-path" aria-label="課題から解き方までの流れ">
      {stages.map((stage) => (
        <section className={stage.current ? "route-stage is-current" : "route-stage"} key={stage.label}>
          <span>{stage.label}</span>
          {stage.href ? <a href={stage.href}>{stage.value}</a> : <strong>{stage.value}</strong>}
        </section>
      ))}
    </div>
  );
}

export function SourcesList({ sources }) {
  if (!sources?.length) {
    return <div className="empty-state">Sources はまだありません。</div>;
  }

  return (
    <div className="source-list">
      {sources.map((source) => (
        <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
          <span>{source.title}</span>
          <Badge tone="idle">{source.type}</Badge>
          <IconExternalLink aria-hidden="true" size={15} />
        </a>
      ))}
    </div>
  );
}

export function AxisGrid({ problem }) {
  return (
    <div className="axis-grid" aria-label="分類軸">
      {Object.entries(problem.axes ?? {}).map(([axisId, valueId]) => (
        <div className="axis-chip" key={`${axisId}:${valueId}`}>
          <span>{maps.axes[axisId]?.name_ja ?? axisId}</span>
          <strong>{axisValueLabel(axisId, valueId)}</strong>
        </div>
      ))}
    </div>
  );
}
