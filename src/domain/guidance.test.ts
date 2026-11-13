import { describe, expect, it } from 'vitest';
import { evaluate } from './guidance';
import { MISSIONS } from './missions';
import type { CheckIn } from './simulate';
import { simulateHistory } from './simulate';

const healthy = (day: number): CheckIn => ({
  day,
  source: 'manual',
  exerciseMin: 90,
  readings: { heartRate: 65, systolic: 118, diastolic: 75, spo2: 98, temperature: 36.9, glucose: 88, sleep: 7.5, mood: 4, respiration: 14 },
});

describe('evaluate', () => {
  it('reports normal for healthy readings', () => {
    const g = evaluate([healthy(1), healthy(2), healthy(3)], MISSIONS.iss);
    expect(g.overall).toBe('normal');
    expect(g.alerts).toHaveLength(0);
    expect(g.escalate).toBe(false);
  });

  it('flags a critical SpO2 and escalates', () => {
    const today = healthy(3);
    today.readings.spo2 = 88;
    const g = evaluate([healthy(1), healthy(2), today], MISSIONS.marsTransit);
    expect(g.overall).toBe('critical');
    expect(g.escalate).toBe(true);
    expect(g.escalateNote).toMatch(/12 min/);
  });

  it('detects 3-night sleep debt', () => {
    const h = [1, 2, 3].map((d) => ({ ...healthy(d), readings: { ...healthy(d).readings, sleep: 5.5 } }));
    const g = evaluate(h, MISSIONS.iss);
    expect(g.alerts.map((a) => a.id)).toContain('trend-sleep-debt');
  });

  it('flags low exercise only in low gravity', () => {
    const h = [1, 2, 3].map((d) => ({ ...healthy(d), exerciseMin: 30 }));
    expect(evaluate(h, MISSIONS.iss).alerts.some((a) => a.id === 'trend-exercise')).toBe(true);
    expect(evaluate(h, { ...MISSIONS.iss, gravity: 1 }).alerts.some((a) => a.id === 'trend-exercise')).toBe(false);
  });

  it('simulated demo history produces something to watch', () => {
    const g = evaluate(simulateHistory(120), MISSIONS.iss);
    expect(g.overall).not.toBe('normal');
  });
});
