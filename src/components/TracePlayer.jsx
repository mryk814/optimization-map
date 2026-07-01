import { useMemo, useState } from "react";

import { Badge } from "./ui.jsx";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberLabel(value) {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }
  if (Array.isArray(value)) {
    return `[${value.map(numberLabel).join(", ")}]`;
  }
  return String(value);
}

function getStepLabel(state, index) {
  return state.step ?? state.iteration ?? state.trial ?? state.round ?? index;
}

function boundsFromPoints(points, fallback = { minX: -1, maxX: 5, minY: -1, maxY: 5 }) {
  const xs = points.map((point) => point?.[0]).filter((value) => typeof value === "number");
  const ys = points.map((point) => point?.[1]).filter((value) => typeof value === "number");
  if (!xs.length || !ys.length) {
    return fallback;
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padX = Math.max((maxX - minX) * 0.12, 0.5);
  const padY = Math.max((maxY - minY) * 0.12, 0.5);
  return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
}

function makeScaler(bounds, width = 320, height = 220, pad = 26) {
  const xSpan = bounds.maxX - bounds.minX || 1;
  const ySpan = bounds.maxY - bounds.minY || 1;
  return {
    x: (value) => pad + ((value - bounds.minX) / xSpan) * (width - pad * 2),
    y: (value) => height - pad - ((value - bounds.minY) / ySpan) * (height - pad * 2),
  };
}

function polyline(points, scale) {
  return points.map((point) => `${scale.x(point[0])},${scale.y(point[1])}`).join(" ");
}

function FeasibleRegionTrace({ trace, state }) {
  const allPoints = [
    ...(trace.feasible_polygon ?? []),
    ...((trace.objective_lines ?? []).flatMap((line) => line.points ?? [])),
    ...(trace.states ?? []).map((item) => item.point).filter(Boolean),
  ];
  const bounds = boundsFromPoints(allPoints, { minX: -0.5, maxX: 5, minY: -0.5, maxY: 5 });
  const scale = makeScaler(bounds);
  const currentLine = (trace.objective_lines ?? []).find((line) => line.step === state.step) ?? trace.objective_lines?.at(-1);
  const currentPoint = state.point ?? trace.optimum?.point;

  return (
    <svg className="trace-svg" viewBox="0 0 320 220" role="img" aria-label={trace.title}>
      <line className="trace-axis" x1="26" x2="300" y1="194" y2="194" />
      <line className="trace-axis" x1="26" x2="26" y1="20" y2="194" />
      {trace.feasible_polygon && <polygon className="trace-region" points={polyline(trace.feasible_polygon, scale)} />}
      {(trace.constraints ?? []).filter((constraint) => constraint.coefficients?.every((value) => typeof value === "number")).map((constraint) => {
        const [a, b] = constraint.coefficients;
        if (b === 0) {
          const x = scale.x(constraint.rhs / a);
          return <line className="trace-constraint" key={constraint.id} x1={x} x2={x} y1="18" y2="196" />;
        }
        const left = bounds.minX;
        const right = bounds.maxX;
        const yLeft = (constraint.rhs - a * left) / b;
        const yRight = (constraint.rhs - a * right) / b;
        return <line className="trace-constraint" key={constraint.id} x1={scale.x(left)} x2={scale.x(right)} y1={scale.y(yLeft)} y2={scale.y(yRight)} />;
      })}
      {currentLine?.points?.length >= 2 && <line className="trace-objective" x1={scale.x(currentLine.points[0][0])} x2={scale.x(currentLine.points[1][0])} y1={scale.y(currentLine.points[0][1])} y2={scale.y(currentLine.points[1][1])} />}
      {currentPoint && <circle className="trace-point" cx={scale.x(currentPoint[0])} cy={scale.y(currentPoint[1])} r="6" />}
    </svg>
  );
}

function DescentTrace({ trace, state, stateIndex }) {
  const points = (trace.states ?? []).map((item) => item.x).filter(Boolean);
  const bounds = boundsFromPoints(points, { minX: -0.5, maxX: 3.5, minY: -0.5, maxY: 2.5 });
  const scale = makeScaler(bounds);
  const activePoints = points.slice(0, stateIndex + 1);
  const current = state.x ?? activePoints.at(-1);

  return (
    <svg className="trace-svg" viewBox="0 0 320 220" role="img" aria-label={trace.title}>
      {(trace.contour_levels ?? [1, 2, 4, 8, 16]).map((level, index) => (
        <ellipse
          className="trace-contour"
          cx={scale.x(0)}
          cy={scale.y(0)}
          key={level}
          rx={Math.max(12, 24 + index * 19)}
          ry={Math.max(8, 14 + index * 13)}
        />
      ))}
      {activePoints.length > 1 && <polyline className="trace-path" points={polyline(activePoints, scale)} />}
      {activePoints.map((point, index) => (
        <circle className={index === activePoints.length - 1 ? "trace-point" : "trace-point-muted"} cx={scale.x(point[0])} cy={scale.y(point[1])} key={`${point[0]}:${point[1]}:${index}`} r={index === activePoints.length - 1 ? 6 : 4} />
      ))}
      {current && <text className="trace-text" x={scale.x(current[0]) + 8} y={scale.y(current[1]) - 8}>iter {state.iteration}</text>}
    </svg>
  );
}

function TradeoffTrace({ trace, state }) {
  const points = trace.frontier_points ?? [];
  const bounds = boundsFromPoints(points.map((point) => [point.risk, point.expected_return]), { minX: 0, maxX: 0.25, minY: 0.07, maxY: 0.13 });
  const scale = makeScaler(bounds);
  const current = state.risk !== undefined ? [state.risk, state.expected_return] : null;

  return (
    <svg className="trace-svg" viewBox="0 0 320 220" role="img" aria-label={trace.title}>
      <line className="trace-axis" x1="26" x2="300" y1="194" y2="194" />
      <line className="trace-axis" x1="26" x2="26" y1="20" y2="194" />
      {points.length > 1 && <polyline className="trace-path" points={polyline(points.map((point) => [point.risk, point.expected_return]), scale)} />}
      {points.map((point) => <circle className="trace-point-muted" cx={scale.x(point.risk)} cy={scale.y(point.expected_return)} key={`${point.risk}:${point.expected_return}`} r="4" />)}
      {current && <circle className="trace-point" cx={scale.x(current[0])} cy={scale.y(current[1])} r="6" />}
      <text className="trace-text" x="210" y="190">risk</text>
      <text className="trace-text" x="32" y="28">return</text>
    </svg>
  );
}

function SearchTreeTrace({ state }) {
  const nodes = state.nodes ?? [];
  const edges = state.edges ?? [];
  const levels = new Map();
  for (const node of nodes) {
    if (node.id === "root") levels.set(node.id, 0);
  }
  for (let guard = 0; guard < nodes.length + 2; guard += 1) {
    for (const edge of edges) {
      if (levels.has(edge.source) && !levels.has(edge.target)) {
        levels.set(edge.target, (levels.get(edge.source) ?? 0) + 1);
      }
    }
  }
  const byLevel = new Map();
  for (const node of nodes) {
    const level = levels.get(node.id) ?? 0;
    byLevel.set(level, [...(byLevel.get(level) ?? []), node.id]);
  }
  const positions = new Map(nodes.map((node) => {
    const level = levels.get(node.id) ?? 0;
    const ids = byLevel.get(level) ?? [];
    const index = ids.indexOf(node.id);
    const x = 70 + index * (180 / Math.max(ids.length - 1, 1));
    const y = 40 + level * 70;
    return [node.id, { x, y }];
  }));

  return (
    <svg className="trace-svg" viewBox="0 0 320 220" role="img" aria-label="branch and bound tree">
      {edges.map((edge) => {
        const source = positions.get(edge.source);
        const target = positions.get(edge.target);
        if (!source || !target) return null;
        return <line className="trace-tree-edge" key={`${edge.source}:${edge.target}`} x1={source.x} x2={target.x} y1={source.y} y2={target.y} />;
      })}
      {nodes.map((node) => {
        const position = positions.get(node.id) ?? { x: 160, y: 40 };
        return (
          <g className={`trace-tree-node trace-tree-node-${node.status}`} key={node.id}>
            <circle cx={position.x} cy={position.y} r="18" />
            <text x={position.x} y={position.y + 4}>{node.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AssignmentGridTrace({ trace, state }) {
  const rows = trace.row_labels ?? [];
  const cols = trace.col_labels ?? [];
  const cells = state.cells ?? [];

  return (
    <div className="trace-table-wrap">
      <table className="trace-grid-table">
        <thead>
          <tr>
            <th>worker</th>
            {cols.map((col) => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row}>
              <th>{row}</th>
              {cols.map((col, colIndex) => (
                <td className={cells[rowIndex]?.[colIndex] ? "is-on" : ""} key={col}>{cells[rowIndex]?.[colIndex] ? "1" : ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeriesTrace({ trace, state, stateIndex }) {
  const states = trace.states ?? [];
  const valueKey = trace.trace_type === "arm_selection_history" ? "cumulative_regret" : "best_so_far";
  const values = states.map((item, index) => [index + 1, item[valueKey] ?? item.objective ?? item.reward ?? 0]);
  const active = values.slice(0, stateIndex + 1);
  const bounds = boundsFromPoints(values, { minX: 0, maxX: values.length + 1, minY: 0, maxY: 1 });
  const scale = makeScaler(bounds);

  return (
    <svg className="trace-svg" viewBox="0 0 320 220" role="img" aria-label={trace.title}>
      <line className="trace-axis" x1="26" x2="300" y1="194" y2="194" />
      <line className="trace-axis" x1="26" x2="26" y1="20" y2="194" />
      {active.length > 1 && <polyline className="trace-path" points={polyline(active, scale)} />}
      {active.map((point, index) => <circle className={index === active.length - 1 ? "trace-point" : "trace-point-muted"} cx={scale.x(point[0])} cy={scale.y(point[1])} key={`${point[0]}:${point[1]}`} r={index === active.length - 1 ? 6 : 4} />)}
      <text className="trace-text" x="190" y="190">step</text>
      <text className="trace-text" x="34" y="30">{valueKey}</text>
    </svg>
  );
}

function GenericStateTable({ state }) {
  return (
    <div className="trace-table-wrap">
      <table>
        <tbody>
          {Object.entries(state).filter(([key]) => key !== "nodes" && key !== "edges" && key !== "cells").map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{numberLabel(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TraceVisual({ trace, state, stateIndex }) {
  if (trace.trace_type === "feasible_region_2d") return <FeasibleRegionTrace state={state} trace={trace} />;
  if (trace.trace_type === "descent_trace_2d") return <DescentTrace state={state} stateIndex={stateIndex} trace={trace} />;
  if (trace.trace_type === "risk_return_tradeoff") return <TradeoffTrace state={state} trace={trace} />;
  if (trace.trace_type === "search_tree") return <SearchTreeTrace state={state} trace={trace} />;
  if (trace.trace_type === "assignment_grid") return <AssignmentGridTrace state={state} trace={trace} />;
  if (trace.trace_type === "trial_history" || trace.trace_type === "arm_selection_history") return <SeriesTrace state={state} stateIndex={stateIndex} trace={trace} />;
  return <GenericStateTable state={state} />;
}

export function TracePlayer({ trace }) {
  const states = trace?.states ?? [];
  const [stepIndex, setStepIndex] = useState(0);
  const safeIndex = clamp(stepIndex, 0, Math.max(states.length - 1, 0));
  const state = states[safeIndex] ?? {};
  const stateRows = useMemo(() => Object.entries(state).filter(([key]) => !["nodes", "edges", "cells", "note"].includes(key)), [state]);

  if (!trace) {
    return <div className="empty-state">trace はまだありません。</div>;
  }

  return (
    <section className="trace-player panel" aria-label="optimization trace">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Optimization Trace</p>
          <h2>{trace.title}</h2>
        </div>
        <Badge tone="active">{trace.trace_type}</Badge>
      </div>

      <div className="trace-layout">
        <div className="trace-viewport">
          <TraceVisual state={state} stateIndex={safeIndex} trace={trace} />
        </div>
        <aside className="trace-side">
          <div className="trace-step-card">
            <span>step</span>
            <strong className="num">{numberLabel(getStepLabel(state, safeIndex))}</strong>
            {state.note && <p>{state.note}</p>}
          </div>
          <div className="trace-state-list">
            {stateRows.map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{numberLabel(value)}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {states.length > 1 && (
        <label className="trace-controls">
          <span>step {safeIndex + 1} / {states.length}</span>
          <input
            max={states.length - 1}
            min="0"
            onChange={(event) => setStepIndex(Number(event.target.value))}
            type="range"
            value={safeIndex}
          />
        </label>
      )}
    </section>
  );
}
