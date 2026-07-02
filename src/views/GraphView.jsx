import { useMemo, useState } from "react";
import { IconCopy, IconDownload, IconFocus2 } from "@tabler/icons-react";

import { Badge, ButtonLink, IconButton, PageHeader } from "../components/ui.jsx";
import { data, labelFor, maps, relationLabels, relationTones } from "../data/loadData.js";

const graphModes = {
  beginner: {
    label: "Beginner Map",
    types: ["used_in", "commonly_solved_by", "implemented_by"],
    maxNodes: 28,
  },
  concept: {
    label: "Concept Map",
    types: ["is_a", "overlaps_with", "confused_with", "relaxes_to", "reformulates_to"],
    maxNodes: 30,
  },
  method: {
    label: "Method Map",
    types: ["commonly_solved_by", "implemented_by"],
    maxNodes: 30,
  },
  source: {
    label: "Source Map",
    types: ["used_in"],
    maxNodes: 28,
  },
};

function nodeKind(id) {
  if (maps.problems[id]) return "problem";
  if (maps.algorithms[id]) return "algorithm";
  if (maps.solvers[id]) return "solver";
  if (maps.cases[id]) return "case";
  if (maps.patterns[id]) return "pattern";
  return "node";
}

function exportRows(nodes, edges) {
  const header = "kind\tid\tlabel";
  const nodeRows = nodes.map((id) => `${nodeKind(id)}\t${id}\t${labelFor(id)}`);
  const edgeHeader = "edge\tsource\ttarget\ttype\texplanation";
  const edgeRows = edges.map((edge) => `edge\t${edge.source}\t${edge.target}\t${edge.type}\t${edge.explanation}`);
  return `${header}\n${nodeRows.join("\n")}\n${edgeHeader}\n${edgeRows.join("\n")}`;
}

export function GraphView({ focusId }) {
  const [mode, setMode] = useState("beginner");
  const [query, setQuery] = useState(focusId ?? "");
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const config = graphModes[mode];

  const graph = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const relations = data.relations.filter((relation) => config.types.includes(relation.type));
    const focused = normalized
      ? relations.filter((relation) =>
          [relation.source, relation.target, labelFor(relation.source), labelFor(relation.target), relation.explanation]
            .join(" ")
            .toLowerCase()
            .includes(normalized),
        )
      : relations;
    const edges = focused.slice(0, config.maxNodes + 8);
    const nodes = [...new Set(edges.flatMap((edge) => [edge.source, edge.target]))].slice(0, config.maxNodes);
    const nodeSet = new Set(nodes);
    return {
      nodes,
      edges: edges.filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target)),
      truncated: new Set(focused.flatMap((edge) => [edge.source, edge.target])).size > config.maxNodes,
    };
  }, [config, query]);

  const copyTsv = async () => {
    await navigator.clipboard.writeText(exportRows(graph.nodes, graph.edges));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `optimization-graph-${mode}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const selectedNode = selected?.kind === "node" ? selected.id : null;
  const selectedEdge = selected?.kind === "edge" ? selected.edge : null;

  return (
    <div className="article-layout">
      <article className="view-stack">
        <PageHeader
          action={<Badge tone={graph.truncated ? "review" : "idle"}>{graph.nodes.length} nodes / {graph.edges.length} edges</Badge>}
          eyebrow="Knowledge Graph"
          title="関係を探索する"
        >
          モードを切り替えて、ProblemType、Algorithm、Solver、Case の近傍だけを見ます。
        </PageHeader>

        <section className="panel graph-toolbar">
          <div className="segmented graph-mode-tabs">
            {Object.entries(graphModes).map(([id, item]) => (
              <label key={id}>
                <input checked={mode === id} name="graph-mode" onChange={() => setMode(id)} type="radio" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <label className="search-box">
            <IconFocus2 aria-hidden="true" size={16} />
            <input aria-label="focus graph" onChange={(event) => setQuery(event.target.value)} placeholder="ProblemType / Algorithm / Case を検索" value={query} />
          </label>
          <div className="inline-actions">
            <IconButton icon={IconCopy} onClick={copyTsv} title="graph を TSV でコピー">{copied ? "コピー済み" : "TSV"}</IconButton>
            <IconButton icon={IconDownload} onClick={downloadJson} title="graph を JSON で保存">JSON</IconButton>
          </div>
        </section>

        {graph.truncated && <div className="empty-state">大きい graph です。検索か mode で絞ると detail が追いやすくなります。</div>}

        <section className="panel graph-canvas" aria-label="graph nodes and edges">
          <div className="graph-node-cloud">
            {graph.nodes.map((id) => (
              <button className={`graph-node graph-node-${nodeKind(id)}`} key={id} onClick={() => setSelected({ kind: "node", id })} type="button">
                <span>{nodeKind(id)}</span>
                <strong>{labelFor(id)}</strong>
              </button>
            ))}
          </div>
          <div className="graph-edge-list">
            {graph.edges.map((edge) => (
              <button className="graph-edge-row" key={edge.id} onClick={() => setSelected({ kind: "edge", edge })} type="button">
                <Badge tone={relationTones[edge.type] ?? "neutral"}>{relationLabels[edge.type] ?? edge.type}</Badge>
                <strong>{labelFor(edge.source)} to {labelFor(edge.target)}</strong>
                <span>{edge.explanation}</span>
              </button>
            ))}
          </div>
        </section>
      </article>

      <aside className="article-rail">
        <section className="panel">
          <p className="eyebrow">Detail</p>
          {selectedNode && (
            <div className="detail-side">
              <h2>{labelFor(selectedNode)}</h2>
              <Badge tone="active">{nodeKind(selectedNode)}</Badge>
              {maps.problems[selectedNode] && <p>{maps.problems[selectedNode].summary}</p>}
              {maps.algorithms[selectedNode] && <p>{maps.algorithms[selectedNode].tradeoffs}</p>}
              {maps.cases[selectedNode] && <p>{maps.cases[selectedNode].narrative}</p>}
              {nodeKind(selectedNode) === "problem" && <ButtonLink href={`#/problems/${selectedNode}`}>詳細を開く</ButtonLink>}
              {nodeKind(selectedNode) === "algorithm" && <ButtonLink href={`#/algorithms/${selectedNode}`}>詳細を開く</ButtonLink>}
              {nodeKind(selectedNode) === "case" && <ButtonLink href={`#/cases/${selectedNode}`}>詳細を開く</ButtonLink>}
            </div>
          )}
          {selectedEdge && (
            <div className="detail-side">
              <h2>{labelFor(selectedEdge.source)} to {labelFor(selectedEdge.target)}</h2>
              <Badge tone={relationTones[selectedEdge.type] ?? "neutral"}>{relationLabels[selectedEdge.type] ?? selectedEdge.type}</Badge>
              <p>{selectedEdge.explanation}</p>
              {selectedEdge.decision_note && <p>{selectedEdge.decision_note}</p>}
            </div>
          )}
          {!selected && <div className="empty-state">node または edge を選んでください。</div>}
        </section>
      </aside>
    </div>
  );
}
