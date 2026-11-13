import { INDICATOR_LIST, type IndicatorId } from '../domain/indicators';
import type { Readings } from '../domain/simulate';
import { classify } from '../domain/status';
import { StatusPill } from './StatusPill';

interface Props {
  readings: Readings;
  selected: IndicatorId | null;
  onSelect: (id: IndicatorId) => void;
  source: 'simulated' | 'manual';
}

export function IndicatorTiles({ readings, selected, onSelect, source }: Props) {
  return (
    <section className="card">
      <div className="row spread" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Vital signs today</h2>
        <span className="tag">{source === 'manual' ? '✍ Your check-in' : '🧪 Simulated sensor data'}</span>
      </div>
      <div className="tiles">
        {INDICATOR_LIST.map((ind) => {
          const v = readings[ind.id];
          const status = v === undefined ? null : classify(ind.id, v);
          return (
            <button
              key={ind.id}
              className="tile"
              data-status={status ?? undefined}
              aria-pressed={selected === ind.id}
              onClick={() => onSelect(ind.id)}
            >
              <span className="name">{ind.name}</span>
              <span className="value">
                {v ?? '—'}
                <span className="unit">{ind.unit}</span>
              </span>
              <span className="row spread">
                {status ? <StatusPill status={status} /> : <span className="small muted">Not measured</span>}
                <span className="range">normal {ind.normalLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
