import { useMemo } from "react";
import { IconBook2, IconListSearch, IconRoute, IconSearch } from "@tabler/icons-react";

import { data, filterProblems, getPathForCase, labelFor } from "../data/loadData.js";
import { Badge, ButtonLink, CaseCard, PageHeader, ProblemCard, RoutePath } from "../components/ui.jsx";

function sampleItems(items, count) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

export function HomeView() {
  const starterCases = useMemo(() => sampleItems(data.exampleCases, 3), []);
  const starterPath = getPathForCase(starterCases[0]?.id);
  const featuredProblems = filterProblems("", "all").slice(0, 4);

  return (
    <div className="view-stack">
      <PageHeader eyebrow="Optimization Map" title="課題から、読んで辿る最適化の地図">
        問題名を知らない状態から、近いケース、候補タイプ、手法、solver まで順に確認します。
      </PageHeader>

      <section className="entry-grid" aria-label="入口">
        <a className="entry-card entry-card-primary" href="#/cases">
          <IconBook2 aria-hidden="true" size={24} />
          <span>近いケースから探す</span>
          <strong>配送、シフト、実験、在庫のような現実課題から入ります。</strong>
        </a>
        <a className="entry-card" href="#/diagnosis">
          <IconListSearch aria-hidden="true" size={24} />
          <span>条件から診断する</span>
          <strong>変数、線形性、不確実性を答えて候補を出します。</strong>
        </a>
        <a className="entry-card" href="#/problems">
          <IconSearch aria-hidden="true" size={24} />
          <span>問題タイプを検索する</span>
          <strong>用語を知っている時は一覧から直接読めます。</strong>
        </a>
      </section>

      {starterPath && (
        <section className="panel story-panel" aria-labelledby="home-route-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">How To Solve</p>
              <h2 id="home-route-heading">この課題なら、こう考える</h2>
            </div>
            <ButtonLink href={`#/paths/${starterPath.example.id}`} icon={IconRoute}>解き方を見る</ButtonLink>
          </div>
          <RoutePath example={starterPath.example} problem={starterPath.primary} />
        </section>
      )}

      <section className="split-section">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Cases</p>
              <h2>入口になるケース</h2>
            </div>
            <ButtonLink href="#/cases">すべて見る</ButtonLink>
          </div>
          <div className="case-list">
            {starterCases.map((example) => (
              <CaseCard example={example} key={example.id} />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Problem Types</p>
              <h2>よく使う候補</h2>
            </div>
            <Badge tone="idle">{data.problemClasses.length} 件</Badge>
          </div>
          <div className="problem-list">
            {featuredProblems.map((problem) => (
              <ProblemCard compact key={problem.id} problem={problem} />
            ))}
          </div>
          <div className="soft-note">例: {featuredProblems.map((problem) => labelFor(problem.id)).join(" / ")}</div>
        </div>
      </section>
    </div>
  );
}
