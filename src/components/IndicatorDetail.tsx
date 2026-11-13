import { INDICATORS, type IndicatorId } from '../domain/indicators';
import type { CheckIn } from '../domain/simulate';
import { TrendChart } from './TrendChart';

/** "Why this matters" card plus trend for one indicator. */
export function IndicatorDetail({ id, history }: { id: IndicatorId; history: CheckIn[] }) {
  const ind = INDICATORS[id];
  return (
    <section className="card stack">
      <div className="row spread">
        <h2 style={{ margin: 0 }}>{ind.name}: last {history.length} days</h2>
        <span className="small muted">Shading: normal · watch · critical</span>
      </div>
      <TrendChart id={id} history={history} />
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'start' }}>
        <div className="stack small">
          <strong>ⓘ What is it?</strong>
          <p className="muted">{ind.explain.what}</p>
        </div>
        <div className="stack small">
          <strong>📏 How to measure in space</strong>
          <p className="muted">{ind.explain.howToMeasure}</p>
        </div>
        <div className="stack small">
          <strong>🚀 Why spaceflight changes it</strong>
          <p className="muted">{ind.explain.whySpace}</p>
        </div>
      </div>
      <p className="small muted">
        Normal range: {ind.normalLabel} {ind.unit} · Source: {ind.source}
      </p>
    </section>
  );
}
