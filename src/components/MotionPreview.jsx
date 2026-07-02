import { maps } from "../data/loadData.js";

function getTrace(visual, traceId) {
  if (traceId) {
    return maps.traces[traceId];
  }
  const byType = Object.values(maps.traces).find((trace) => trace.trace_type === visual?.visual_type);
  return byType ?? Object.values(maps.traces)[0];
}

function PathPreview({ trace }) {
  const states = trace?.states ?? [];
  const points = states.map((state, index) => {
    const x = state.x ?? index / Math.max(states.length - 1, 1);
    const y = state.y ?? state.objective ?? index;
    const px = 18 + ((Number(x) + 4) / 8) * 164;
    const py = 110 - Math.min(86, Math.abs(Number(y)) * 16);
    return `${px},${py}`;
  });

  return (
    <svg aria-hidden="true" viewBox="0 0 200 124">
      <path className="motion-grid" d="M20 104H180M20 78H180M20 52H180M20 26H180M44 16V108M84 16V108M124 16V108M164 16V108" />
      <path className="motion-soft-fill" d="M24 104C42 70 74 64 96 78C124 96 142 48 178 28L178 104Z" />
      <polyline className="motion-path" points={points.join(" ")} />
      {points.map((point, index) => {
        const [cx, cy] = point.split(",");
        return <circle className={index === points.length - 1 ? "motion-dot motion-dot-live" : "motion-dot"} cx={cx} cy={cy} key={point} r={index === points.length - 1 ? 5 : 3} />;
      })}
    </svg>
  );
}

function TreePreview({ trace }) {
  const states = trace?.states ?? [];
  const nodes = [
    { id: "root", x: 100, y: 22 },
    { id: "n1", x: 60, y: 62 },
    { id: "n2", x: 140, y: 62 },
    { id: "n3", x: 40, y: 102 },
    { id: "n4", x: 82, y: 102 },
  ];
  const statusById = Object.fromEntries(states.map((state) => [state.node_id, state.status]));

  return (
    <svg aria-hidden="true" viewBox="0 0 200 124">
      <path className="motion-edge" d="M100 28L60 56M100 28L140 56M60 68L40 96M60 68L82 96" />
      {nodes.map((node) => (
        <g key={node.id}>
          <circle className={`motion-node motion-node-${statusById[node.id] ?? "active"}`} cx={node.x} cy={node.y} r="11" />
          <text className="motion-label" x={node.x} y={node.y + 4}>{node.id === "root" ? "R" : node.id.slice(1)}</text>
        </g>
      ))}
    </svg>
  );
}

function GridPreview({ trace }) {
  const rows = trace?.row_labels ?? ["A", "B", "C", "D"];
  const cols = trace?.col_labels ?? ["1", "2", "3", "4"];
  const cells = trace?.states?.at(-1)?.cells ?? [
    [1, 0, 1, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
  ];

  return (
    <svg aria-hidden="true" viewBox="0 0 200 124">
      {rows.map((row, rowIndex) =>
        cols.map((col, colIndex) => (
          <rect
            className={cells[rowIndex]?.[colIndex] ? "motion-cell motion-cell-on" : "motion-cell"}
            height="18"
            key={`${row}:${col}`}
            rx="4"
            width="32"
            x={34 + colIndex * 38}
            y={20 + rowIndex * 23}
          />
        )),
      )}
      {cols.map((col, index) => (
        <text className="motion-axis-label" key={col} x={50 + index * 38} y="14">{col}</text>
      ))}
      {rows.map((row, index) => (
        <text className="motion-axis-label" key={row} x="16" y={34 + index * 23}>{row}</text>
      ))}
    </svg>
  );
}

function TrialPreview({ trace }) {
  const states = trace?.states ?? [];
  const maxValue = Math.max(...states.map((state) => Number(state.best_so_far ?? state.reward ?? state.objective ?? 1)), 1);

  return (
    <svg aria-hidden="true" viewBox="0 0 200 124">
      <path className="motion-grid" d="M24 100H184M24 74H184M24 48H184M24 22H184" />
      {states.slice(0, 7).map((state, index) => {
        const value = Number(state.best_so_far ?? state.reward ?? state.objective ?? 0);
        const height = Math.max(8, (value / maxValue) * 76);
        return <rect className="motion-bar" height={height} key={index} rx="4" width="15" x={32 + index * 22} y={100 - height} />;
      })}
      <polyline
        className="motion-path"
        points={states
          .slice(0, 7)
          .map((state, index) => `${39 + index * 22},${100 - (Number(state.best_so_far ?? state.objective ?? 0) / maxValue) * 76}`)
          .join(" ")}
      />
    </svg>
  );
}

function FlowPreview() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 124">
      <rect className="motion-box" height="38" rx="6" width="58" x="16" y="20" />
      <rect className="motion-box" height="38" rx="6" width="58" x="126" y="20" />
      <rect className="motion-box motion-box-live" height="34" rx="6" width="76" x="62" y="78" />
      <path className="motion-path motion-path-arrow" d="M76 39H124M154 60V76M100 78V60M72 78L44 60" />
      <text className="motion-axis-label" x="45" y="43">M</text>
      <text className="motion-axis-label" x="154" y="43">S</text>
      <text className="motion-axis-label" x="100" y="99">cut</text>
    </svg>
  );
}

export function MotionPreview({ className = "", traceId, visual }) {
  const trace = getTrace(visual, traceId);
  const type = visual?.visual_type ?? trace?.trace_type ?? "";
  const group =
    type.includes("tree") ? "tree" :
    type.includes("assignment") || type.includes("grid") ? "grid" :
    type.includes("trial") || type.includes("best") || type.includes("arm") ? "trial" :
    type.includes("decomposition") || type.includes("column") || type.includes("mpc") || type.includes("layer") ? "flow" :
    "path";

  return (
    <figure className={`motion-preview ${className}`}>
      {group === "tree" && <TreePreview trace={trace} />}
      {group === "grid" && <GridPreview trace={trace} />}
      {group === "trial" && <TrialPreview trace={trace} />}
      {group === "flow" && <FlowPreview />}
      {group === "path" && <PathPreview trace={trace} />}
      <figcaption>
        <strong>{visual?.title ?? trace?.title ?? "Motion preview"}</strong>
        <span>{visual?.visual_type ?? trace?.trace_type}</span>
      </figcaption>
    </figure>
  );
}
