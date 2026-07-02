import { useMemo } from "react";
import { IconBook2, IconChartDots, IconListSearch, IconRoute, IconSearch } from "@tabler/icons-react";

import { MotionPreview } from "../components/MotionPreview.jsx";
import { data, filterProblems, getPathForCase, labelFor, maps } from "../data/loadData.js";
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
  const featuredStories = data.solveStories.filter((story) => story.visual_trace_id).slice(0, 4);

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
        <a className="entry-card" href="#/wizard">
          <IconListSearch aria-hidden="true" size={24} />
          <span>モデル化を整理する</span>
          <strong>変数、目的、制約を答えて story と brief まで辿ります。</strong>
        </a>
        <a className="entry-card" href="#/problems">
          <IconSearch aria-hidden="true" size={24} />
          <span>問題タイプを検索する</span>
          <strong>用語を知っている時は一覧から直接読めます。</strong>
        </a>
        <a className="entry-card" href="#/algorithms">
          <IconChartDots aria-hidden="true" size={24} />
          <span>手法の動きを見る</span>
          <strong>Algorithm を motion preview で見比べます。</strong>
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

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Small Demos</p>
            <h2>小さく解いてみる</h2>
          </div>
          <div className="inline-actions">
            <ButtonLink href="#/stories">Story 一覧</ButtonLink>
            <ButtonLink href="#/learning">学習パス</ButtonLink>
          </div>
        </div>
        <div className="story-mini-grid story-mini-grid-visual">
          {featuredStories.map((story) => (
            <a className="story-mini-card story-mini-card-visual" href={`#/stories/${story.id}`} key={story.id}>
              <MotionPreview className="motion-preview-mini" traceId={story.visual_trace_id} />
              <strong>{story.title}</strong>
              <span>{labelFor(story.primary_problem_class)} / {maps.traces[story.visual_trace_id]?.trace_type}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
