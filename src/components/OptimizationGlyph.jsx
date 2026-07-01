import { getVisualHint } from "../data/visualHints.js";

const gridPoints = [
  [38, 84],
  [62, 84],
  [86, 84],
  [110, 84],
  [38, 60],
  [62, 60],
  [86, 60],
  [110, 60],
  [38, 36],
  [62, 36],
  [86, 36],
  [110, 36],
];

function Axes() {
  return (
    <>
      <path className="glyph-axis" d="M24 96H154" />
      <path className="glyph-axis" d="M32 104V18" />
    </>
  );
}

function LinearGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M34 94L34 38L116 94Z" />
      <path className="glyph-secondary" d="M34 38L116 94" />
      <path className="glyph-secondary glyph-dash" d="M52 94L128 30" />
      <path className="glyph-primary" d="M72 92L136 48" />
      <circle className="glyph-dot glyph-live-dot" cx="92" cy="72" r="5" />
    </>
  );
}

function QuadraticGlyph() {
  return (
    <>
      <Axes />
      <ellipse className="glyph-secondary glyph-dash" cx="88" cy="64" rx="54" ry="30" />
      <ellipse className="glyph-secondary" cx="88" cy="64" rx="34" ry="18" />
      <ellipse className="glyph-fill" cx="88" cy="64" rx="18" ry="9" />
      <circle className="glyph-dot glyph-live-dot" cx="88" cy="64" r="5" />
    </>
  );
}

function ConvexGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M38 94C62 44 82 32 100 58C116 84 132 96 152 90L152 96H38Z" />
      <path className="glyph-primary" d="M38 94C62 44 82 32 100 58C116 84 132 96 152 90" />
      <path className="glyph-secondary glyph-dash" d="M58 72H136" />
      <circle className="glyph-dot glyph-live-dot" cx="82" cy="46" r="5" />
    </>
  );
}

function ConicGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M84 22L40 94H128Z" />
      <path className="glyph-primary" d="M84 22L40 94H128Z" />
      <ellipse className="glyph-secondary" cx="84" cy="94" rx="44" ry="10" />
      <path className="glyph-secondary glyph-dash" d="M48 74C68 62 100 62 122 74" />
      <circle className="glyph-dot glyph-live-dot" cx="82" cy="66" r="5" />
    </>
  );
}

function NonlinearGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M38 92C50 42 76 84 90 48C106 6 126 70 150 30L150 96H38Z" />
      <path className="glyph-primary" d="M38 92C50 42 76 84 90 48C106 6 126 70 150 30" />
      <path className="glyph-secondary glyph-dash" d="M48 34C70 64 100 84 142 72" />
      <circle className="glyph-dot glyph-live-dot" cx="106" cy="44" r="5" />
    </>
  );
}

function NonconvexGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M36 90C48 38 64 84 78 50C96 8 112 88 132 42C142 20 148 46 154 74L154 96H36Z" />
      <path className="glyph-primary" d="M36 90C48 38 64 84 78 50C96 8 112 88 132 42C142 20 148 46 154 74" />
      <circle className="glyph-dot" cx="78" cy="50" r="4" />
      <circle className="glyph-dot glyph-live-dot" cx="132" cy="42" r="5" />
      <path className="glyph-secondary glyph-dash" d="M88 26L128 26" />
    </>
  );
}

function IntegerGlyph() {
  return (
    <>
      <Axes />
      {gridPoints.map(([x, y]) => (
        <circle className="glyph-grid-dot" cx={x} cy={y} key={`${x}-${y}`} r="2.6" />
      ))}
      <path className="glyph-fill" d="M38 86L62 40L112 40L136 86Z" />
      <circle className="glyph-dot" cx="62" cy="60" r="5" />
      <circle className="glyph-dot glyph-live-dot" cx="86" cy="60" r="5" />
      <path className="glyph-secondary" d="M132 24L146 38M146 24L132 38" />
    </>
  );
}

function CombinatorialGlyph() {
  const nodes = [
    [42, 42],
    [78, 30],
    [118, 44],
    [134, 78],
    [92, 88],
    [50, 78],
  ];
  return (
    <>
      <path className="glyph-secondary glyph-dash" d="M42 42L78 30L118 44L134 78L92 88L50 78Z" />
      <path className="glyph-primary" d="M42 42L118 44L92 88L50 78" />
      {nodes.map(([x, y], index) => (
        <circle className={index === 2 ? "glyph-dot glyph-live-dot" : "glyph-dot"} cx={x} cy={y} key={`${x}-${y}`} r="5" />
      ))}
    </>
  );
}

function LogicalGlyph() {
  return (
    <>
      <path className="glyph-secondary" d="M42 34H78V70H42Z" />
      <path className="glyph-secondary" d="M104 34H140V70H104Z" />
      <path className="glyph-primary" d="M78 52H104" />
      <path className="glyph-primary" d="M51 52L60 61L72 43" />
      <path className="glyph-secondary glyph-dash" d="M114 45L132 63M132 45L114 63" />
      <circle className="glyph-dot glyph-live-dot" cx="91" cy="52" r="4" />
      <path className="glyph-fill" d="M56 86H126V96H56Z" />
    </>
  );
}

function StochasticGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-primary" d="M42 88C62 54 88 46 136 34" />
      <path className="glyph-secondary glyph-dash" d="M42 88C72 70 92 72 138 80" />
      <path className="glyph-secondary glyph-dash" d="M42 88C64 42 90 30 132 22" />
      <path className="glyph-secondary glyph-dash" d="M42 88C70 58 100 46 146 54" />
      <circle className="glyph-dot glyph-live-dot" cx="42" cy="88" r="5" />
      <circle className="glyph-grid-dot" cx="136" cy="34" r="4" />
      <circle className="glyph-grid-dot" cx="138" cy="80" r="4" />
      <circle className="glyph-grid-dot" cx="132" cy="22" r="4" />
    </>
  );
}

function RobustGlyph() {
  return (
    <>
      <Axes />
      <ellipse className="glyph-fill" cx="92" cy="62" rx="58" ry="32" />
      <ellipse className="glyph-primary" cx="92" cy="62" rx="42" ry="22" />
      <path className="glyph-secondary glyph-dash" d="M50 62H134M92 40V84" />
      <circle className="glyph-dot glyph-live-dot" cx="124" cy="48" r="5" />
      <circle className="glyph-dot" cx="92" cy="62" r="4" />
    </>
  );
}

function DroGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-secondary" d="M42 86C54 44 70 44 84 86" />
      <path className="glyph-secondary glyph-dash" d="M74 86C86 26 112 26 124 86" />
      <path className="glyph-primary" d="M54 86C72 18 118 18 140 86" />
      <path className="glyph-fill" d="M54 86C72 18 118 18 140 86Z" />
      <circle className="glyph-dot glyph-live-dot" cx="116" cy="46" r="5" />
    </>
  );
}

function BlackboxGlyph() {
  return (
    <>
      <path className="glyph-fill" d="M72 34H124V82H72Z" />
      <path className="glyph-primary" d="M72 34H124V82H72Z" />
      <path className="glyph-secondary" d="M38 58H72M124 58H150" />
      <circle className="glyph-dot" cx="42" cy="58" r="5" />
      <circle className="glyph-dot glyph-live-dot" cx="150" cy="58" r="5" />
      <path className="glyph-secondary glyph-dash" d="M88 50C96 40 112 44 106 58C104 64 98 66 98 72" />
    </>
  );
}

function BayesianGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M38 72C58 38 78 48 96 58C118 70 132 44 152 56L152 86C130 74 116 100 96 82C78 68 58 62 38 92Z" />
      <path className="glyph-primary" d="M38 82C58 50 78 58 96 70C118 84 132 58 152 68" />
      <circle className="glyph-grid-dot" cx="54" cy="76" r="4" />
      <circle className="glyph-grid-dot" cx="86" cy="64" r="4" />
      <circle className="glyph-grid-dot" cx="122" cy="78" r="4" />
      <circle className="glyph-dot glyph-live-dot" cx="140" cy="64" r="5" />
    </>
  );
}

function SimulationGlyph() {
  return (
    <>
      <path className="glyph-secondary" d="M34 60H66" />
      <path className="glyph-fill" d="M66 34H114V86H66Z" />
      <path className="glyph-primary" d="M66 34H114V86H66Z" />
      <path className="glyph-secondary" d="M114 60H150" />
      <path className="glyph-primary glyph-dash" d="M76 68C86 44 96 78 106 52" />
      <circle className="glyph-dot" cx="34" cy="60" r="5" />
      <circle className="glyph-dot glyph-live-dot" cx="150" cy="60" r="5" />
    </>
  );
}

function ControlGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-secondary glyph-dash" d="M44 84C62 54 82 42 104 52C124 62 136 44 150 30" />
      <path className="glyph-primary" d="M44 92C64 74 76 54 96 58C118 62 126 44 146 40" />
      <circle className="glyph-dot" cx="44" cy="92" r="5" />
      <circle className="glyph-dot glyph-live-dot" cx="96" cy="58" r="5" />
      <path className="glyph-secondary" d="M136 34L148 40L138 48" />
    </>
  );
}

function RlGlyph() {
  const nodes = [
    [44, 42],
    [86, 28],
    [126, 42],
    [68, 82],
    [120, 84],
  ];
  return (
    <>
      <path className="glyph-secondary glyph-dash" d="M44 42L86 28L126 42M44 42L68 82L120 84L126 42M86 28L120 84" />
      <path className="glyph-primary" d="M44 42L86 28L126 42" />
      {nodes.map(([x, y], index) => (
        <circle className={index === 1 ? "glyph-dot glyph-live-dot" : "glyph-dot"} cx={x} cy={y} key={`${x}-${y}`} r="6" />
      ))}
      <path className="glyph-fill" d="M114 72L142 72L128 96Z" />
    </>
  );
}

function BanditGlyph() {
  return (
    <>
      <Axes />
      <path className="glyph-fill" d="M48 94V64H66V94M82 94V36H100V94M116 94V54H134V94" />
      <path className="glyph-primary" d="M48 94V64H66V94M82 94V36H100V94M116 94V54H134V94" />
      <circle className="glyph-dot" cx="57" cy="58" r="5" />
      <circle className="glyph-dot glyph-live-dot" cx="91" cy="30" r="5" />
      <circle className="glyph-dot" cx="125" cy="48" r="5" />
    </>
  );
}

function DifferentiableGlyph() {
  return (
    <>
      <path className="glyph-fill" d="M36 42H70V78H36Z" />
      <path className="glyph-fill" d="M82 28H116V92H82Z" />
      <path className="glyph-fill" d="M128 42H162V78H128Z" />
      <path className="glyph-primary" d="M70 60H82M116 60H128" />
      <path className="glyph-secondary glyph-dash" d="M146 78C118 106 74 102 52 78" />
      <circle className="glyph-dot glyph-live-dot" cx="102" cy="60" r="5" />
      <path className="glyph-secondary" d="M56 52L62 60L56 68M96 48L108 60L96 72M142 52L148 60L142 68" />
    </>
  );
}

function HpoGlyph() {
  const points = [
    [42, 82],
    [60, 54],
    [76, 78],
    [92, 36],
    [112, 64],
    [136, 44],
  ];
  return (
    <>
      <Axes />
      <path className="glyph-secondary glyph-dash" d="M40 36H144M40 60H144M40 84H144M64 28V96M96 28V96M128 28V96" />
      <path className="glyph-primary" d="M42 82L60 54L76 78L92 36L112 64L136 44" />
      {points.map(([x, y], index) => (
        <circle className={index === 3 ? "glyph-dot glyph-live-dot" : "glyph-dot"} cx={x} cy={y} key={`${x}-${y}`} r="4.5" />
      ))}
    </>
  );
}

const glyphs = {
  linear: LinearGlyph,
  quadratic: QuadraticGlyph,
  convex: ConvexGlyph,
  conic: ConicGlyph,
  nonlinear: NonlinearGlyph,
  nonconvex: NonconvexGlyph,
  integer: IntegerGlyph,
  combinatorial: CombinatorialGlyph,
  logical: LogicalGlyph,
  stochastic: StochasticGlyph,
  robust: RobustGlyph,
  dro: DroGlyph,
  blackbox: BlackboxGlyph,
  bayesian: BayesianGlyph,
  simulation: SimulationGlyph,
  control: ControlGlyph,
  rl: RlGlyph,
  bandit: BanditGlyph,
  differentiable: DifferentiableGlyph,
  hpo: HpoGlyph,
};

export function OptimizationGlyph({ problem, variant = "card" }) {
  const hint = getVisualHint(problem);
  const Glyph = glyphs[hint.kind] ?? NonlinearGlyph;

  return (
    <span className={`optimization-glyph optimization-glyph-${variant}`} data-kind={hint.kind}>
      <svg aria-label={`${problem.name_ja}: ${hint.cue}`} role="img" viewBox="0 0 180 120">
        <Glyph />
      </svg>
      <span className="optimization-glyph-caption">
        <strong>{hint.label}</strong>
        <span>{hint.cue}</span>
      </span>
    </span>
  );
}
