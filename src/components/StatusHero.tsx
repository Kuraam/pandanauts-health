import { useState } from 'react';
import type { Guidance } from '../domain/guidance';
import type { IndicatorId } from '../domain/indicators';
import { StatusPill } from './StatusPill';

interface Props {
  guidance: Guidance;
  onSelect: (id: IndicatorId) => void;
}

export function StatusHero({ guidance, onSelect }: Props) {
  const [sent, setSent] = useState(false);
  return (
    <section className="card stack" aria-live="polite">
      <div className="row spread">
        <h2 style={{ margin: 0 }}>Today's assessment</h2>
        <span className="tag" title="Deterministic onboard rules. No connection to Earth needed.">
          ⚙ Onboard rules engine
        </span>
      </div>
      <div className="row">
        <StatusPill status={guidance.overall} />
        <h3 style={{ fontSize: 22 }}>{guidance.headline}</h3>
      </div>
      <p className="muted">{guidance.summary}</p>

      {guidance.alerts.map((a) => (
        <details key={a.id} className="tile" data-status={a.status} open={a.status === 'critical'}>
          <summary className="row spread" style={{ cursor: 'pointer' }}>
            <strong>{a.title}</strong>
            <StatusPill status={a.status} />
          </summary>
          <p className="small muted" style={{ marginTop: 6 }}>{a.detail}</p>
          <ol className="small" style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {a.actions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {a.indicator && (
            <button className="btn small" style={{ justifySelf: 'start', marginTop: 6 }} onClick={() => onSelect(a.indicator!)}>
              See trend →
            </button>
          )}
        </details>
      ))}

      <div className="row spread" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
        <p className="small muted" style={{ flex: '1 1 220px' }}>{guidance.escalateNote}</p>
        <button
          className={guidance.escalate ? 'btn btn-primary' : 'btn'}
          onClick={() => setSent(true)}
          disabled={sent}
        >
          {sent ? '✓ Report queued for flight surgeons' : '📨 Send report to flight surgeons'}
        </button>
      </div>
    </section>
  );
}
