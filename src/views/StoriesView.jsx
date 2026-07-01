import { IconBook2, IconRoute } from "@tabler/icons-react";

import { TracePlayer } from "../components/TracePlayer.jsx";
import { Badge, ButtonLink, PageHeader } from "../components/ui.jsx";
import { data, getStoryTrace, labelFor, maps } from "../data/loadData.js";

function StoryCard({ story }) {
  const trace = maps.traces[story.visual_trace_id];
  return (
    <article className="story-card">
      <div>
        <p className="eyebrow">SolveStory</p>
        <h2>{story.title}</h2>
        <p>{story.objective}</p>
      </div>
      <div className="chip-list">
        <Badge tone="active">{labelFor(story.primary_problem_class)}</Badge>
        {trace && <Badge tone="review">{trace.trace_type}</Badge>}
      </div>
      <div className="inline-actions">
        <ButtonLink href={`#/stories/${story.id}`}>見る</ButtonLink>
        <ButtonLink href={`#/cases/${story.case_id}`} icon={IconBook2}>ケース</ButtonLink>
      </div>
    </article>
  );
}

function FieldList({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="story-field-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export function StoriesView() {
  return (
    <div className="view-stack">
      <PageHeader eyebrow="Solve Stories" title="小さく解いて、最適化の進み方を見る">
        リアルタイム求解ではなく、事前に用意した trace を再生して、課題から解釈までを確認します。
      </PageHeader>

      <section className="story-grid">
        {data.solveStories.map((story) => <StoryCard key={story.id} story={story} />)}
      </section>
    </div>
  );
}

export function StoryDetailView({ storyId }) {
  const story = maps.solveStories[storyId] ?? data.solveStories[0];
  const example = maps.cases[story.case_id];
  const primary = maps.problems[story.primary_problem_class];
  const trace = getStoryTrace(story.id);

  return (
    <div className="article-layout">
      <article className="view-stack">
        <PageHeader
          action={<ButtonLink href={`#/paths/${story.case_id}`} icon={IconRoute}>解き方ビューへ</ButtonLink>}
          eyebrow="SolveStory"
          title={story.title}
        >
          {example?.narrative ?? story.objective}
        </PageHeader>

        <section className="panel story-overview-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Model</p>
              <h2>課題からモデルへ</h2>
            </div>
            {primary && <ButtonLink href={`#/problems/${primary.id}`}>問題タイプを読む</ButtonLink>}
          </div>
          <div className="story-model-grid">
            <FieldList items={story.decision_variables} title="決定変数" />
            <section className="story-field-block">
              <h3>目的</h3>
              <p>{story.objective}</p>
            </section>
            <FieldList items={story.constraints} title="制約" />
            <section className="story-field-block">
              <h3>不確実性 / 時間</h3>
              <p>{story.uncertainty_or_time_structure}</p>
            </section>
          </div>
        </section>

        <TracePlayer trace={trace} />

        <section className="split-section">
          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Pseudo Code</p>
                <h2>Python風の流れ</h2>
              </div>
            </div>
            <pre className="code-block"><code>{story.pseudo_code}</code></pre>
          </div>
          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Interpretation</p>
                <h2>解釈するポイント</h2>
              </div>
            </div>
            <ul className="story-list">
              {story.interpretation.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AI Brief</p>
              <h2>AIに実装依頼するなら</h2>
            </div>
          </div>
          <pre className="code-block"><code>{story.ai_coding_brief}</code></pre>
        </section>
      </article>

      <aside className="article-rail">
        <section className="panel">
          <p className="eyebrow">Linked</p>
          <div className="action-list">
            {example && <ButtonLink href={`#/cases/${example.id}`}>ケースを見る</ButtonLink>}
            {primary && <ButtonLink href={`#/problems/${primary.id}`}>問題タイプを見る</ButtonLink>}
            <ButtonLink href="#/stories">他のSolveStory</ButtonLink>
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">Algorithm / Solver</p>
          <div className="chip-list chip-list-large">
            {story.candidate_algorithms.map((id) => <Badge key={id} tone="active">{labelFor(id)}</Badge>)}
            {story.candidate_solvers.map((id) => <Badge key={id} tone="done">{labelFor(id)}</Badge>)}
          </div>
        </section>
      </aside>
    </div>
  );
}
