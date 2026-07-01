import { IconArrowsDiff } from "@tabler/icons-react";

import { data, axisValueLabel, getComparisonGuidance, maps, labelFor } from "../data/loadData.js";
import { Badge, ButtonLink, PageHeader } from "../components/ui.jsx";
import { OptimizationGlyph } from "../components/OptimizationGlyph.jsx";

export function CompareView({ leftId, rightId }) {
  const left = maps.problems[leftId] ?? maps.problems.linear_programming;
  const right = maps.problems[rightId] ?? maps.problems.convex_optimization;
  const guidance = getComparisonGuidance(left.id, right.id);
  const axisKeys = [...new Set([...Object.keys(left.axes ?? {}), ...Object.keys(right.axes ?? {})])];
  const rows = [
    ["定義", left.definition, right.definition],
    ["使う場面", left.typical_when.join(" / "), right.typical_when.join(" / ")],
    ["避ける場面", left.not_good_when.join(" / "), right.not_good_when.join(" / ")],
    ["難しさ", left.why_hard, right.why_hard],
    ["手法", left.candidate_algorithms.map(labelFor).join(" / "), right.candidate_algorithms.map(labelFor).join(" / ")],
    ["Solver", left.candidate_solvers.map(labelFor).join(" / "), right.candidate_solvers.map(labelFor).join(" / ")],
  ];

  return (
    <div className="view-stack">
      <PageHeader
        action={<ButtonLink href={`#/problems/${left.id}`} icon={IconArrowsDiff}>{left.name_ja} を読む</ButtonLink>}
        eyebrow="Compare"
        title={`${left.name_ja} と ${right.name_ja}`}
      >
        似た概念を並べ、どちらから考えるべきかを判断します。
      </PageHeader>

      <section className="panel compare-picker">
        <label>
          <span>左</span>
          <select aria-label="左の問題タイプ" value={left.id} onChange={(event) => { window.location.hash = `#/compare/${event.target.value}/${right.id}`; }}>
            {data.problemClasses.map((problem) => (
              <option key={problem.id} value={problem.id}>{problem.name_ja}</option>
            ))}
          </select>
        </label>
        <label>
          <span>右</span>
          <select aria-label="右の問題タイプ" value={right.id} onChange={(event) => { window.location.hash = `#/compare/${left.id}/${event.target.value}`; }}>
            {data.problemClasses.map((problem) => (
              <option key={problem.id} value={problem.id}>{problem.name_ja}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="compare-grid">
        <CompareFace problem={left} />
        <div className="panel compare-diff-card">
          <p className="eyebrow">Axis Difference</p>
          <div className="compare-diff-list">
            {axisKeys.slice(0, 7).map((key) => (
              <div className="axis-diff" key={key}>
                <span>{maps.axes[key]?.name_ja ?? key}</span>
                <strong>{axisValueLabel(key, left.axes?.[key])}</strong>
                <strong>{axisValueLabel(key, right.axes?.[key])}</strong>
              </div>
            ))}
          </div>
        </div>
        <CompareFace problem={right} />
      </section>

      <section className="panel choice-guide">
        {guidance ? (
          <>
            <div className="choice-guide-main">
              <p className="eyebrow">Decision</p>
              <h2>どちらを選ぶか</h2>
              <p>{guidance.note}</p>
            </div>
            <div className="choice-guide-card">
              <span>同じところ</span>
              <strong>{guidance.shared}</strong>
            </div>
            <div className="choice-guide-card">
              <span>判断軸</span>
              <ul>
                {guidance.decisionAxes.map((axis) => (
                  <li key={axis}>{axis}</li>
                ))}
              </ul>
            </div>
            <div className="choice-guide-card">
              <span>{left.name_ja}</span>
              <strong>{guidance.leftChoice}</strong>
            </div>
            <div className="choice-guide-card">
              <span>{right.name_ja}</span>
              <strong>{guidance.rightChoice}</strong>
            </div>
          </>
        ) : (
          <div className="choice-guide-main">
            <p className="eyebrow">Decision</p>
            <h2>任意比較</h2>
            <p>このペアは判断軸データがまだありません。まず定義、使う場面、避ける場面、手法を並べて確認します。</p>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="table-scroll">
          <table>
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
      </section>
    </div>
  );
}

function CompareFace({ problem }) {
  return (
    <article className="panel compare-face">
      <OptimizationGlyph problem={problem} variant="compare" />
      <div>
        <p className="eyebrow">{problem.name_en}</p>
        <h2>{problem.name_ja}</h2>
        <p>{problem.summary}</p>
      </div>
      <div className="chip-list">
        {problem.candidate_algorithms.slice(0, 3).map((id) => (
          <Badge key={id} tone="active">{labelFor(id)}</Badge>
        ))}
      </div>
      <ButtonLink href={`#/problems/${problem.id}`}>読む</ButtonLink>
    </article>
  );
}
