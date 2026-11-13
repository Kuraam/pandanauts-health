import type { BodyRegion, Status } from '../domain/indicators';
import { STATUS_COLOR, StatusPill } from './StatusPill';

export const REGION_INFO: Record<BodyRegion, { label: string; blurb: string }> = {
  head: { label: 'Brain & mind', blurb: 'Sleep and mood. Isolation, confinement and disrupted light cycles affect the brain and behaviour.' },
  heart: { label: 'Heart & circulation', blurb: 'Heart rate and blood pressure. Fluids shift toward the head in microgravity and the heart deconditions.' },
  lungs: { label: 'Lungs & breathing', blurb: 'Blood oxygen and breathing rate. The closed cabin depends on life support.' },
  blood: { label: 'Blood & metabolism', blurb: 'Blood sugar. Inactivity and stress can cause insulin resistance; immune function weakens.' },
  musculoskeletal: { label: 'Bones & muscles', blurb: 'Without gravity, weight-bearing bones and muscles weaken unless you exercise every day.' },
  wholeBody: { label: 'Whole body', blurb: 'Body temperature and radiation dose. Radiation exposure raises long-term cancer risk.' },
};

interface Props {
  statusByRegion: Record<BodyRegion, Status>;
  selected: BodyRegion | null;
  onSelect: (r: BodyRegion) => void;
}

const HOLO = '#6fd3ff';

/** Hologram-style clickable body. Parts glow in their status colour; flagged parts pulse. */
export function BodyMap({ statusByRegion, selected, onSelect }: Props) {
  const part = (region: BodyRegion) => {
    const s = statusByRegion[region];
    const isSel = selected === region;
    return {
      fill: s === 'normal' ? HOLO : STATUS_COLOR[s],
      fillOpacity: isSel ? 0.55 : s === 'normal' ? 0.14 : 0.3,
      stroke: isSel ? '#FF7A1A' : s === 'normal' ? HOLO : STATUS_COLOR[s],
      strokeWidth: isSel ? 2.5 : 1.4,
      className: s !== 'normal' && !isSel ? 'pulse' : undefined,
      style: { cursor: 'pointer' as const, filter: `drop-shadow(0 0 6px ${s === 'normal' ? 'rgba(111,211,255,.45)' : 'rgba(255,170,60,.5)'})` },
      tabIndex: 0,
      role: 'button',
      'aria-label': `${REGION_INFO[region].label}: ${s}`,
      onClick: () => onSelect(region),
      onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onSelect(region),
    };
  };

  return (
    <section className="card stack">
      <div className="row spread">
        <h2 className="hud-title">Body scan</h2>
        <span className="tag">TAP A REGION</span>
      </div>
      <svg viewBox="0 0 200 340" style={{ width: '100%', maxHeight: 380 }} aria-label="Clickable body map">
        <defs>
          <linearGradient id="scanGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={HOLO} stopOpacity="0" />
            <stop offset="1" stopColor={HOLO} stopOpacity="0.35" />
          </linearGradient>
          <clipPath id="bodyClip"><rect x="0" y="0" width="200" height="330" /></clipPath>
        </defs>

        {/* whole body: rotating radar ring */}
        <g {...part('wholeBody')} fillOpacity={0} className="spin-slow">
          <circle cx="100" cy="165" r="96" strokeDasharray="4 7" />
        </g>
        <circle cx="100" cy="165" r="82" fill="none" stroke="rgba(111,211,255,.12)" />

        {/* platform */}
        <ellipse cx="100" cy="322" rx="62" ry="9" fill="none" stroke={HOLO} strokeOpacity=".45" />
        <ellipse cx="100" cy="322" rx="40" ry="5" fill={HOLO} fillOpacity=".15" />

        <g {...part('musculoskeletal')}>
          <rect x="70" y="205" width="25" height="112" rx="12" />
          <rect x="105" y="205" width="25" height="112" rx="12" />
          <rect x="37" y="88" width="18" height="102" rx="9" transform="rotate(9 46 88)" />
          <rect x="145" y="88" width="18" height="102" rx="9" transform="rotate(-9 154 88)" />
        </g>
        <rect x="62" y="152" width="76" height="58" rx="16" {...part('blood')} />
        <path d="M62 97 Q62 80 82 80 L118 80 Q138 80 138 97 L138 152 L62 152 Z" {...part('lungs')} />
        <path d="M100 137 C 80 122, 84 104, 96 108 C 99 109, 100 112, 100 114 C 100 112, 101 109, 104 108 C 116 104, 120 122, 100 137 Z" {...part('heart')} />
        <circle cx="100" cy="47" r="28" {...part('head')} />

        {/* scanning beam */}
        <g clipPath="url(#bodyClip)" pointerEvents="none">
          <rect className="scanline" x="20" y="-24" width="160" height="24" fill="url(#scanGrad)" />
        </g>
      </svg>

      <div className="row" style={{ gap: 6 }}>
        {(Object.keys(REGION_INFO) as BodyRegion[]).map((r) => (
          <button key={r} className="btn small" aria-pressed={selected === r} onClick={() => onSelect(r)} style={{ padding: '4px 9px' }}>
            <span aria-hidden style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 4, marginRight: 6, background: statusByRegion[r] === 'normal' ? HOLO : STATUS_COLOR[statusByRegion[r]] }} />
            {REGION_INFO[r].label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="stack small" style={{ gap: 6, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <div className="row spread">
            <strong>{REGION_INFO[selected].label}</strong>
            <StatusPill status={statusByRegion[selected]} />
          </div>
          <p className="muted">{REGION_INFO[selected].blurb}</p>
        </div>
      )}
    </section>
  );
}
