import {
  IconAlertTriangle,
  IconArrowsDiff,
  IconBook2,
  IconChartDots,
  IconCircleCheck,
  IconRoute,
} from "@tabler/icons-react";

import { OptimizationGlyph } from "../components/OptimizationGlyph.jsx";
import {
  axisValueLabel,
  getDefaultComparison,
  getProblemCases,
  getRelated,
  getStoriesForProblem,
  labelFor,
  maps,
  relationLabels,
  relationTones,
} from "../data/loadData.js";
import { AxisGrid, Badge, ButtonLink, PageHeader, ProblemCard, SourcesList } from "../components/ui.jsx";

function InfoBlock({ icon: Icon, title, items, tone }) {
  return (
    <section className={`info-block info-block-${tone}`}>
      <div className="info-block-title">
        <Icon aria-hidden="true" size={18} />
        <h2>{title}</h2>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ReferenceColumn({ title, ids, tone }) {
  return (
    <section className="reference-column">
      <h2>{title}</h2>
      <div className="chip-list">
        {ids.map((id) => (
          <Badge key={id} tone={tone}>{labelFor(id)}</Badge>
        ))}
      </div>
    </section>
  );
}

function buildModelingRows(problem) {
  const axes = problem.axes ?? {};
  const tags = new Set(problem.tags ?? []);
  const variableByDomain = {
    binary: "0/1 の選択や on/off を決める",
    continuous: "数量、配分、価格などの連続量を決める",
    integer: "人数、台数、個数のような整数量を決める",
    permutation: "順序、経路、対応づけの組合せを決める",
  };
  const objective = axes.objective_structure === "feasibility" || tags.has("feasibility")
    ? "目的値よりも、条件を満たす割当や構成を見つける"
    : `${problem.name_ja} としてコスト、損失、リスク、距離などを小さくする`;
  const constraints = axes.constraint_structure === "logical" || tags.has("logical")
    ? "依存、排他、順序、必須条件などの論理制約を守る"
    : "容量、予算、資源、上限下限、物理条件などを守る";
  const uncertainty = axes.uncertainty_representation
    ? `${axisValueLabel("uncertainty_representation", axes.uncertainty_representation)} として不確実性を読む`
    : axes.time_structure
      ? `${axisValueLabel("time_structure", axes.time_structure)} の時間構造として読む`
      : "まず入力データを固定し、後から感度やシナリオを確認する";
  const outputByGuarantee = {
    approximate: "良い解、近似解、探索ログを見て採用判断する",
    exact: "最適性が説明できる解と、制約を満たす根拠を得る",
    gap_bound: "実行可能解と bound / gap を見て止め時を判断する",
  };

  return [
    ["変数", variableByDomain[axes.variable_domain] ?? "意思決定として動かせる量や選択を決める"],
    ["目的", objective],
    ["制約", constraints],
    ["不確実性 / 時間", uncertainty],
    ["出力", outputByGuarantee[axes.solution_guarantee] ?? "候補解と、その前提・制約違反の有無を確認する"],
  ];
}

function ModelingBridge({ problem }) {
  const rows = buildModelingRows(problem);

  return (
    <section className="modeling-bridge" aria-label="定式化の読み替え">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Modeling Bridge</p>
          <h3>現実課題から数式へ</h3>
        </div>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {problem.id === "linear_programming" && (
        <p className="tiny-example">
          例: 製品A/Bの生産量を変数にし、材料量と設備時間を制約、利益を目的にして配分を決める。
        </p>
      )}
    </section>
  );
}

export function ProblemDetailView({ problemId }) {
  const problem = maps.problems[problemId] ?? maps.problems.linear_programming;
  const comparison = getDefaultComparison(problem.id);
  const related = getRelated(problem.id).slice(0, 9);
  const cases = getProblemCases(problem.id).slice(0, 4);
  const stories = getStoriesForProblem(problem.id).slice(0, 4);
  const sourceTypes = [...new Set(problem.sources.map((source) => source.type))];

  return (
    <div className="article-layout">
      <article className="view-stack">
        <PageHeader
          action={<ButtonLink href={`#/compare/${comparison.leftId}/${comparison.rightId}`} icon={IconArrowsDiff}>比較する</ButtonLink>}
          eyebrow="Problem Type"
          title={problem.name_ja}
        >
          {problem.summary}
        </PageHeader>

        <section className="panel problem-article-hero">
          <OptimizationGlyph problem={problem} variant="hero" />
          <div className="article-intro">
            <p className="eyebrow">{problem.name_en}</p>
            <h2>どんな形の問題か</h2>
            <p>{problem.definition}</p>
            <div className="trust-strip" aria-label="根拠">
              <Badge tone="idle">{problem.sources.length} sources</Badge>
              {sourceTypes.slice(0, 3).map((type) => (
                <Badge key={type}>{type}</Badge>
              ))}
            </div>
            <ModelingBridge problem={problem} />
            <div className="formula-card">
              <span>canonical form</span>
              <code>{problem.canonical_form}</code>
            </div>
          </div>
        </section>

        <AxisGrid problem={problem} />

        <section className="decision-grid">
          <InfoBlock icon={IconCircleCheck} items={problem.typical_when} title="使う場面" tone="done" />
          <InfoBlock icon={IconAlertTriangle} items={problem.not_good_when} title="避ける場面" tone="blocked" />
          <InfoBlock icon={IconChartDots} items={[problem.why_hard]} title="難しさ" tone="review" />
        </section>

        <section className="panel route-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Next Step</p>
              <h2>解き方へつなぐ</h2>
            </div>
            <div className="inline-actions">
              {stories[0] && <ButtonLink href={`#/stories/${stories[0].id}`} icon={IconRoute}>小さく解く</ButtonLink>}
              <ButtonLink href={cases[0] ? `#/paths/${cases[0].id}` : "#/cases"} icon={IconRoute}>近いケースで見る</ButtonLink>
            </div>
          </div>
          <div className="reference-grid">
            <ReferenceColumn ids={problem.candidate_algorithms} title="Algorithm" tone="active" />
            <ReferenceColumn ids={problem.candidate_solvers} title="Solver / Library" tone="done" />
            <ReferenceColumn ids={problem.relaxations_or_reformulations} title="緩和・変換" tone="review" />
          </div>
        </section>

        {stories.length > 0 && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Visual Demo</p>
                <h2>小さく解いてみる</h2>
              </div>
              <ButtonLink href="#/stories">SolveStory一覧</ButtonLink>
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
        )}

        {cases.length > 0 && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Used In</p>
                <h2>このタイプに近いケース</h2>
              </div>
              <ButtonLink href="#/cases">ケース一覧</ButtonLink>
            </div>
            <div className="case-link-list">
              {cases.map((example) => (
                <a href={`#/cases/${example.id}`} key={example.id}>
                  <strong>{example.title}</strong>
                  <span>{example.narrative}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Relations</p>
              <h2>周辺のつながり</h2>
            </div>
            <Badge tone="idle">{related.length} 件</Badge>
          </div>
          <div className="relation-grid">
            {related.map((relation) => (
              <article className="relation-card" key={relation.id}>
                <Badge tone={relationTones[relation.type] ?? "neutral"}>{relationLabels[relation.type] ?? relation.type}</Badge>
                <strong>{labelFor(relation.source)} to {labelFor(relation.target)}</strong>
                <p>{relation.explanation}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sources</p>
              <h2>根拠を確認する</h2>
            </div>
            <Badge tone="idle">{problem.sources.length} 件</Badge>
          </div>
          <SourcesList sources={problem.sources} />
        </section>
      </article>

      <aside className="article-rail">
        <section className="panel">
          <p className="eyebrow">Next</p>
          <div className="action-list">
            {stories[0] && <ButtonLink href={`#/stories/${stories[0].id}`} icon={IconRoute}>小さく解いてみる</ButtonLink>}
            <ButtonLink href={`#/compare/${comparison.leftId}/${comparison.rightId}`} icon={IconArrowsDiff}>似た概念と比較する</ButtonLink>
            <ButtonLink href={cases[0] ? `#/paths/${cases[0].id}` : "#/cases"} icon={IconRoute}>近いケースで見る</ButtonLink>
            <ButtonLink href="#/diagnosis" icon={IconBook2}>条件から診断する</ButtonLink>
          </div>
        </section>

        {problem.confused_with?.length > 0 && (
          <section className="panel">
            <p className="eyebrow">Compare next</p>
            <div className="problem-list">
              {problem.confused_with.slice(0, 3).map((id) => maps.problems[id]).filter(Boolean).map((item) => (
                <ProblemCard compact key={item.id} problem={item} />
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
