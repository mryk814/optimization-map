import { useMemo, useState } from "react";
import { IconFilter, IconSearch } from "@tabler/icons-react";

import { data, filterProblems, tableColumns, toTsv } from "../data/loadData.js";
import { Badge, CopyExportActions, PageHeader, ProblemCard } from "../components/ui.jsx";

export function ProblemsView({ onCopyRows, onExportRows }) {
  const [query, setQuery] = useState("");
  const [axisFilter, setAxisFilter] = useState("all");
  const filteredProblems = useMemo(() => filterProblems(query, axisFilter), [axisFilter, query]);
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
    <div className="view-stack">
      <PageHeader
        action={<Badge tone="idle">{filteredProblems.length} / {data.problemClasses.length} 件</Badge>}
        eyebrow="Problem Types"
        title="問題タイプを検索する"
      >
        すでに用語が分かっている時の入口です。課題から入る場合はケースか診断へ進みます。
      </PageHeader>

      <section className="panel list-panel" aria-label="問題タイプ検索">
        <div className="toolbar-row">
          <label className="search-box">
            <IconSearch aria-hidden="true" size={16} />
            <input
              aria-label="問題タイプを検索"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例: MILP, 凸, routing"
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
          <CopyExportActions
            onCopy={() => onCopyRows(toTsv(filteredProblems, tableColumns))}
            onExport={() => onExportRows(filteredProblems, tableColumns)}
          />
        </div>

        {filteredProblems.length === 0 ? (
          <div className="empty-state">条件に合う問題タイプはありません。検索語か filter を変えてください。</div>
        ) : (
          <div className="problem-list problem-list-wide">
            {filteredProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
