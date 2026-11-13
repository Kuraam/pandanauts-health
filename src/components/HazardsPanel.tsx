import { INDICATORS, type IndicatorId, type Status } from '../domain/indicators';
import { formatDelay, type Mission } from '../domain/missions';
import { STATUS_COLOR, StatusPill } from './StatusPill';

export interface HazardState {
  radiation: Status;
  isolation: Status;
  distance: Status;
  gravity: Status;
  environment: Status;
}

interface Props {
  mission: Mission;
  state: HazardState;
  doseMsv: number;
  onSelect: (id: IndicatorId) => void;
}

/**
 * NASA Human Research Program's five hazards of human spaceflight ("RIDGE").
 * Each hazard links to the indicators the app tracks for it.
 */
export function HazardsPanel({ mission, state, doseMsv, onSelect }: Props) {
  const hazards: { key: keyof HazardState; icon: string; name: string; stat: string; why: string; links: IndicatorId[] }[] = [
    { key: 'radiation', icon: '☢', name: 'Radiation', stat: `${doseMsv.toFixed(0)} mSv total · ${mission.radiationPerDay}/day`,
      why: 'Outside Earth\'s magnetic field, cosmic rays and solar storms damage cells and raise cancer risk.', links: [] },
    { key: 'isolation', icon: '🧠', name: 'Isolation & confinement', stat: 'Small crew, closed habitat',
      why: 'Months in a small space far from family affect mood, sleep and teamwork.', links: ['mood', 'sleep'] },
    { key: 'distance', icon: '📡', name: 'Distance from Earth', stat: `Signal delay ${formatDelay(mission.commsDelaySec)} each way`,
      why: 'The farther out, the longer help takes. The crew must assess and act alone.', links: [] },
    { key: 'gravity', icon: '🦴', name: 'Gravity fields', stat: mission.gravity === 0 ? 'Microgravity, 0 g' : `${mission.gravity} g`,
      why: 'Without gravity, bones thin, muscles waste and the heart and blood vessels decondition.', links: ['heartRate', 'systolic'] },
    { key: 'environment', icon: '🛰', name: 'Hostile, closed environment', stat: 'Recycled air & water',
      why: 'Life support faults, CO₂ build-up and germs in a sealed cabin threaten breathing and immunity.', links: ['spo2', 'respiration', 'temperature'] },
  ];

  return (
    <section className="card stack">
      <div className="row spread">
        <h2 className="hud-title">NASA's 5 hazards of spaceflight</h2>
        <span className="tag" title="NASA Human Research Program">SOURCE: NASA HRP</span>
      </div>
      <div className="hazards">
        {hazards.map((h) => (
          <div key={h.key} className="hazard" style={{ ['--c' as string]: STATUS_COLOR[state[h.key]] }}>
            <div className="row spread" style={{ gap: 6 }}>
              <span style={{ fontSize: 22 }} aria-hidden>{h.icon}</span>
              <StatusPill status={state[h.key]} />
            </div>
            <strong style={{ fontSize: 16 }}>{h.name}</strong>
            <span className="mono small" style={{ color: 'var(--orange)' }}>{h.stat}</span>
            <p className="small muted">{h.why}</p>
            {h.links.length > 0 && (
              <div className="row" style={{ gap: 4, marginTop: 'auto' }}>
                {h.links.map((id) => (
                  <button key={id} className="tag" style={{ cursor: 'pointer' }} onClick={() => onSelect(id)}>
                    {INDICATORS[id].name.replace(/ \(.*\)/, '')} →
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
