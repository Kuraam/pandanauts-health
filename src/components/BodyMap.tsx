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

/** Simple clickable human figure. Each part is coloured by the worst status in that region. */
export function BodyMap({ statusByRegion, selected, onSelect }: Props) {
  const part = (region: BodyRegion) => ({
    fill: STATUS_COLOR[statusByRegion[region]],
    fillOpacity: selected === region ? 0.75 : 0.35,
    stroke: selected === region ? '#FF7A1A' : STATUS_COLOR[statusByRegion[region]],
    strokeWidth: selected === region ? 3 : 1.5,
    style: { cursor: 'pointer' as const },
    tabIndex: 0,
    role: 'button',
    'aria-label': `${REGION_INFO[region].label}: ${statusByRegion[region]}`,
    onClick: () => onSelect(region),
    onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onSelect(region),
  });

  return (
    <section className="card stack">
      <h2 style={{ margin: 0 }}>Body status</h2>
      <svg viewBox="0 0 200 330" style={{ width: '100%', maxHeight: 360 }} aria-label="Clickable body map">
        {/* whole-body aura */}
        <ellipse cx="100" cy="165" rx="95" ry="160" {...part('wholeBody')} fillOpacity={selected === 'wholeBody' ? 0.18 : 0.06} />
        {/* legs + arms = musculoskeletal */}
        <g {...part('musculoskeletal')}>
          <rect x="70" y="200" width="24" height="115" rx="12" />
          <rect x="106" y="200" width="24" height="115" rx="12" />
          <rect x="38" y="85" width="18" height="100" rx="9" transform="rotate(8 47 85)" />
          <rect x="144" y="85" width="18" height="100" rx="9" transform="rotate(-8 153 85)" />
        </g>
        {/* torso: abdomen = blood/metabolism */}
        <rect x="62" y="150" width="76" height="58" rx="16" {...part('blood')} />
        {/* chest: lungs */}
        <path d="M62 95 Q62 78 82 78 L118 78 Q138 78 138 95 L138 150 L62 150 Z" {...part('lungs')} />
        {/* heart */}
        <path d="M100 135 C 80 120, 84 102, 96 106 C 99 107, 100 110, 100 112 C 100 110, 101 107, 104 106 C 116 102, 120 120, 100 135 Z" {...part('heart')} />
        {/* head */}
        <circle cx="100" cy="45" r="28" {...part('head')} />
      </svg>
      <div className="row" style={{ gap: 6 }}>
        {(Object.keys(REGION_INFO) as BodyRegion[]).map((r) => (
          <button key={r} className="btn small" aria-pressed={selected === r} onClick={() => onSelect(r)}
            style={{ borderColor: selected === r ? 'var(--orange)' : undefined, padding: '4px 8px' }}>
            {REGION_INFO[r].label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="stack small">
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
