import type { Readiness } from '../domain/readiness';
import type { CheckIn } from '../domain/simulate';
import { EXERCISE_TARGET_MIN } from '../domain/models';
import { StatusPill, STATUS_COLOR } from './StatusPill';

interface Props {
  readiness: Readiness;
  streak: number;
  today?: CheckIn;
  missionDay: number;
  onCheckIn: () => void;
}

const R = 74;
const C = 2 * Math.PI * R;

/** Circular readiness gauge + check-in streak + today's routine checklist. */
export function ReadinessPanel({ readiness, streak, today, missionDay, onCheckIn }: Props) {
  const color = STATUS_COLOR[readiness.status];
  const isToday = today?.day === missionDay;
  const routine = [
    { label: 'Morning vitals', done: isToday && today!.readings.heartRate !== undefined && today!.readings.systolic !== undefined },
    { label: 'Sleep logged', done: isToday && today!.readings.sleep !== undefined },
    { label: 'Mood check-in', done: isToday && today!.readings.mood !== undefined },
    { label: `Exercise ${EXERCISE_TARGET_MIN} min`, done: isToday && today!.exerciseMin >= EXERCISE_TARGET_MIN },
  ];
  const doneCount = routine.filter((r) => r.done).length;

  return (
    <section className="card stack" style={{ gap: 14 }}>
      <div className="row spread">
        <h2 className="hud-title">Mission readiness</h2>
        <StatusPill status={readiness.status} label={readiness.label} />
      </div>

      <div style={{ display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label={`Readiness ${readiness.score} out of 100`}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* tick ring */}
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1="100" y1="8" x2="100" y2={i % 5 === 0 ? 16 : 12}
              stroke="rgba(185,194,222,.35)" strokeWidth={i % 5 === 0 ? 1.5 : 1}
              transform={`rotate(${i * 6} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(120,140,210,.15)" strokeWidth="12" />
          <circle cx="100" cy="100" r={R} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(readiness.score / 100) * C} ${C}`} transform="rotate(-90 100 100)" filter="url(#glow)" />
          <text x="100" y="104" textAnchor="middle" fill="#fff" fontFamily="IBM Plex Mono, monospace" fontSize="46" fontWeight="600">
            {readiness.score}
          </text>
          <text x="100" y="128" textAnchor="middle" fill="#8a93b4" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="2">
            / 100
          </text>
        </svg>
      </div>

      <div className="row spread" style={{ background: 'var(--orange-soft)', border: '1px solid rgba(255,122,26,.35)', borderRadius: 12, padding: '10px 12px' }}>
        <span className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 22 }} aria-hidden>🔥</span>
          <span>
            <strong className="mono" style={{ fontSize: 20 }}>{streak}</strong>
            <span className="small muted"> day check-in streak</span>
          </span>
        </span>
        {streak >= 7 && <span className="tag" title="Checked in 7 days in a row">🏅 Consistent crew</span>}
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div className="row spread small">
          <span className="muted mono">TODAY'S ROUTINE</span>
          <span className="mono">{doneCount}/{routine.length}</span>
        </div>
        {routine.map((r) => (
          <div key={r.label} className="row small" style={{ gap: 8 }}>
            <span aria-hidden style={{
              width: 18, height: 18, borderRadius: 5, display: 'grid', placeItems: 'center', fontSize: 12,
              border: `1px solid ${r.done ? 'var(--ok)' : 'var(--line-strong)'}`,
              background: r.done ? 'rgba(52,211,153,.15)' : 'transparent', color: 'var(--ok)',
            }}>{r.done ? '✓' : ''}</span>
            <span style={{ color: r.done ? 'var(--text-2)' : 'var(--text)' }}>{r.label}</span>
            {!r.done && <span className="tag" style={{ marginLeft: 'auto', color: 'var(--watch)' }}>DUE</span>}
          </div>
        ))}
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={onCheckIn}>＋ Log today's check-in</button>
      </div>
    </section>
  );
}
