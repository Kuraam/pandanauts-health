import { useEffect, useRef } from 'react';
import { INDICATOR_LIST } from '../domain/indicators';
import { MISSION_LIST } from '../domain/missions';
import { CAREER_LIMIT_MSV } from '../domain/models';

/** "About & data sources": how the app works, every threshold and its source, real vs simulated. */
export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="about" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="stack" style={{ gap: 18 }}>
        <div className="row spread">
          <h2 className="hud-title">About Pandanauts Health</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p>
          An <strong>onboard health self-check for astronauts</strong> on long missions. The crew logs simple measurements;
          the app classifies each one, spots worrying trends, explains what is happening in plain language and tells the
          astronaut what to do, all <strong>without a connection to Earth</strong>. On a Mars mission, a message to a
          flight surgeon takes up to 20 minutes each way, so the crew must be able to act alone.
        </p>

        <div className="about-grid">
          <div className="hazard"><strong>1 · Measure</strong><p className="small muted">Daily check-in (manual entry) or wearable sensors. Routine reminders keep the habit.</p></div>
          <div className="hazard"><strong>2 · Assess</strong><p className="small muted">A deterministic rules engine compares readings with published thresholds and multi-day trends.</p></div>
          <div className="hazard"><strong>3 · Act</strong><p className="small muted">Plain-language steps, a readiness score, and escalation to flight surgeons with the real signal delay.</p></div>
        </div>

        <section className="stack" style={{ gap: 8 }}>
          <h3 className="mono small" style={{ letterSpacing: '.12em', color: 'var(--orange)' }}>THRESHOLDS · REAL CLINICAL REFERENCES</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Indicator</th><th>Normal</th><th>Source</th></tr></thead>
              <tbody>
                {INDICATOR_LIST.map((i) => (
                  <tr key={i.id}><td>{i.name}</td><td className="mono">{i.normalLabel} {i.unit}</td><td className="muted">{i.source}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack" style={{ gap: 8 }}>
          <h3 className="mono small" style={{ letterSpacing: '.12em', color: 'var(--orange)' }}>MISSION ENVIRONMENTS · REAL MEASURED DATA</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Environment</th><th>Radiation</th><th>Source</th></tr></thead>
              <tbody>
                {MISSION_LIST.map((m) => (
                  <tr key={m.id}><td>{m.name}</td><td className="mono">{m.radiationPerDay} mSv/day</td><td className="muted">{m.radiationSource}</td></tr>
                ))}
                <tr><td>Career limit</td><td className="mono">{CAREER_LIMIT_MSV} mSv</td><td className="muted">NASA-STD-3001 Vol. 1 Rev. B (2022)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack" style={{ gap: 6 }}>
          <h3 className="mono small" style={{ letterSpacing: '.12em', color: 'var(--orange)' }}>MODELS · ILLUSTRATIVE, BUILT FOR THIS APP</h3>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
            <li><strong>Bone loss</strong>: 1.5%/month in microgravity (LeBlanc et al. 2000; NASA HRP), reduced by up to 70% with 90 min/day resistive exercise (Smith et al. 2012). Partial gravity scaled linearly (assumption: no human data yet).</li>
            <li><strong>Muscle atrophy risk</strong>: 0–100 score from time in low gravity and exercise, calibrated to 10–20% muscle loss in 6 months without countermeasures (NASA HRP).</li>
            <li><strong>Mission Readiness</strong>: starts at 100; −6 per reading to watch, −18 per critical reading, −5/−15 per trend, −4/−12 per long-term risk.</li>
            <li><strong>Space fever</strong>: core temperature runs ≈1 °C higher on long missions (Stahn et al. 2017).</li>
          </ul>
        </section>

        <section className="stack" style={{ gap: 6 }}>
          <h3 className="mono small" style={{ letterSpacing: '.12em', color: 'var(--orange)' }}>DATA LABELS</h3>
          <p className="small"><span className="tag">📡 REAL</span> published measurements and references above. <span className="tag">🧪 SIMULATED</span> crew readings in the demo scenarios (no real astronaut data is public at this level). <span className="tag">✍ YOUR CHECK-IN</span> what you enter.</p>
        </section>

        <p className="small muted">
          Not a medical device. A decision aid built for the NASA Space Apps Challenge 2026 by Team Pandanauts.
          Real missions use limits set by flight surgeons for each astronaut.
        </p>
      </div>
    </dialog>
  );
}
