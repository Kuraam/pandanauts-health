import { useState } from 'react';
import type { Guidance } from '../domain/guidance';
import type { IndicatorId } from '../domain/indicators';
import { StatusPill } from './StatusPill';

interface Props {
  guidance: Guidance;
  onSelect: (id: IndicatorId) => void;
}

const HEADLINE_COLOR = { normal: 'var(--ok)', watch: 'var(--watch)', critical: 'var(--crit)' };

export function StatusHero({ guidance, onSelect }: Props) {
  const [sent, setSent] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const sorted = guidance.alerts.slice().sort((a, b) => (a.status === b.status ? 0 : a.status === 'critical' ? -1 : 1));

  return (
    <section className="card stack" aria-live="polite">
      <div className="row spread">
        <h2 className="hud-title">Today's assessment</h2>
        <span className="tag" title="Deterministic onboard rules. No connection to Earth needed.">⚙ ONBOARD RULES ENGINE</span>
      </div>

      <div>
        <h3 style={{ fontSize: 30, fontWeight: 700, color: HEADLINE_COLOR[guidance.overall], textShadow: `0 0 24px ${HEADLINE_COLOR[guidance.overall]}55` }}>
          {guidance.headline}
        </h3>
        <p className="muted" style={{ marginTop: 6 }}>{guidance.summary}</p>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {sorted.map((a, i) => {
          const open = openId === a.id || (openId === null && i === 0);
          return (
            <div key={a.id} className="tile" data-status={a.status} style={{ padding: 0 }}>
              <button onClick={() => setOpenId(open ? '' : a.id)} aria-expanded={open}
                className="row spread" style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px 11px 16px' }}>
                <strong style={{ fontSize: 15 }}>{a.title}</strong>
                <span className="row" style={{ gap: 8 }}>
                  <StatusPill status={a.status} />
                  <span aria-hidden className="muted mono">{open ? '−' : '+'}</span>
                </span>
              </button>
              {open && (
                <div className="stack small" style={{ gap: 8, padding: '0 14px 12px 16px' }}>
                  <p className="muted">{a.detail}</p>
                  <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
                    {a.actions.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                  {a.indicator && (
                    <button className="btn small" style={{ justifySelf: 'start' }} onClick={() => onSelect(a.indicator!)}>View trend →</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="row spread" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <p className="small muted" style={{ flex: '1 1 220px' }}>
          <span className="mono" style={{ color: 'var(--holo)' }}>📡 COMMS </span>{guidance.escalateNote}
        </p>
        <button className={guidance.escalate ? 'btn btn-primary' : 'btn'} onClick={() => setSent(true)} disabled={sent}>
          {sent ? '✓ Report queued for flight surgeons' : '📨 Send report to flight surgeons'}
        </button>
      </div>
    </section>
  );
}
