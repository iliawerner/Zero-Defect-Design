import { notFound } from 'next/navigation';
import { Header } from '../../../components/Header';
import { getEvaluation } from '../../../lib/storage';
import type { EvaluationResult } from '../../../lib/types';

export default async function EvaluationDetailsPage({ params }: { params: { id: string } }) {
  const evaluation = await getEvaluation(params.id);

  if (!evaluation) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '32px 0 64px', display: 'grid', gap: '24px' }}>
        <section className="card" style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0 }}>{evaluation.summary.title}</h1>
              <p style={{ margin: '4px 0 0', color: 'rgba(15,23,42,0.6)' }}>{evaluation.summary.projectSummary}</p>
            </div>
            <span className="badge success">Готово</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {evaluation.summary.scores.map((score) => (
              <span key={score.label} className="badge neutral">
                {score.label}: {score.value}
              </span>
            ))}
          </div>
        </section>
        {evaluation.steps.map((step) => (
          <section key={step.step} className="card" style={{ display: 'grid', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{stepTitle(step.step)}</h2>
            <pre
              style={{
                margin: 0,
                background: 'rgba(15,23,42,0.04)',
                padding: '16px',
                borderRadius: '12px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.95rem',
              }}
            >
              {step.content}
            </pre>
          </section>
        ))}
        {evaluation.finalReportUrl && (
          <a className="button" style={{ justifySelf: 'flex-start' }} href={evaluation.finalReportUrl} target="_blank" rel="noreferrer">
            Скачать PDF
          </a>
        )}
      </main>
    </>
  );
}

function stepTitle(step: EvaluationResult['steps'][number]['step']) {
  switch (step) {
    case 'layoutOverview':
      return 'Общая карта макета';
    case 'designQuality':
      return 'Общее качество дизайна';
    case 'accessibility':
      return 'Аксессибилити';
    case 'designSystem':
      return 'Проверка дизайн-системы';
    case 'finalReport':
      return 'Финальный отчёт';
    default:
      return step;
  }
}
