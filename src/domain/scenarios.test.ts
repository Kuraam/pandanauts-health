import { describe, expect, it } from 'vitest';
import { evaluate } from './guidance';
import { MISSIONS } from './missions';
import { cumulativeDose, radiationStatus } from './models';
import { SCENARIOS } from './scenarios';

const run = (id: keyof typeof SCENARIOS) => {
  const s = SCENARIOS[id];
  return evaluate(s.build(), MISSIONS[s.missionId], { solarEvent: s.solarEvent });
};

describe('demo scenarios tell the intended story', () => {
  it('fatigue: items to watch, nothing critical', () => {
    expect(run('fatigue').overall).toBe('watch');
  });
  it('hypoxia: critical oxygen with a long comms delay', () => {
    const g = run('hypoxia');
    expect(g.overall).toBe('critical');
    expect(g.alerts.some((a) => a.id === 'reading-spo2' && a.status === 'critical')).toBe(true);
    expect(g.escalateNote).toMatch(/12 min/);
  });
  it('solar storm: critical shelter alert and high cumulative dose', () => {
    expect(run('solarStorm').overall).toBe('critical');
    const s = SCENARIOS.solarStorm;
    const dose = cumulativeDose(MISSIONS.moon, s.missionDay, s.eventDoseMsv);
    expect(radiationStatus(dose)).toBe('critical');
  });
  it('nominal: everything normal', () => {
    const g = run('nominal');
    expect(g.overall).toBe('normal');
    expect(g.alerts).toHaveLength(0);
  });
});
