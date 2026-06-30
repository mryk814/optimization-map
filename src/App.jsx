import { useMemo, useState } from "react";
import {
  IconArrowsDiff,
  IconClipboard,
  IconDownload,
  IconFilter,
  IconGitBranch,
  IconMap,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";

import { data, downloadCsv, getRelated, labelFor, maps, scoreDiagnosis, toTsv } from "./data/loadData.js";

const tableColumns = [
  { label: "ID", value: (item) => item.id },
  { label: "ProblemClass", value: (item) => item.name_ja },
  { label: "Summary", value: (item) => item.summary },
  { label: "Tags", value: (item) => item.tags.join(" / ") },
  { label: "Algorithms", value: (item) => item.candidate_algorithms.map(labelFor).join(" / ") },
  { label: "Solvers", value: (item) => item.candidate_solvers.map(labelFor).join(" / ") },
];

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

function ProblemCard({ problem, selected, onSelect }) {
  return (
    <button
      aria-current={selected ? "true" : undefined}
      className={`problem-row${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(problem.id)}
      type="button"
    >
      <span className="problem-row-main">
        <strong>{problem.name_ja}</strong>
        <span>{problem.summary}</span>
      </span>
      <span className="problem-row-tags">
        {problem.tags.slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </span>
    </button>
  );
}

function DetailPanel({ problem }) {
  const relations = getRelated(problem.id);

  return (
    <section className="panel detail-panel" aria-labelledby="detail-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ProblemClass</p>
          <h2 id="detail-heading">{problem.name_ja}</h2>
        </div>
        <Badge tone="active">{problem.name_en}</Badge>
      </div>

      <p className="summary-text">{problem.definition}</p>

      <div className="formula">{problem.canonical_form}</div>

      <div className="detail-grid">
        <InfoList title="使う場面" items={problem.typical_when} />
        <InfoList title="避ける場面" items={problem.not_good_when} />
        <InfoList title="難しさ" items={[problem.why_hard]} />
        <InfoList title="緩和・変換" items={problem.relaxations_or_reformulations.map(labelFor)} />
      </div>

      <div className="reference-grid">
        <ReferenceBlock title="Algorithm" items={problem.candidate_algorithms} />
        <ReferenceBlock title="Solver" items={problem.candidate_solvers} />
        <ReferenceBlock title="Confused with" items={problem.confused_with} />
      </div>

      <div className="sources">
        <h3>Sources</h3>
        {problem.sources.map((source) => (
          <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
            {source.title}
            <span>{source.type}</span>
          </a>
        ))}
      </div>

      <RelationTable relations={relations} />
    </section>
  );
}

function InfoList({ title, items }) {
  return (
    <div className="info-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReferenceBlock({ title, items }) {
  return (
    <div className="reference-block">
      <h3>{title}</h3>
      <div className="chip-list">
        {items.map((id) => (
          <Badge key={id}>{labelFor(id)}</Badge>
        ))}
      </div>
    </div>
  );
}

function RelationTable({ relations }) {
  if (!relations.length) {
    return <div className="empty-state">relation はまだありません。</div>;
  }

  return (
    <div className="relation-table-wrap">
      <h3>Relations</h3>
      <table className="relation-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Source</th>
            <th>Target</th>
            <th>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {relations.slice(0, 12).map((relation) => (
            <tr key={relation.id}>
              <td>
                <Badge tone="active">{relation.type}</Badge>
              </td>
              <td>{labelFor(relation.source)}</td>
              <td>{labelFor(relation.target)}</td>
              <td>{relation.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparePanel({ leftId, rightId, onLeftChange, onRightChange }) {
  const left = maps.problems[leftId];
  const right = maps.problems[rightId];
  const rows = [
    ["定義", left.definition, right.definition],
    ["使う場面", left.typical_when.join(" / "), right.typical_when.join(" / ")],
    ["避ける場面", left.not_good_when.join(" / "), right.not_good_when.join(" / ")],
    ["難しさ", left.why_hard, right.why_hard],
    ["手法", left.candidate_algorithms.map(labelFor).join(" / "), right.candidate_algorithms.map(labelFor).join(" / ")],
    ["Solver", left.candidate_solvers.map(labelFor).join(" / "), right.candidate_solvers.map(labelFor).join(" / ")],
  ];

  return (
    <section className="panel" aria-labelledby="compare-heading">
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
    </section>
  );
}

function DiagnosisPanel({ answers, onAnswer }) {
  const results = scoreDiagnosis(answers).slice(0, 5);
  const answered = Object.keys(answers).length;

  return (
    <section className="panel" aria-labelledby="diagnosis-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Diagnosis</p>
          <h2 id="diagnosis-heading">モデリング診断</h2>
        </div>
        <Badge tone={answered ? "active" : "idle"}>{answered} / {data.diagnosisQuestions.length}</Badge>
      </div>

      <div className="diagnosis-grid">
        <div className="questions">
          {data.diagnosisQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend>{question.text}</legend>
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
            results.map((result, index) => (
              <div className="result-row" key={result.id}>
                <span className="rank num">{index + 1}</span>
                <div>
                  <strong>{result.label}</strong>
                  <span>{result.reasons.join(" / ")}</span>
                </div>
                <Badge tone="active">score {result.score}</Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [axisFilter, setAxisFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(data.problemClasses[0].id);
  const [compareLeft, setCompareLeft] = useState("linear_programming");
  const [compareRight, setCompareRight] = useState("convex_optimization");
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
  const filterOptions = useMemo(() => {
    const values = new Map([["all", "すべて"]]);
    for (const axis of data.axes.filter((item) => item.core)) {
      for (const value of axis.values) {
        values.set(value.id, `${axis.name_ja}: ${value.name_ja}`);
      }
    }
    return [...values.entries()];
  }, []);

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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Optimization Map</p>
          <h1>課題から問題クラスへ進む地図</h1>
        </div>
        <div className="metric-strip" aria-label="データ件数">
          <span><strong className="num">{data.problemClasses.length}</strong> classes</span>
          <span><strong className="num">{data.axes.length}</strong> axes</span>
          <span><strong className="num">{data.relations.length}</strong> relations</span>
          <span><strong className="num">{data.exampleCases.length}</strong> cases</span>
        </div>
      </header>

      <main className="workspace">
        <aside className="panel sidebar" aria-label="ProblemClass 一覧">
          <div className="toolbar">
            <label className="search-box">
              <IconSearch aria-hidden="true" size={16} />
              <input
                aria-label="ProblemClass を検索"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="検索"
                type="search"
                value={query}
              />
            </label>
            <label className="filter-box">
              <IconFilter aria-hidden="true" size={16} />
              <select aria-label="分類軸で絞り込み" onChange={(event) => setAxisFilter(event.target.value)} value={axisFilter}>
                {filterOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="list-actions">
            <IconButton icon={IconClipboard} onClick={copyProblems} title="一覧をTSVでコピー">コピー</IconButton>
            <IconButton icon={IconDownload} onClick={exportProblems} title="一覧をCSVで保存">CSV</IconButton>
          </div>

          <div className="problem-list">
            {filteredProblems.length === 0 ? (
              <div className="empty-state">条件に合う ProblemClass はありません。検索語か filter を変えてください。</div>
            ) : (
              filteredProblems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  onSelect={setSelectedId}
                  problem={problem}
                  selected={selected.id === problem.id}
                />
              ))
            )}
          </div>
        </aside>

        <div className="content-stack">
          <section className="panel map-panel" aria-labelledby="map-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Map</p>
                <h2 id="map-heading">MVP coverage</h2>
              </div>
              <IconMap aria-hidden="true" size={20} />
            </div>
            <div className="map-grid">
              {["is_a", "confused_with", "commonly_solved_by", "implemented_by", "used_in"].map((type) => (
                <div className="map-tile" key={type}>
                  <span>{type}</span>
                  <strong className="num">{data.relations.filter((relation) => relation.type === type).length}</strong>
                </div>
              ))}
            </div>
          </section>

          <DetailPanel problem={selected} />
          <ComparePanel leftId={compareLeft} onLeftChange={setCompareLeft} rightId={compareRight} onRightChange={setCompareRight} />
          <DiagnosisPanel answers={answers} onAnswer={(questionId, answerId) => setAnswers((current) => ({ ...current, [questionId]: answerId }))} />

          <section className="panel" aria-labelledby="cases-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Evaluation</p>
                <h2 id="cases-heading">診断ベンチケース</h2>
              </div>
              <IconSparkles aria-hidden="true" size={20} />
            </div>
            <table className="case-table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Expected top-3</th>
                  <th>Signals</th>
                </tr>
              </thead>
              <tbody>
                {data.exampleCases.map((example) => (
                  <tr key={example.id}>
                    <td>{example.title}</td>
                    <td>{example.expected_top3.map(labelFor).join(" / ")}</td>
                    <td>{example.signals.join(" / ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel" aria-labelledby="path-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Pipeline</p>
                <h2 id="path-heading">課題から solver まで</h2>
              </div>
              <IconGitBranch aria-hidden="true" size={20} />
            </div>
            <div className="pipeline">
              <span>ExampleCase</span>
              <span>ModelingPattern</span>
              <span>ProblemClass</span>
              <span>Algorithm</span>
              <span>Solver</span>
            </div>
          </section>
        </div>
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
