import { SCENARIO_LIST, type ScenarioId } from '../domain/scenarios';

interface Props {
  active: ScenarioId | null;
  onSelect: (id: ScenarioId) => void;
  onAbout: () => void;
}

const ICON: Record<ScenarioId, string> = { fatigue: '😴', hypoxia: '🫁', solarStorm: '☀️', nominal: '✅' };

/** Demo scenario switcher: lets judges see the app react to different situations. */
export function ScenarioBar({ active, onSelect, onAbout }: Props) {
  const current = SCENARIO_LIST.find((s) => s.id === active);
  return (
    <section className="scenario-bar" aria-label="Simulation scenarios">
      <div className="row spread" style={{ gap: 8 }}>
        <span className="mono small muted" style={{ letterSpacing: '0.12em' }}>🧪 SIMULATION SCENARIO</span>
        <button className="btn small" onClick={onAbout}>ⓘ About &amp; data sources</button>
      </div>
      <div className="scenario-chips" role="tablist">
        {SCENARIO_LIST.map((s) => (
          <button key={s.id} role="tab" aria-selected={active === s.id} className="scenario-chip" onClick={() => onSelect(s.id)}>
            <span aria-hidden>{ICON[s.id]}</span> {s.name}
          </button>
        ))}
      </div>
      <p className="small muted">{current ? current.tagline : 'Custom data: your own check-ins.'}</p>
    </section>
  );
}
