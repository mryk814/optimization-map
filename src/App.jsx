import { useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconArrowsDiff,
  IconBook2,
  IconChartDots,
  IconCircleCheck,
  IconClipboard,
  IconDownload,
  IconFilter,
  IconGitBranch,
  IconInfoCircle,
  IconMap,
  IconRoute,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";

import { OptimizationGlyph } from "./components/OptimizationGlyph.jsx";
import { data, downloadCsv, getRelated, labelFor, maps, scoreDiagnosis, toTsv } from "./data/loadData.js";

const tableColumns = [
  { label: "ID", value: (item) => item.id },
  { label: "ProblemClass", value: (item) => item.name_ja },
  { label: "Summary", value: (item) => item.summary },
  { label: "Tags", value: (item) => item.tags.join(" / ") },
  { label: "Algorithms", value: (item) => item.candidate_algorithms.map(labelFor).join(" / ") },
  { label: "Solvers", value: (item) => item.candidate_solvers.map(labelFor).join(" / ") },
];

const relationLabels = {
  is_a: "上位関係",
  overlaps_with: "重なる領域",
  confused_with: "混同注意",
  relaxes_to: "緩和",
  reformulates_to: "変換",
  commonly_solved_by: "手法",
  implemented_by: "実装",
  used_in: "用途",
};

const relationTones = {
  confused_with: "blocked",
  relaxes_to: "review",
  reformulates_to: "review",
  commonly_solved_by: "active",
  implemented_by: "done",
  used_in: "done",
};

function axisValueLabel(axisId, valueId) {
  if (!valueId) {
    return "—";
  }
  const axis = maps.axes[axisId];
  const value = axis?.values.find((item) => item.id === valueId);
  return value?.name_ja ?? valueId;
}

function findComparisonGuidance(leftId, rightId) {
  const relation = data.relations.find(
    (item) =>
      item.type === "confused_with" &&
      ((item.source === leftId && item.target === rightId) || (item.source === rightId && item.target === leftId)),
  );
  if (!relation?.decision_note) {
    return null;
  }

  const reversed = relation.source !== leftId;
  return {
    shared: relation.shared,
    decisionAxes: relation.decision_axes ?? [],
    leftChoice: reversed ? relation.choose_target_when : relation.choose_source_when,
    rightChoice: reversed ? relation.choose_source_when : relation.choose_target_when,
    note: relation.decision_note,
  };
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function IconButton({ children, icon: Icon, onClick, variant = "secondary", title }) {
  return (
    <button className={`button button-${variant}`} onClick={onClick} title={title} type="button">
      <Icon aria-hidden="true" size={16} />
      <span>{children}</span>
    </button>
  );
}

const readingSteps = [
  { id: "diagnosis", label: "診断", tool: "diagnosis" },
  { id: "map", label: "形を見る", tool: "map" },
  { id: "compare", label: "比較する", tool: "compare" },
  { id: "export", label: "持ち出す", tool: "export" },
];

const currentStepByTool = {
  cases: "diagnosis",
  compare: "compare",
  diagnosis: "diagnosis",
  export: "export",
  map: "map",
};

function OverviewHero({ activeTool, selected, setActiveTool }) {
  const currentStep = currentStepByTool[activeTool] ?? "diagnosis";

  return (
    <header className="topbar">
      <div className="hero-copy">
        <p className="eyebrow">Optimization Map</p>
        <h1>課題から問題クラスへ進む地図</h1>
        <p>まず課題の条件か近いケースから候補を出し、{selected.name_ja} の形・使いどころ・次の手法へ進みます。</p>
      </div>
      <div className="reading-steps" aria-label="読む順番">
        {readingSteps.map((step, index) => (
          <button
            aria-current={currentStep === step.id ? "step" : undefined}
            className={currentStep === step.id ? "is-current" : ""}
            key={step.id}
            onClick={() => setActiveTool(step.tool)}
            type="button"
          >
            <strong>{index + 1}</strong>
            {step.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function ProblemCard({ problem, selected, onSelect }) {
  const axisSummary = Object.entries(problem.axes ?? {})
    .slice(0, 3)
    .map(([axisId, valueId]) => axisValueLabel(axisId, valueId));

  return (
    <button
      aria-current={selected ? "true" : undefined}
      className={`problem-row${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(problem.id)}
      title={problem.summary}
      type="button"
    >
      <OptimizationGlyph problem={problem} variant="list" />
      <span className="problem-row-main">
        <strong>{problem.name_ja}</strong>
        <span>{problem.name_en}</span>
      </span>
      <span className="problem-row-tags">
        {axisSummary.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </span>
    </button>
  );
}

function Sidebar({ axisFilter, filteredProblems, onAxisFilter, onCopy, onExport, onQuery, onSelect, query, selectedId }) {
  const filterOptions = useMemo(() => {
    const values = new Map([["all", "すべて"]]);
    for (const axis of data.axes.filter((item) => item.core)) {
      for (const value of axis.values) {
        values.set(value.id, `${axis.name_ja}: ${value.name_ja}`);
      }
    }
    return [...values.entries()];
  }, []);

  return (
    <aside className="panel sidebar" aria-label="ProblemClass 一覧">
      <div className="sidebar-head">
        <div>
          <p className="eyebrow">Browse</p>
          <h2>ProblemClass</h2>
        </div>
        <Badge tone="idle">{filteredProblems.length} 件</Badge>
      </div>

      <div className="toolbar">
        <label className="search-box">
          <IconSearch aria-hidden="true" size={16} />
          <input
            aria-label="ProblemClass を検索"
            onChange={(event) => onQuery(event.target.value)}
            placeholder="検索"
            type="search"
            value={query}
          />
        </label>
        <label className="filter-box">
          <IconFilter aria-hidden="true" size={16} />
          <select aria-label="分類軸で絞り込み" onChange={(event) => onAxisFilter(event.target.value)} value={axisFilter}>
            {filterOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="list-actions">
        <IconButton icon={IconClipboard} onClick={onCopy} title="一覧をTSVでコピー">コピー</IconButton>
        <IconButton icon={IconDownload} onClick={onExport} title="一覧をCSVで保存">CSV</IconButton>
      </div>

      <div className="problem-list">
        {filteredProblems.length === 0 ? (
          <div className="empty-state">条件に合う ProblemClass はありません。検索語か filter を変えてください。</div>
        ) : (
          filteredProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              onSelect={onSelect}
              problem={problem}
              selected={selectedId === problem.id}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function DetailPanel({ problem }) {
  const relations = getRelated(problem.id);
  const axisCards = Object.entries(problem.axes ?? {}).map(([axisId, valueId]) => ({
    id: `${axisId}:${valueId}`,
    axis: maps.axes[axisId]?.name_ja ?? axisId,
    value: axisValueLabel(axisId, valueId),
  }));

  return (
    <section className="panel detail-panel" aria-labelledby="detail-heading">
      <div className="detail-hero">
        <OptimizationGlyph problem={problem} variant="hero" />
        <div className="detail-title">
          <p className="eyebrow">ProblemClass</p>
          <h2 id="detail-heading">{problem.name_ja}</h2>
          <p>{problem.summary}</p>
        </div>
        <div className="formula-card">
          <span>canonical form</span>
          <code>{problem.canonical_form}</code>
        </div>
      </div>

      <div className="axis-ribbon" aria-label="分類軸">
        {axisCards.map((axis) => (
          <div className="axis-chip" key={axis.id}>
            <span>{axis.axis}</span>
            <strong>{axis.value}</strong>
          </div>
        ))}
      </div>

      <details className="definition-fold">
        <summary>
          <IconBook2 aria-hidden="true" size={16} />
          定義と判断メモを読む
        </summary>
        <p>{problem.definition}</p>
      </details>

      <details className="route-fold">
        <summary>
          <IconRoute aria-hidden="true" size={16} />
          問題から solver までの流れを開く
        </summary>
        <VisualRoute problem={problem} />
      </details>

      <div className="decision-grid">
        <InfoList icon={IconCircleCheck} title="使う場面" items={problem.typical_when} tone="done" />
        <InfoList icon={IconAlertTriangle} title="避ける場面" items={problem.not_good_when} tone="blocked" />
        <InfoList icon={IconChartDots} title="難しさ" items={[problem.why_hard]} tone="review" />
      </div>

      <div className="route-card">
        <div className="route-card-head">
          <div>
            <p className="eyebrow">Route</p>
            <h3>次に見る候補</h3>
          </div>
          <IconRoute aria-hidden="true" size={20} />
        </div>
        <div className="route-lanes">
          <ReferenceBlock title="Algorithm" items={problem.candidate_algorithms} tone="active" />
          <ReferenceBlock title="Solver / Library" items={problem.candidate_solvers} tone="done" />
          <ReferenceBlock title="緩和・変換" items={problem.relaxations_or_reformulations} tone="review" />
        </div>
      </div>

      <RelationCards currentId={problem.id} relations={relations} />

      <details className="sources source-fold">
        <summary>
          <span>Sources</span>
          <Badge tone="idle">{problem.sources.length} 件</Badge>
        </summary>
        {problem.sources.map((source) => (
          <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
            {source.title}
            <span>{source.type}</span>
          </a>
        ))}
      </details>
    </section>
  );
}

function VisualRoute({ problem }) {
  const axes = Object.entries(problem.axes ?? {})
    .slice(0, 4)
    .map(([axisId, valueId]) => axisValueLabel(axisId, valueId));
  const algorithms = problem.candidate_algorithms.slice(0, 3).map(labelFor);
  const solvers = problem.candidate_solvers.slice(0, 3).map(labelFor);

  return (
    <div className="visual-route" aria-label="問題の形から solver までの流れ">
      <div className="visual-stage visual-stage-input">
        <span>問題の形</span>
        <strong>{axes[0] ?? "未分類"}</strong>
        <div className="mini-chip-list">
          {axes.slice(1).map((label) => (
            <em key={label}>{label}</em>
          ))}
        </div>
      </div>
      <div className="visual-link" aria-hidden="true"><span /></div>
      <div className="visual-stage visual-stage-current">
        <span>候補クラス</span>
        <strong>{problem.name_ja}</strong>
        <div className="visual-pulse" aria-hidden="true" />
      </div>
      <div className="visual-link" aria-hidden="true"><span /></div>
      <div className="visual-stage visual-stage-output">
        <span>解き方</span>
        <strong>{algorithms[0] ?? "Algorithm"}</strong>
        <div className="mini-chip-list">
          {algorithms.slice(1).map((label) => (
            <em key={label}>{label}</em>
          ))}
        </div>
      </div>
      <div className="visual-link" aria-hidden="true"><span /></div>
      <div className="visual-stage visual-stage-solver">
        <span>実装先</span>
        <strong>{solvers[0] ?? "Solver"}</strong>
        <div className="mini-chip-list">
          {solvers.slice(1).map((label) => (
            <em key={label}>{label}</em>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoList({ icon: Icon, title, items, tone = "neutral" }) {
  return (
    <details className={`info-list info-list-${tone}`}>
      <summary>
        {Icon && <Icon aria-hidden="true" size={16} />}
        <span>{title}</span>
        <Badge tone={tone}>{items.length} 件</Badge>
      </summary>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  );
}

function ReferenceBlock({ title, items, tone = "neutral" }) {
  return (
    <div className="reference-block">
      <h3>{title}</h3>
      <div className="chip-list">
        {items.map((id) => (
          <Badge key={id} tone={tone}>{labelFor(id)}</Badge>
        ))}
      </div>
    </div>
  );
}

function RelationCards({ relations, currentId }) {
  if (!relations.length) {
    return <div className="empty-state">relation はまだありません。</div>;
  }

  return (
    <details className="relation-section relation-fold">
      <summary className="section-title">
        <p className="eyebrow">Relations</p>
        <h3>周辺のつながりを開く</h3>
        <Badge tone="idle">{relations.length} 件</Badge>
      </summary>
      <div className="relation-cards">
        {relations.slice(0, 9).map((relation) => {
          const tone = relationTones[relation.type] ?? "neutral";
          const isOutgoing = relation.source === currentId;
          const primary = labelFor(isOutgoing ? relation.target : relation.source);
          return (
            <article className="relation-card" key={relation.id}>
              <RelationGlyph type={relation.type} />
              <div className="relation-card-top">
                <Badge tone={tone}>{relationLabels[relation.type] ?? relation.type}</Badge>
                <span>{isOutgoing ? "from this class" : "to this class"}</span>
              </div>
              <div className="relation-node-line">
                <strong>{labelFor(relation.source)}</strong>
                <IconArrowRight aria-hidden="true" size={16} />
                <strong>{labelFor(relation.target)}</strong>
              </div>
              <details className="relation-detail">
                <summary>説明</summary>
                <p>{relation.explanation}</p>
              </details>
              <span className="relation-primary">{primary}</span>
            </article>
          );
        })}
      </div>
    </details>
  );
}

function StartPanel({ activeTool, selected, setActiveTool }) {
  const sampleCases = data.exampleCases.slice(0, 3);

  return (
    <section className="panel start-panel" aria-labelledby="start-heading">
      <div className="start-copy">
        <p className="eyebrow">Start</p>
        <h2 id="start-heading">まず課題の入口を選ぶ</h2>
        <p>問題名を知らなくても、条件に答えるか近いケースを眺めるところから始められます。</p>
      </div>
      <div className="start-options">
        <button
          className={`start-option start-option-primary${activeTool === "diagnosis" ? " is-active" : ""}`}
          onClick={() => setActiveTool("diagnosis")}
          type="button"
        >
          <span>条件から候補を出す</span>
          <strong>変数・線形性・不確実性を答える</strong>
          <IconArrowRight aria-hidden="true" size={16} />
        </button>
        <button
          className={`start-option${activeTool === "cases" ? " is-active" : ""}`}
          onClick={() => setActiveTool("cases")}
          type="button"
        >
          <span>近いケースから入る</span>
          <strong>{sampleCases.map((example) => example.title).join(" / ")}</strong>
          <IconArrowRight aria-hidden="true" size={16} />
        </button>
        <button
          className={`start-option${activeTool === "map" ? " is-active" : ""}`}
          onClick={() => setActiveTool("map")}
          type="button"
        >
          <span>現在の候補を理解する</span>
          <strong>{selected.name_ja} から algorithm と solver まで見る</strong>
          <IconArrowRight aria-hidden="true" size={16} />
        </button>
      </div>
    </section>
  );
}

function RelationGlyph({ type }) {
  return (
    <span className={`relation-glyph relation-glyph-${type}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function ComparePanel({ leftId, rightId, onLeftChange, onRightChange }) {
  const left = maps.problems[leftId];
  const right = maps.problems[rightId];
  const guidance = findComparisonGuidance(leftId, rightId);
  const axisKeys = [...new Set([...Object.keys(left.axes ?? {}), ...Object.keys(right.axes ?? {})])];
  const axisDiffs = axisKeys
    .filter((key) => left.axes?.[key] !== right.axes?.[key])
    .slice(0, 6)
    .map((key) => ({
      id: key,
      axis: maps.axes[key]?.name_ja ?? key,
      left: axisValueLabel(key, left.axes?.[key]),
      right: axisValueLabel(key, right.axes?.[key]),
    }));
  const rows = [
    ["定義", left.definition, right.definition],
    ["使う場面", left.typical_when.join(" / "), right.typical_when.join(" / ")],
    ["避ける場面", left.not_good_when.join(" / "), right.not_good_when.join(" / ")],
    ["難しさ", left.why_hard, right.why_hard],
    ["手法", left.candidate_algorithms.map(labelFor).join(" / "), right.candidate_algorithms.map(labelFor).join(" / ")],
    ["Solver", left.candidate_solvers.map(labelFor).join(" / "), right.candidate_solvers.map(labelFor).join(" / ")],
  ];

  return (
    <section className="panel compare-panel" aria-labelledby="compare-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Compare</p>
          <h2 id="compare-heading">比較</h2>
        </div>
        <IconArrowsDiff aria-hidden="true" size={20} />
      </div>
      <div className="compare-selects">
        <select aria-label="左の ProblemClass" value={leftId} onChange={(event) => onLeftChange(event.target.value)}>
          {data.problemClasses.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.name_ja}
            </option>
          ))}
        </select>
        <select aria-label="右の ProblemClass" value={rightId} onChange={(event) => onRightChange(event.target.value)}>
          {data.problemClasses.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.name_ja}
            </option>
          ))}
        </select>
      </div>
      <div className="compare-visual-grid">
        <CompareFace problem={left} />
        <div className="compare-diff-card">
          <p className="eyebrow">Difference</p>
          <div className="compare-diff-list">
            {axisDiffs.length === 0 ? (
              <span className="muted-line">主要軸は近い構造です。</span>
            ) : (
              axisDiffs.map((diff) => (
                <div className="axis-diff" key={diff.id}>
                  <span>{diff.axis}</span>
                  <strong>{diff.left}</strong>
                  <IconArrowRight aria-hidden="true" size={14} />
                  <strong>{diff.right}</strong>
                </div>
              ))
            )}
          </div>
        </div>
        <CompareFace problem={right} />
      </div>
      {guidance ? (
        <div className="choice-guide" aria-label="どちらを選ぶか">
          <div className="choice-guide-main">
            <p className="eyebrow">Decision</p>
            <h3>どちらを選ぶか</h3>
            <p>{guidance.note}</p>
          </div>
          <div className="choice-guide-card">
            <span>同じところ</span>
            <strong>{guidance.shared}</strong>
          </div>
          <div className="choice-guide-card">
            <span>違うところ</span>
            <ul>
              {guidance.decisionAxes.map((axis) => (
                <li key={axis}>{axis}</li>
              ))}
            </ul>
          </div>
          <div className="choice-guide-card">
            <span>{left.name_ja} を選ぶ</span>
            <strong>{guidance.leftChoice}</strong>
          </div>
          <div className="choice-guide-card">
            <span>{right.name_ja} を選ぶ</span>
            <strong>{guidance.rightChoice}</strong>
          </div>
        </div>
      ) : (
        <div className="choice-guide choice-guide-empty">
          <div className="choice-guide-main">
            <p className="eyebrow">Decision</p>
            <h3>任意比較</h3>
            <p>このペアは詳細な判断軸データがまだありません。まず定義、使う場面、避ける場面、手法を並べて確認します。</p>
          </div>
        </div>
      )}
      <details className="compare-detail">
        <summary>詳細テーブルを開く</summary>
        <div className="table-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th>軸</th>
                <th>{left.name_ja}</th>
                <th>{right.name_ja}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, leftValue, rightValue]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{leftValue}</td>
                  <td>{rightValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function CompareFace({ problem }) {
  return (
    <article className="compare-face">
      <OptimizationGlyph problem={problem} variant="compare" />
      <h3>{problem.name_ja}</h3>
      <div className="chip-list">
        {problem.candidate_algorithms.slice(0, 2).map((id) => (
          <Badge key={id} tone="active">{labelFor(id)}</Badge>
        ))}
      </div>
    </article>
  );
}

function DiagnosisPanel({ answers, onAnswer, onReset, onSelectProblem }) {
  const results = scoreDiagnosis(answers).slice(0, 5);
  const answered = Object.keys(answers).length;
  const maxScore = Math.max(...results.map((result) => result.score), 1);
  const warnings = [...new Set(results.flatMap((result) => result.warnings ?? []))];
  const nextQuestions = data.diagnosisQuestions
    .filter((question) => !answers[question.id])
    .slice(0, 2)
    .map((question) => question.label);

  return (
    <section className="panel diagnosis-panel" aria-labelledby="diagnosis-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Diagnosis</p>
          <h2 id="diagnosis-heading">モデリング診断</h2>
        </div>
        <div className="heading-actions">
          <Badge tone={answered ? "active" : "idle"}>{answered} / {data.diagnosisQuestions.length}</Badge>
          {answered > 0 && (
            <button className="text-button" onClick={onReset} type="button">
              クリア
            </button>
          )}
        </div>
      </div>

      <div className="diagnosis-grid">
        <div className="questions">
          {data.diagnosisQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend>{question.label}</legend>
              <div className="segmented">
                {question.answers.map((answer) => (
                  <label key={answer.id}>
                    <input
                      checked={answers[question.id] === answer.id}
                      name={question.id}
                      onChange={() => onAnswer(question.id, answer.id)}
                      type="radio"
                    />
                    <span>{answer.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="diagnosis-results" role="status" aria-live="polite">
          {results.length === 0 ? (
            <div className="empty-state">回答すると候補 ProblemClass が表示されます。</div>
          ) : (
            <>
              {warnings.map((warning) => (
                <div className="warning-state" key={warning}>{warning}</div>
              ))}
              {results.map((result, index) => {
                if (!result.problem) {
                  return (
                    <article className="result-row result-warning-card" key={result.id}>
                      <IconAlertTriangle aria-hidden="true" size={22} />
                      <div>
                        <strong>{result.label}</strong>
                        <span className="result-reason-line">{result.reasons.join(" / ")}</span>
                        <span className="result-caveat">最適化モデルへ進む前に、意思決定変数・目的・制約を文章で切り分けてください。</span>
                        <span className="score-meter">
                          <span style={{ width: `${Math.round((result.score / maxScore) * 100)}%` }} />
                        </span>
                      </div>
                      <span className="rank num">{index + 1}</span>
                    </article>
                  );
                }

                const algorithms = result.problem.candidate_algorithms.slice(0, 3).map(labelFor);
                const solvers = result.problem.candidate_solvers.slice(0, 3).map(labelFor);
                const caveats = result.problem.not_good_when.slice(0, 2);
                return (
                  <button
                    className="result-row result-card"
                    key={result.id}
                    onClick={() => onSelectProblem(result.id)}
                    type="button"
                  >
                    <OptimizationGlyph problem={result.problem} variant="result" />
                    <div>
                      <span className="result-title-line">
                        <strong>{result.label}</strong>
                        <em className="num">score {result.score}</em>
                      </span>
                      <span className="result-reason-line">{result.reasons.slice(0, 3).join(" / ")}</span>
                      <span className="score-meter">
                        <span style={{ width: `${Math.round((result.score / maxScore) * 100)}%` }} />
                      </span>
                      <span className="result-detail-grid">
                        <span><b>Algorithm</b>{algorithms.join(" / ")}</span>
                        <span><b>Solver</b>{solvers.join(" / ")}</span>
                        <span><b>注意点</b>{caveats.join(" / ")}</span>
                        <span><b>次に確認</b>{nextQuestions.join(" / ") || "詳細カードで前提を確認"}</span>
                      </span>
                      {result.reasons.length > 3 && (
                        <span className="result-more">+{result.reasons.length - 3} reasons</span>
                      )}
                    </div>
                    <span className="rank num">{index + 1}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MapPanel({ selected }) {
  const relationCounts = ["is_a", "overlaps_with", "confused_with", "relaxes_to", "commonly_solved_by", "implemented_by", "used_in"]
    .map((type) => ({
      type,
      count: data.relations.filter((relation) => relation.type === type).length,
    }));

  return (
    <section className="panel map-panel" aria-labelledby="map-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Map</p>
          <h2 id="map-heading">課題から solver までの見取り図</h2>
        </div>
        <IconMap aria-hidden="true" size={20} />
      </div>
      <div className="pipeline">
        {["現実課題", "モデル構造", selected.name_ja, "Algorithm", "Solver"].map((step, index) => (
          <span className={index === 2 ? "is-current" : ""} key={`${step}-${index}`}>
            {step}
          </span>
        ))}
      </div>
      <div className="motion-hint" aria-label="理解の流れ">
        <IconInfoCircle aria-hidden="true" size={16} />
        <span>まず形を見て、候補クラスを選び、手法と solver に降ろす。</span>
        <i aria-hidden="true" />
      </div>
      <div className="map-grid">
        {relationCounts.map((item) => (
          <div className="map-tile" key={item.type}>
            <span>{relationLabels[item.type] ?? item.type}</span>
            <strong className="num">{item.count}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickCompare({ selected, onSelectCompare }) {
  const confused = selected.confused_with.slice(0, 3);
  if (!confused.length) {
    return null;
  }

  return (
    <section className="panel quick-compare" aria-labelledby="quick-compare-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Compare next</p>
          <h2 id="quick-compare-heading">混同しやすい相手</h2>
        </div>
        <IconArrowsDiff aria-hidden="true" size={20} />
      </div>
      <div className="quick-compare-list">
        {confused.map((id) => (
          <button key={id} onClick={() => onSelectCompare(id)} type="button">
            <span>{labelFor(id)}</span>
            <IconArrowRight aria-hidden="true" size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}

const toolTabs = [
  { id: "diagnosis", label: "診断", eyebrow: "Decide" },
  { id: "compare", label: "比較", eyebrow: "Compare" },
  { id: "map", label: "見取り図", eyebrow: "Map" },
  { id: "cases", label: "ケース", eyebrow: "Cases" },
  { id: "export", label: "持ち出し", eyebrow: "Export" },
];

function ToolDock({
  activeTool,
  answers,
  compareLeft,
  compareRight,
  filteredCount,
  onAnswer,
  onCopy,
  onExport,
  onReset,
  onSelectProblem,
  selected,
  setActiveTool,
  setCompareLeft,
  setCompareRight,
}) {
  return (
    <section className="tool-dock" aria-label="補助ツール">
      <div className="tool-dock-head">
        <div>
          <p className="eyebrow">{toolTabs.find((tab) => tab.id === activeTool)?.eyebrow}</p>
          <h2>必要な時だけ開く道具</h2>
        </div>
        <div className="tool-tabs" role="tablist" aria-label="補助ツールを切り替え">
          {toolTabs.map((tab) => (
            <button
              aria-selected={activeTool === tab.id}
              className={activeTool === tab.id ? "is-active" : ""}
              key={tab.id}
              onClick={() => setActiveTool(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-panel" role="tabpanel">
        {activeTool === "diagnosis" && (
          <DiagnosisPanel
            answers={answers}
            onAnswer={onAnswer}
            onReset={onReset}
            onSelectProblem={onSelectProblem}
          />
        )}
        {activeTool === "compare" && (
          <ComparePanel
            leftId={compareLeft}
            onLeftChange={setCompareLeft}
            onRightChange={setCompareRight}
            rightId={compareRight}
          />
        )}
        {activeTool === "map" && (
          <div className="tool-stack">
            <MapPanel selected={selected} />
            <PipelinePanel />
          </div>
        )}
        {activeTool === "cases" && <CasePanel />}
        {activeTool === "export" && (
          <ExportPanel count={filteredCount} onCopy={onCopy} onExport={onExport} />
        )}
      </div>
    </section>
  );
}

function CasePanel() {
  return (
    <section className="panel" aria-labelledby="cases-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Evaluation</p>
          <h2 id="cases-heading">診断ベンチケース</h2>
        </div>
        <IconSparkles aria-hidden="true" size={20} />
      </div>
      <div className="case-grid">
        {data.exampleCases.map((example) => (
          <article className="case-card" key={example.id}>
            <h3>{example.title}</h3>
            <div className="chip-list">
              {example.expected_top3.map((id) => (
                <Badge key={id} tone="active">{labelFor(id)}</Badge>
              ))}
            </div>
            <p>{example.narrative}</p>
            <p>{example.signals.join(" / ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PipelinePanel() {
  return (
    <section className="panel" aria-labelledby="path-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h2 id="path-heading">課題から solver まで</h2>
        </div>
        <IconGitBranch aria-hidden="true" size={20} />
      </div>
      <div className="pipeline pipeline-plain">
        <span>ExampleCase</span>
        <span>ModelingPattern</span>
        <span>ProblemClass</span>
        <span>Algorithm</span>
        <span>Solver</span>
      </div>
    </section>
  );
}

function ExportPanel({ count, onCopy, onExport }) {
  return (
    <section className="panel export-panel" aria-labelledby="export-heading">
      <div>
        <p className="eyebrow">Carry out</p>
        <h2 id="export-heading">一覧を持ち出す</h2>
        <p><strong className="num">{count}</strong> 件の ProblemClass をコピーまたはCSVで保存できます。</p>
      </div>
      <div className="export-actions">
        <IconButton icon={IconClipboard} onClick={onCopy} title="一覧をTSVでコピー">コピー</IconButton>
        <IconButton icon={IconDownload} onClick={onExport} title="一覧をCSVで保存">CSV</IconButton>
      </div>
    </section>
  );
}

function GuideRail({ filteredCount, onCopy, onExport, selected, setActiveTool, setCompareRight }) {
  const primaryAlgorithm = selected.candidate_algorithms[0];
  const primarySolver = selected.candidate_solvers[0];

  return (
    <div className="guide-rail">
      <section className="panel focus-card" aria-label="現在の読みどころ">
        <p className="eyebrow">Focus</p>
        <h2>{selected.name_ja}</h2>
        <p>{selected.summary}</p>
        <div className="focus-next">
          <span>
            <b>Algorithm</b>
            {primaryAlgorithm ? labelFor(primaryAlgorithm) : "未設定"}
          </span>
          <span>
            <b>Solver</b>
            {primarySolver ? labelFor(primarySolver) : "未設定"}
          </span>
        </div>
      </section>

      <QuickCompare
        selected={selected}
        onSelectCompare={(id) => {
          setCompareRight(id);
          setActiveTool("compare");
        }}
      />

      <section className="panel action-card" aria-label="次の操作">
        <p className="eyebrow">Next</p>
        <div className="action-list">
          <button onClick={() => setActiveTool("diagnosis")} type="button">
            <span>条件から候補を出す</span>
            <IconArrowRight aria-hidden="true" size={16} />
          </button>
          <button onClick={() => setActiveTool("cases")} type="button">
            <span>ケースから探す</span>
            <IconArrowRight aria-hidden="true" size={16} />
          </button>
          <button onClick={() => setActiveTool("compare")} type="button">
            <span>似たクラスと比較する</span>
            <IconArrowRight aria-hidden="true" size={16} />
          </button>
          <button onClick={() => setActiveTool("export")} type="button">
            <span>{filteredCount} 件を持ち出す</span>
            <IconArrowRight aria-hidden="true" size={16} />
          </button>
        </div>
        <div className="rail-actions">
          <IconButton icon={IconClipboard} onClick={onCopy} title="一覧をTSVでコピー">コピー</IconButton>
          <IconButton icon={IconDownload} onClick={onExport} title="一覧をCSVで保存">CSV</IconButton>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [axisFilter, setAxisFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(data.problemClasses[0].id);
  const [compareLeft, setCompareLeft] = useState("linear_programming");
  const [compareRight, setCompareRight] = useState("convex_optimization");
  const [activeTool, setActiveTool] = useState("diagnosis");
  const [answers, setAnswers] = useState({});
  const [toast, setToast] = useState("");

  const filteredProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.problemClasses.filter((problem) => {
      const haystack = [problem.id, problem.name_ja, problem.name_en, problem.summary, ...problem.tags].join(" ").toLowerCase();
      const matchesQuery = normalized.length === 0 || haystack.includes(normalized);
      const matchesAxis =
        axisFilter === "all" ||
        Object.values(problem.axes ?? {}).includes(axisFilter) ||
        problem.tags.includes(axisFilter);
      return matchesQuery && matchesAxis;
    });
  }, [axisFilter, query]);

  const selected = maps.problems[selectedId] ?? filteredProblems[0] ?? data.problemClasses[0];

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const copyProblems = async () => {
    await navigator.clipboard.writeText(toTsv(filteredProblems, tableColumns));
    showToast("コピーしました");
  };

  const exportProblems = () => {
    downloadCsv("optimization-map_problem_classes.csv", filteredProblems, tableColumns);
    showToast("CSVを書き出しました");
  };

  const selectProblem = (id) => {
    if (!maps.problems[id]) {
      return;
    }
    setSelectedId(id);
    setCompareLeft(id);
  };

  return (
    <div className="app-shell">
      <OverviewHero activeTool={activeTool} selected={selected} setActiveTool={setActiveTool} />

      <main className="workspace">
        <Sidebar
          axisFilter={axisFilter}
          filteredProblems={filteredProblems}
          onAxisFilter={setAxisFilter}
          onCopy={copyProblems}
          onExport={exportProblems}
          onQuery={setQuery}
          onSelect={selectProblem}
          query={query}
          selectedId={selected.id}
        />

        <div className="content-stack">
          <StartPanel activeTool={activeTool} selected={selected} setActiveTool={setActiveTool} />
          <DetailPanel problem={selected} />
          <ToolDock
            activeTool={activeTool}
            answers={answers}
            compareLeft={compareLeft}
            compareRight={compareRight}
            filteredCount={filteredProblems.length}
            onAnswer={(questionId, answerId) => setAnswers((current) => ({ ...current, [questionId]: answerId }))}
            onCopy={copyProblems}
            onExport={exportProblems}
            onReset={() => setAnswers({})}
            onSelectProblem={selectProblem}
            selected={selected}
            setActiveTool={setActiveTool}
            setCompareLeft={setCompareLeft}
            setCompareRight={setCompareRight}
          />
        </div>

        <GuideRail
          filteredCount={filteredProblems.length}
          onCopy={copyProblems}
          onExport={exportProblems}
          selected={selected}
          setActiveTool={setActiveTool}
          setCompareRight={setCompareRight}
        />
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
