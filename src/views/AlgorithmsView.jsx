import { useMemo, useState } from "react";
import { IconCopy, IconPlayerPlay, IconRoute } from "@tabler/icons-react";

import { MotionPreview } from "../components/MotionPreview.jsx";
import { Badge, ButtonLink, IconButton, PageHeader } from "../components/ui.jsx";
import { data, getStoriesForProblem, getVisualForAlgorithm, labelFor, maps } from "../data/loadData.js";

function AlgorithmCard({ algorithm }) {
  const visual = getVisualForAlgorithm(algorithm.id);

  return (
    <a className="algorithm-card" href={`#/algorithms/${algorithm.id}`}>
      <MotionPreview className="motion-preview-card" visual={visual} />
      <div className="algorithm-card-body">
        <div>
          <p className="eyebrow">{algorithm.family}</p>
          <h2>{algorithm.name_ja}</h2>
        </div>
        <p>{visual?.what_user_should_notice ?? algorithm.tradeoffs}</p>
        <div className="chip-list">
          {(algorithm.good_for ?? []).slice(0, 3).map((id) => (
            <Badge key={id} tone="active">{labelFor(id)}</Badge>
          ))}
        </div>
      </div>
    </a>
  );
}

export function AlgorithmsView() {
  const [family, setFamily] = useState("all");
  const families = useMemo(() => ["all", ...new Set(data.algorithms.map((algorithm) => algorithm.family))], []);
  const algorithms = useMemo(
    () => (family === "all" ? data.algorithms : data.algorithms.filter((algorithm) => algorithm.family === family)),
    [family],
  );

  return (
    <div className="view-stack">
      <PageHeader
        action={<Badge tone="idle">{algorithms.length} / {data.algorithms.length} 件</Badge>}
        eyebrow="Algorithm Motion Gallery"
        title="手法の動きを見る"
      >
        手法名から入り、何が動き、どこを見るべきかを motion preview で確認します。
      </PageHeader>

      <section className="panel list-panel">
        <div className="toolbar-row toolbar-row-two">
          <label className="filter-box">
            <IconPlayerPlay aria-hidden="true" size={16} />
            <select aria-label="Algorithm family" onChange={(event) => setFamily(event.target.value)} value={family}>
              {families.map((item) => (
                <option key={item} value={item}>{item === "all" ? "すべての family" : item}</option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            <ButtonLink href="#/stories" icon={IconRoute}>SolveStory から見る</ButtonLink>
          </div>
        </div>
      </section>

      <section className="algorithm-grid">
        {algorithms.map((algorithm) => (
          <AlgorithmCard algorithm={algorithm} key={algorithm.id} />
        ))}
      </section>
    </div>
  );
}

export function AlgorithmDetailView({ algorithmId }) {
  const algorithm = maps.algorithms[algorithmId] ?? data.algorithms[0];
  const visual = getVisualForAlgorithm(algorithm.id);
  const relatedStories = data.solveStories.filter((story) => story.candidate_algorithms.includes(algorithm.id)).slice(0, 8);
  const relatedProblems = (algorithm.good_for ?? []).map((id) => maps.problems[id]).filter(Boolean);
  const [copied, setCopied] = useState(false);

  const copyBrief = async () => {
    await navigator.clipboard.writeText(visual.ai_coding_brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="article-layout">
      <article className="view-stack">
        <PageHeader
          action={<ButtonLink href="#/algorithms" icon={IconPlayerPlay}>一覧へ戻る</ButtonLink>}
          eyebrow="Algorithm"
          title={algorithm.name_ja}
        >
          {algorithm.tradeoffs}
        </PageHeader>

        <section className="panel algorithm-hero">
          <MotionPreview visual={visual} />
          <div className="algorithm-hero-copy">
            <p className="eyebrow">{algorithm.family}</p>
            <h2>{visual.title}</h2>
            <dl className="detail-dl">
              <div>
                <dt>動くもの</dt>
                <dd>{visual.what_moves}</dd>
              </div>
              <div>
                <dt>見るべきところ</dt>
                <dd>{visual.what_user_should_notice}</dd>
              </div>
              <div>
                <dt>学習目標</dt>
                <dd>{visual.learning_goal}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="split-section">
          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Good For</p>
                <h2>向いている問題タイプ</h2>
              </div>
            </div>
            <div className="case-link-list">
              {relatedProblems.map((problem) => (
                <a href={`#/problems/${problem.id}`} key={problem.id}>
                  <strong>{problem.name_ja}</strong>
                  <span>{problem.summary}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Pseudo Code</p>
                <h2>動きの手順</h2>
              </div>
            </div>
            <ol className="ordered-list">
              {visual.pseudo_code.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AI Coding Brief</p>
              <h2>visual 実装に渡す指示</h2>
            </div>
            <IconButton icon={IconCopy} onClick={copyBrief} title="brief をコピー">{copied ? "コピー済み" : "コピー"}</IconButton>
          </div>
          <pre className="brief-preview">{visual.ai_coding_brief}</pre>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SolveStory</p>
              <h2>この手法を使う story</h2>
            </div>
            <Badge tone="idle">{relatedStories.length} 件</Badge>
          </div>
          <div className="story-mini-grid">
            {relatedStories.map((story) => (
              <a className="story-mini-card" href={`#/stories/${story.id}`} key={story.id}>
                <strong>{story.title}</strong>
                <span>{labelFor(story.primary_problem_class)}</span>
              </a>
            ))}
          </div>
        </section>
      </article>

      <aside className="article-rail">
        <section className="panel">
          <p className="eyebrow">Related</p>
          <div className="action-list">
            {(algorithm.good_for ?? []).slice(0, 4).map((problemId) => (
              <ButtonLink href={`#/problems/${problemId}`} key={problemId}>{labelFor(problemId)}</ButtonLink>
            ))}
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">Story Samples</p>
          <div className="action-list">
            {relatedStories.slice(0, 4).map((story) => (
              <ButtonLink href={`#/stories/${story.id}`} key={story.id}>{story.title}</ButtonLink>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
