import { IconDownload } from "@tabler/icons-react";

import { Badge, ButtonLink, PageHeader } from "../components/ui.jsx";
import { getQualitySnapshot } from "../data/loadData.js";

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong className="num">{value}</strong>
    </article>
  );
}

function CoverageTable({ columns, rows }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.field}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td className={typeof row[column.field] === "number" ? "num" : undefined} key={column.field}>
                  {row[column.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QualityView() {
  const snapshot = getQualitySnapshot();

  return (
    <div className="view-stack">
      <PageHeader
        action={<ButtonLink href="#/graph" icon={IconDownload}>Graph を見る</ButtonLink>}
        eyebrow="Coverage Dashboard"
        title="データ品質を見る"
      >
        Source、SolveStory、Visual、AI Brief、relation の coverage を確認します。
      </PageHeader>

      <section className="metric-grid">
        {Object.entries(snapshot.totals).map(([key, value]) => (
          <MetricCard key={key} label={key} value={value} />
        ))}
      </section>

      <section className="split-section">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Relation</p>
              <h2>Graph integrity</h2>
            </div>
            <Badge tone={snapshot.missingRelationEndpoints === 0 ? "done" : "blocked"}>{snapshot.missingRelationEndpoints} missing endpoints</Badge>
          </div>
          <div className="quality-status-grid">
            <MetricCard label="guided confused_with" value={`${snapshot.confusedWith.guided}/${snapshot.confusedWith.total}`} />
          </div>
        </div>
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Artifacts</p>
              <h2>Report output</h2>
            </div>
          </div>
          <div className="action-list">
            <ButtonLink href="https://github.com/mryk814/optimization-map/blob/main/docs/data-quality-report.md">Markdown report</ButtonLink>
            <ButtonLink href="https://github.com/mryk814/optimization-map/blob/main/docs/data-quality-report.json">JSON report</ButtonLink>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ProblemType</p>
            <h2>Coverage by problem</h2>
          </div>
        </div>
        <CoverageTable
          columns={[
            { field: "name", label: "ProblemType" },
            { field: "sources", label: "Sources" },
            { field: "stories", label: "SolveStories" },
            { field: "visuals", label: "Visuals" },
            { field: "briefs", label: "AI Briefs" },
          ]}
          rows={snapshot.problemRows}
        />
      </section>

      <section className="split-section">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Algorithm</p>
              <h2>Visual coverage</h2>
            </div>
          </div>
          <CoverageTable
            columns={[
              { field: "name", label: "Algorithm" },
              { field: "visuals", label: "Visuals" },
              { field: "goodFor", label: "Good for" },
            ]}
            rows={snapshot.algorithmRows}
          />
        </div>
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Solver</p>
              <h2>Support coverage</h2>
            </div>
          </div>
          <CoverageTable
            columns={[
              { field: "name", label: "Solver" },
              { field: "supported", label: "Supported ProblemTypes" },
            ]}
            rows={snapshot.solverRows}
          />
        </div>
      </section>
    </div>
  );
}
