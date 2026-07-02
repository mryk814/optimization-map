import { useMemo, useState } from "react";
import { IconCopy, IconDownload, IconPlayerPlay } from "@tabler/icons-react";

import { MotionPreview } from "../components/MotionPreview.jsx";
import { Badge, ButtonLink, IconButton, PageHeader } from "../components/ui.jsx";
import { data, getBriefMarkdown, labelFor, maps } from "../data/loadData.js";

function writeDownload(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function BriefActions({ brief }) {
  const [copied, setCopied] = useState(false);
  if (!brief) {
    return null;
  }

  const markdown = getBriefMarkdown(brief);
  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="inline-actions">
      <IconButton icon={IconCopy} onClick={copy} title="Markdownでコピー">{copied ? "コピー済み" : "Markdown"}</IconButton>
      <IconButton
        icon={IconDownload}
        onClick={() => writeDownload(`${brief.id}.json`, JSON.stringify(brief, null, 2), "application/json;charset=utf-8")}
        title="JSONで保存"
      >
        JSON
      </IconButton>
    </div>
  );
}

function StoryCard({ story }) {
  const trace = maps.traces[story.visual_trace_id];

  return (
    <a className="story-card" href={`#/stories/${story.id}`}>
      {trace ? <MotionPreview className="motion-preview-card" traceId={trace.id} /> : <div className="empty-state">coming soon</div>}
      <div className="story-card-body">
        <p className="eyebrow">{story.domain}</p>
        <h2>{story.title}</h2>
        <p>{story.interpretation}</p>
        <div className="chip-list">
          <Badge tone="active">{labelFor(story.primary_problem_class)}</Badge>
          {story.ai_coding_brief_id && <Badge tone="done">AI brief</Badge>}
        </div>
      </div>
    </a>
  );
}

export function StoriesView() {
  const [problemId, setProblemId] = useState("all");
  const stories = useMemo(() => {
    if (problemId === "all") {
      return data.solveStories;
    }
    return data.solveStories.filter(
      (story) => story.primary_problem_class === problemId || (story.secondary_problem_classes ?? []).includes(problemId),
    );
  }, [problemId]);

  return (
    <div className="view-stack">
      <PageHeader
        action={<Badge tone="idle">{stories.length} / {data.solveStories.length} 本</Badge>}
        eyebrow="SolveStory Library"
        title="小さく解いて理解する"
      >
        課題、変数、目的、制約、trace、解釈、AI Coding Brief までを一つの story として読みます。
      </PageHeader>

      <section className="panel list-panel">
        <div className="toolbar-row toolbar-row-two">
          <label className="filter-box">
            <IconPlayerPlay aria-hidden="true" size={16} />
            <select aria-label="問題タイプで story を絞り込み" onChange={(event) => setProblemId(event.target.value)} value={problemId}>
              <option value="all">すべての ProblemType</option>
              {data.problemClasses.map((problem) => (
                <option key={problem.id} value={problem.id}>{problem.name_ja}</option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            <ButtonLink href="#/algorithms">手法から見る</ButtonLink>
          </div>
        </div>
      </section>

      <section className="story-grid">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </section>
    </div>
  );
}

export function StoryDetailView({ storyId }) {
  const story = maps.solveStories[storyId] ?? data.solveStories[0];
  const trace = maps.traces[story.visual_trace_id];
  const brief = maps.aiCodingBriefs[story.ai_coding_brief_id];
  const caseItem = story.case_id ? maps.cases[story.case_id] : null;

  return (
    <div className="article-layout">
      <article className="view-stack">
        <PageHeader
          action={<ButtonLink href="#/stories" icon={IconPlayerPlay}>Story一覧</ButtonLink>}
          eyebrow="SolveStory"
          title={story.title}
        >
          {story.interpretation}
        </PageHeader>

        <section className="panel story-detail-hero">
          {trace ? <MotionPreview traceId={trace.id} /> : <div className="empty-state">coming soon</div>}
          <div className="story-model">
            <p className="eyebrow">{story.domain}</p>
            <h2>{labelFor(story.primary_problem_class)}</h2>
            <dl className="detail-dl">
              <div>
                <dt>変数</dt>
                <dd>{story.decision_variables}</dd>
              </div>
              <div>
                <dt>目的</dt>
                <dd>{story.objective}</dd>
              </div>
              <div>
                <dt>制約</dt>
                <dd>{story.constraints}</dd>
              </div>
              <div>
                <dt>不確実性 / 時間</dt>
                <dd>{story.uncertainty_or_time_structure}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="split-section">
          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Trace</p>
                <h2>step-by-step</h2>
              </div>
              {trace && <Badge tone="active">{trace.trace_type}</Badge>}
            </div>
            <ol className="ordered-list">
              {(trace?.states ?? []).slice(0, 8).map((state, index) => (
                <li key={index}>{state.note ?? `${trace.trace_type} step ${index + 1}`}</li>
              ))}
            </ol>
          </div>

          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Pseudo Code</p>
                <h2>実装の骨格</h2>
              </div>
            </div>
            <ol className="ordered-list">
              {story.pseudo_code.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AI Coding Brief</p>
              <h2>持ち出せる実装指示</h2>
            </div>
            <BriefActions brief={brief} />
          </div>
          {brief ? <pre className="brief-preview">{getBriefMarkdown(brief)}</pre> : <div className="empty-state">この story の brief はまだありません。</div>}
        </section>
      </article>

      <aside className="article-rail">
        <section className="panel">
          <p className="eyebrow">Route</p>
          <div className="action-list">
            {caseItem && <ButtonLink href={`#/cases/${caseItem.id}`}>{caseItem.title}</ButtonLink>}
            <ButtonLink href={`#/problems/${story.primary_problem_class}`}>{labelFor(story.primary_problem_class)}</ButtonLink>
            {story.candidate_algorithms.slice(0, 3).map((id) => (
              <ButtonLink href={`#/algorithms/${id}`} key={id}>{labelFor(id)}</ButtonLink>
            ))}
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">Solver</p>
          <div className="chip-list">
            {story.candidate_solvers.map((id) => (
              <Badge key={id} tone="done">{labelFor(id)}</Badge>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

export function BriefsView({ briefId }) {
  const brief = maps.aiCodingBriefs[briefId] ?? data.aiCodingBriefs[0];

  return (
    <div className="view-stack">
      <PageHeader
        action={<BriefActions brief={brief} />}
        eyebrow="AI Coding Brief"
        title={brief.title}
      >
        {labelFor(brief.target_id)}
      </PageHeader>
      <section className="panel">
        <pre className="brief-preview">{getBriefMarkdown(brief)}</pre>
      </section>
    </div>
  );
}
