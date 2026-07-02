import { useMemo, useState } from "react";
import { IconArrowRight, IconListCheck, IconRoute, IconSparkles } from "@tabler/icons-react";

import { Badge, ButtonLink, PageHeader } from "../components/ui.jsx";
import { data, labelFor, scoreModelingWizard } from "../data/loadData.js";

function CandidateRow({ row, index, maxScore }) {
  const width = Math.max(16, Math.round((row.score / maxScore) * 100));

  if (row.id === "not_optimization") {
    return (
      <article className="result-card result-warning-card">
        <IconListCheck aria-hidden="true" size={22} />
        <div>
          <span className="result-title-line">
            <strong>{row.label}</strong>
            <em className="num">score {row.score}</em>
          </span>
          <span>最適化に進む前に、判断基準・予測・合意形成を切り分けます。</span>
          <span className="score-meter"><span style={{ width: `${width}%` }} /></span>
        </div>
        <span className="rank num">{index + 1}</span>
      </article>
    );
  }

  return (
    <article className="result-card">
      <span className="rank num">{index + 1}</span>
      <div>
        <span className="result-title-line">
          <strong>{row.label}</strong>
          <em className="num">score {row.score}</em>
        </span>
        <span>{row.item.summary}</span>
        <span className="score-meter"><span style={{ width: `${width}%` }} /></span>
      </div>
      <ButtonLink href={`#/problems/${row.id}`} icon={IconArrowRight}>読む</ButtonLink>
    </article>
  );
}

export function WizardView() {
  const [answers, setAnswers] = useState({});
  const result = useMemo(() => scoreModelingWizard(answers), [answers]);
  const answered = Object.keys(answers).length;
  const maxScore = Math.max(...result.topProblems.map((row) => row.score), 1);

  return (
    <div className="view-stack">
      <PageHeader
        action={<Badge tone={answered ? "active" : "idle"}>{answered} / {data.modelingWizard.length}</Badge>}
        eyebrow="Modeling Wizard"
        title="課題をモデルへ翻訳する"
      >
        決定変数、目的、制約、不確実性を短く整理して、ProblemType、Pattern、SolveStory、AI Brief へ接続します。
      </PageHeader>

      <section className="diagnosis-layout wizard-layout">
        <div className="panel questions wizard-questions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Questions</p>
              <h2>5分で一周する</h2>
            </div>
            {answered > 0 && (
              <button className="text-button" onClick={() => setAnswers({})} type="button">
                クリア
              </button>
            )}
          </div>

          {data.modelingWizard.map((step) => (
            <fieldset className="wizard-step" key={step.id}>
              <legend>{step.question}</legend>
              <div className="wizard-answer-grid">
                {step.answers.map((answer) => (
                  <label className="wizard-answer" key={answer.id}>
                    <input
                      checked={answers[step.id] === answer.id}
                      name={step.id}
                      onChange={() => setAnswers((current) => ({ ...current, [step.id]: answer.id }))}
                      type="radio"
                    />
                    <span>{answer.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="panel diagnosis-results wizard-results" role="status" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Model Route</p>
              <h2>次に進む候補</h2>
            </div>
            <ButtonLink href="#/diagnosis" icon={IconListCheck}>診断も見る</ButtonLink>
          </div>

          {answered === 0 ? (
            <div className="empty-state">回答すると ProblemType top-3 と実装 brief 候補が表示されます。</div>
          ) : (
            <>
              <section className="wizard-result-block">
                <div className="section-heading section-heading-tight">
                  <div>
                    <p className="eyebrow">Top-3</p>
                    <h3>ProblemType</h3>
                  </div>
                </div>
                {result.topProblems.slice(0, 3).map((row, index) => (
                  <CandidateRow index={index} key={row.id} maxScore={maxScore} row={row} />
                ))}
              </section>

              {result.framingSteps.length > 0 && (
                <section className="warning-state">
                  <strong>先に整理すること</strong>
                  <ul>
                    {result.framingSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="wizard-result-block">
                <div className="section-heading section-heading-tight">
                  <div>
                    <p className="eyebrow">Pattern</p>
                    <h3>モデル化の型</h3>
                  </div>
                </div>
                <div className="chip-list chip-list-large">
                  {result.topPatterns.map((row) => (
                    <Badge key={row.id} tone="active">{row.item.name_ja}</Badge>
                  ))}
                </div>
              </section>

              <section className="wizard-result-block">
                <div className="section-heading section-heading-tight">
                  <div>
                    <p className="eyebrow">SolveStory</p>
                    <h3>まず小さく見る</h3>
                  </div>
                  <IconSparkles aria-hidden="true" size={18} />
                </div>
                <div className="action-list">
                  {result.storySuggestions.map((story) => (
                    <ButtonLink href={`#/stories/${story.id}`} icon={IconRoute} key={story.id}>{story.title}</ButtonLink>
                  ))}
                </div>
              </section>

              <section className="wizard-result-block">
                <div className="section-heading section-heading-tight">
                  <div>
                    <p className="eyebrow">AI Brief</p>
                    <h3>実装へ持ち出す</h3>
                  </div>
                </div>
                <div className="action-list">
                  {result.briefSuggestions.map((brief) => (
                    <ButtonLink href={`#/briefs/${brief.id}`} key={brief.id}>{brief.title}</ButtonLink>
                  ))}
                </div>
              </section>

              {result.nextQuestions.length > 0 && (
                <section className="soft-note">
                  次に迷うなら: {result.nextQuestions.map((step) => step.question).join(" / ")}
                </section>
              )}

              <section className="wizard-result-block">
                <div className="chip-list">
                  {result.answeredSteps.slice(-3).map(({ answer }) => (
                    <Badge key={answer.id}>{answer.label}</Badge>
                  ))}
                  <Badge tone="idle">{labelFor(result.topProblems[0]?.id)}</Badge>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
