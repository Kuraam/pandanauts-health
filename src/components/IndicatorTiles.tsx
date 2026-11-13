import { INDICATOR_LIST, type IndicatorId } from '../domain/indicators';
import type { CheckIn } from '../domain/simulate';
import { classify } from '../domain/status';
import { Sparkline } from './Sparkline';
import { STATUS_COLOR, StatusPill } from './StatusPill';

interface Props {
  history: CheckIn[];
  selected: IndicatorId | null;
  onSelect: (id: IndicatorId) => void;
}

export function IndicatorTiles({ history, selected, onSelect }: Props) {
  const today = history.at(-1);
  const last14 = history.slice(-14);
  return (
    <section className="card stack">
      <div className="row spread">
        <h2 className="hud-title">Vital telemetry</h2>
        <span className="tag">{today?.source === 'manual' ? '✍ YOUR CHECK-IN' : '🧪 SIMULATED SENSORS'}</span>
      </div>
      <div className="tiles">
        {INDICATOR_LIST.map((ind) => {
          const v = today?.readings[ind.id];
          const status = v === undefined ? null : classify(ind.id, v);
          const series = last14.map((c) => c.readings[ind.id]).filter((x): x is number => x !== undefined);
          return (
            <button key={ind.id} className="tile" data-status={status ?? undefined}
              aria-pressed={selected === ind.id} onClick={() => onSelect(ind.id)}>
              <span className="name">{ind.name}</span>
              <span className="row spread" style={{ gap: 6 }}>
                <span className="value">
                  {v ?? '—'}<span className="unit">{ind.unit}</span>
                </span>
                {status && <StatusPill status={status} />}
              </span>
              <Sparkline values={series} color={status ? STATUS_COLOR[status] : 'var(--muted)'} />
              <span className="range">NORMAL {ind.normalLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
