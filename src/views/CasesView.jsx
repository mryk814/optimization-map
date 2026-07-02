import { useMemo, useState } from "react";
import { IconFilter, IconListSearch, IconRoute } from "@tabler/icons-react";

import { data, getCaseProblems, getStoriesForCase, labelFor, maps } from "../data/loadData.js";
import { Badge, ButtonLink, CaseCard, PageHeader, ProblemCard, RoutePath } from "../components/ui.jsx";

export function CasesView() {
  const [problemFilter, setProblemFilter] = useState("all");
  const filteredCases = useMemo(() => {
    if (problemFilter === "all") {
      return data.exampleCases;
    }
    return data.exampleCases.filter(
      (example) =>
        example.expected_top3.includes(problemFilter) ||
        (example.likely_traps ?? []).includes(problemFilter),
    );
  }, [problemFilter]);

  return (
    <div className="view-stack">
      <PageHeader
        action={<Badge tone="idle">{filteredCases.length} / {data.exampleCases.length} 件</Badge>}
        eyebrow="Cases"
        title="近いケースから入る"
      >
        現実課題を選ぶと、候補タイプと間違えやすい罠を先に確認できます。
      </PageHeader>

      <section className="panel list-panel" aria-label="ケース検索">
        <div className="toolbar-row">
          <label className="filter-box">
            <IconFilter aria-hidden="true" size={16} />
            <select
              aria-label="問題タイプでケースを絞り込み"
              onChange={(event) => setProblemFilter(event.target.value)}
              value={problemFilter}
            >
              <option value="all">すべてのケース</option>
              {data.problemClasses.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.name_ja}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            {problemFilter !== "all" && <Badge tone="active">{labelFor(problemFilter)}</Badge>}
            <ButtonLink href="#/diagnosis" icon={IconListSearch}>条件から診断する</ButtonLink>
          </div>
        </div>
      </section>

      <section className="case-grid">
        {filteredCases.map((example) => (
          <CaseCard example={example} key={example.id} />
        ))}
      </section>
    </div>
  );
}

export function CaseDetailView({ caseId }) {
  const example = maps.cases[caseId] ?? data.exampleCases[0];
  const problems = getCaseProblems(example.id);
  const primary = problems[0];
  const traps = example.likely_traps?.map((id) => maps.problems[id]).filter(Boolean) ?? [];
  const stories = getStoriesForCase(example.id);

  return (
    <div className="view-stack">
      <PageHeader
        action={<ButtonLink href={`#/paths/${example.id}`} icon={IconRoute}>解き方を見る</ButtonLink>}
        eyebrow="Case"
        title={example.title}
      >
        {example.narrative}
      </PageHeader>

      <section className="panel">
        <div className="section-heading">
          <div>
              <p className="eyebrow">How To Solve</p>
              <h2>このケースをどう見るか</h2>
          </div>
          {primary && <ButtonLink href={`#/problems/${primary.id}`}>第一候補を読む</ButtonLink>}
        </div>
        <RoutePath example={example} problem={primary} />
      </section>

      {stories.length > 0 ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Visual Demo</p>
              <h2>小さく解いてみる</h2>
            </div>
            <Badge tone="active">{stories.length} 件</Badge>
          </div>
          <div className="story-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.id}>
                <div>
                  <p className="eyebrow">{maps.traces[story.visual_trace_id]?.trace_type ?? "trace"}</p>
                  <h2>{story.title}</h2>
                  <p>{story.objective}</p>
                </div>
                <ButtonLink href={`#/stories/${story.id}`}>traceを見る</ButtonLink>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-state">このケースの visual demo は coming soon です。</div>
      )}

      <section className="split-section">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Candidates</p>
              <h2>候補タイプ</h2>
            </div>
            <Badge tone="active">{problems.length} 件</Badge>
          </div>
          <div className="problem-list">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Signals</p>
              <h2>診断で見る条件</h2>
            </div>
            <ButtonLink href="#/diagnosis" icon={IconListSearch}>診断を開く</ButtonLink>
          </div>
          <div className="chip-list chip-list-large">
            {example.signals.map((signal) => (
              <Badge key={signal}>{signal}</Badge>
            ))}
          </div>
          {traps.length > 0 && (
            <div className="trap-box">
              <h3>罠になりやすい候補</h3>
              <div className="problem-list">
                {traps.map((problem) => (
                  <ProblemCard compact key={problem.id} problem={problem} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SolveStory</p>
            <h2>このケースを小さく解く</h2>
          </div>
          <ButtonLink href="#/stories">Story 一覧</ButtonLink>
        </div>
        {stories.length > 0 ? (
          <div className="story-mini-grid">
            {stories.map((story) => (
              <a className="story-mini-card" href={`#/stories/${story.id}`} key={story.id}>
                <strong>{story.title}</strong>
                <span>{story.interpretation}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">coming soon</div>
        )}
      </section>
    </div>
  );
}
