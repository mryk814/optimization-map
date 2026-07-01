import { IconBook2 } from "@tabler/icons-react";

import { axisValueLabel, data, getPathForCase, maps } from "../data/loadData.js";
import { Badge, ButtonLink, PageHeader, ProblemCard, RoutePath } from "../components/ui.jsx";

export function PathView({ caseId }) {
  const path = getPathForCase(caseId) ?? getPathForCase(data.exampleCases[0].id);
  const traps = path.example.likely_traps?.map((id) => maps.problems[id]).filter(Boolean) ?? [];
  const primaryAxes = Object.entries(path.primary?.axes ?? {}).slice(0, 5);
  const stories = path.stories ?? [];

  return (
    <div className="view-stack">
      <PageHeader
        action={<ButtonLink href={`#/cases/${path.example.id}`} icon={IconBook2}>ケースを読む</ButtonLink>}
        eyebrow="How To Solve"
        title="この課題をどう解くか"
      >
        現実課題の条件を手がかりにして、候補タイプ、手法、solver 候補へ順に翻訳します。
      </PageHeader>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Case</p>
            <h2>{path.example.title}</h2>
          </div>
          <Badge tone="active">{path.problems.length} candidates</Badge>
        </div>
        <RoutePath example={path.example} problem={path.primary} />
      </section>

      <section className="panel route-evidence">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Why This Route</p>
            <h2>この経路の根拠</h2>
          </div>
          {path.primary && <ButtonLink href={`#/problems/${path.primary.id}`}>候補タイプを読む</ButtonLink>}
        </div>
        <div className="evidence-grid">
          <section>
            <h3>ケースの手がかり</h3>
            <div className="chip-list">
              {path.example.signals.map((signal) => (
                <Badge key={signal}>{signal}</Badge>
              ))}
            </div>
          </section>
          <section>
            <h3>候補タイプの分類軸</h3>
            <div className="chip-list">
              {primaryAxes.map(([axisId, valueId]) => (
                <Badge key={`${axisId}:${valueId}`} tone="active">
                  {axisValueLabel(axisId, valueId)}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </section>

      {stories.length > 0 ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Small Demo</p>
              <h2>小さく解いて確認する</h2>
            </div>
            <Badge tone="active">{stories.length} stories</Badge>
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
        <div className="empty-state">このケースの SolveStory は coming soon です。</div>
      )}

      <section className="split-section">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Candidates</p>
              <h2>候補タイプ</h2>
            </div>
          </div>
          <div className="problem-list">
            {path.problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Implement</p>
              <h2>手法と実装候補</h2>
            </div>
          </div>
          <div className="path-columns">
            <section>
              <h3>Algorithm</h3>
              <div className="chip-list">
                {path.algorithms.slice(0, 5).map((algorithm) => (
                  <Badge key={algorithm.id} tone="active">{algorithm.name_ja ?? algorithm.name}</Badge>
                ))}
              </div>
            </section>
            <section>
              <h3>Solver / Library</h3>
              <div className="chip-list">
                {path.solvers.slice(0, 5).map((solver) => (
                  <Badge key={solver.id} tone="done">{solver.name}</Badge>
                ))}
              </div>
            </section>
          </div>
          {traps.length > 0 && (
            <div className="trap-box">
              <h3>すぐ飛びつくと危ない候補</h3>
              <div className="problem-list">
                {traps.map((problem) => (
                  <ProblemCard compact key={problem.id} problem={problem} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
