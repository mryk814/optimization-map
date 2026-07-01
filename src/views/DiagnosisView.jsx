import { useState } from "react";
import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";

import { data, labelFor, scoreDiagnosis } from "../data/loadData.js";
import { Badge, ButtonLink, PageHeader } from "../components/ui.jsx";
import { OptimizationGlyph } from "../components/OptimizationGlyph.jsx";

export function DiagnosisView() {
  const [answers, setAnswers] = useState({});
  const results = scoreDiagnosis(answers).slice(0, 5);
  const answered = Object.keys(answers).length;
  const maxScore = Math.max(...results.map((result) => result.score), 1);
  const warnings = [...new Set(results.flatMap((result) => result.warnings ?? []))];
  const nextQuestions = data.diagnosisQuestions
    .filter((question) => !answers[question.id])
    .slice(0, 2)
    .map((question) => question.label);

  return (
    <div className="view-stack">
      <PageHeader
        action={<Badge tone={answered ? "active" : "idle"}>{answered} / {data.diagnosisQuestions.length}</Badge>}
        eyebrow="Diagnosis"
        title="条件から候補を出す"
      >
        ここで出る候補は断定ではなく、次に読む問題タイプを絞るための入口です。
      </PageHeader>

      <section className="diagnosis-layout">
        <div className="panel questions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Questions</p>
              <h2>課題の形</h2>
            </div>
            {answered > 0 && (
              <button className="text-button" onClick={() => setAnswers({})} type="button">
                クリア
              </button>
            )}
          </div>
          {data.diagnosisQuestions.map((question) => (
            <fieldset key={question.id}>
              <legend>{question.label}</legend>
              <div className="segmented">
                {question.answers.map((answer) => (
                  <label key={answer.id}>
                    <input
                      checked={answers[question.id] === answer.id}
                      name={question.id}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: answer.id }))}
                      type="radio"
                    />
                    <span>{answer.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="panel diagnosis-results" role="status" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Candidates</p>
              <h2>次に読む候補</h2>
            </div>
          </div>
          {results.length === 0 ? (
            <div className="empty-state">回答すると候補タイプが表示されます。</div>
          ) : (
            <>
              {warnings.map((warning) => (
                <div className="warning-state" key={warning}>{warning}</div>
              ))}
              {results.map((result, index) => {
                if (!result.problem) {
                  return (
                    <article className="result-card result-warning-card" key={result.id}>
                      <IconAlertTriangle aria-hidden="true" size={22} />
                      <div>
                        <strong>{result.label}</strong>
                        <span>{result.reasons.join(" / ")}</span>
                        <span>最適化モデルへ進む前に、意思決定変数・目的・制約を文章で切り分けてください。</span>
                      </div>
                      <span className="rank num">{index + 1}</span>
                    </article>
                  );
                }

                const algorithms = result.problem.candidate_algorithms.slice(0, 3).map(labelFor);
                const solvers = result.problem.candidate_solvers.slice(0, 3).map(labelFor);
                return (
                  <article className="result-card" key={result.id}>
                    <OptimizationGlyph problem={result.problem} variant="result" />
                    <div>
                      <span className="result-title-line">
                        <strong>{result.label}</strong>
                        <em className="num">score {result.score}</em>
                      </span>
                      <span>{result.reasons.slice(0, 3).join(" / ")}</span>
                      <span className="score-meter">
                        <span style={{ width: `${Math.round((result.score / maxScore) * 100)}%` }} />
                      </span>
                      <div className="result-detail-grid">
                        <span><b>Algorithm</b>{algorithms.join(" / ")}</span>
                        <span><b>Solver</b>{solvers.join(" / ")}</span>
                        <span><b>次に確認</b>{nextQuestions.join(" / ") || "詳細記事で前提を確認"}</span>
                      </div>
                    </div>
                    <ButtonLink href={`#/problems/${result.id}`} icon={IconArrowRight}>読む</ButtonLink>
                  </article>
                );
              })}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
