import { useEffect, useMemo, useState } from "react";

import { data, downloadCsv } from "./data/loadData.js";
import { CaseDetailView, CasesView } from "./views/CasesView.jsx";
import { AlgorithmDetailView, AlgorithmsView } from "./views/AlgorithmsView.jsx";
import { CompareView } from "./views/CompareView.jsx";
import { DiagnosisView } from "./views/DiagnosisView.jsx";
import { GraphView } from "./views/GraphView.jsx";
import { HomeView } from "./views/HomeView.jsx";
import { LearningDetailView, LearningView } from "./views/LearningView.jsx";
import { PathView } from "./views/PathView.jsx";
import { ProblemDetailView } from "./views/ProblemDetailView.jsx";
import { ProblemsView } from "./views/ProblemsView.jsx";
import { QualityView } from "./views/QualityView.jsx";
import { BriefsView, StoriesView, StoryDetailView } from "./views/StoriesView.jsx";
import { WizardView } from "./views/WizardView.jsx";

function parseHash(hash) {
  const path = (hash || "#/").replace(/^#\/?/, "");
  const [name = "", first = "", second = ""] = path.split("/");
  return { name: name || "home", first, second };
}

function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/");
    }
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

const navItems = [
  { href: "#/", label: "入口", match: "home" },
  { href: "#/cases", label: "ケース", match: "cases" },
  { href: "#/wizard", label: "診断", match: "diagnosis" },
  { href: "#/problems", label: "問題タイプ", match: "problems" },
  { href: "#/algorithms", label: "手法", match: "algorithms" },
  { href: "#/learning", label: "学習", match: "learning" },
  { href: "#/quality", label: "品質", match: "quality" },
];

export default function App() {
  const route = useHashRoute();
  const [toast, setToast] = useState("");

  const activeNav = useMemo(() => {
    if (route.name === "problems" || route.name === "problem") {
      return "problems";
    }
    if (route.name === "cases" || route.name === "paths") {
      return "cases";
    }
    if (route.name === "algorithms" || route.name === "stories" || route.name === "briefs") {
      return "algorithms";
    }
    if (route.name === "learning") {
      return "learning";
    }
    if (route.name === "quality" || route.name === "graph") {
      return "quality";
    }
    if (route.name === "wizard") {
      return "diagnosis";
    }
    return route.name;
  }, [route.name]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const copyRows = async (text) => {
    await navigator.clipboard.writeText(text);
    showToast("コピーしました");
  };

  const exportRows = (rows, columns) => {
    downloadCsv("optimization-map_problem_classes.csv", rows, columns);
    showToast("CSVを書き出しました");
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/">
          <span>Optimization Map</span>
          <strong>課題から読む最適化の地図</strong>
        </a>
        <nav aria-label="主要ナビゲーション" className="site-nav">
          {navItems.map((item) => (
            <a aria-current={activeNav === item.match ? "page" : undefined} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {route.name === "home" && <HomeView />}
        {route.name === "algorithms" && (route.first ? <AlgorithmDetailView algorithmId={route.first} /> : <AlgorithmsView />)}
        {route.name === "briefs" && <BriefsView briefId={route.first} />}
        {route.name === "cases" && (route.first ? <CaseDetailView caseId={route.first} /> : <CasesView />)}
        {route.name === "diagnosis" && <DiagnosisView />}
        {route.name === "graph" && <GraphView focusId={route.first} />}
        {route.name === "learning" && (route.first ? <LearningDetailView pathId={route.first} /> : <LearningView />)}
        {route.name === "problems" && (route.first ? <ProblemDetailView problemId={route.first} /> : <ProblemsView onCopyRows={copyRows} onExportRows={exportRows} />)}
        {route.name === "quality" && <QualityView />}
        {route.name === "stories" && (route.first ? <StoryDetailView storyId={route.first} /> : <StoriesView />)}
        {route.name === "wizard" && <WizardView />}
        {route.name === "compare" && <CompareView leftId={route.first || "linear_programming"} rightId={route.second || "convex_optimization"} />}
        {route.name === "paths" && <PathView caseId={route.first || data.exampleCases[0].id} />}
        {!["home", "algorithms", "briefs", "cases", "diagnosis", "graph", "learning", "problems", "quality", "stories", "wizard", "compare", "paths"].includes(route.name) && <HomeView />}
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
