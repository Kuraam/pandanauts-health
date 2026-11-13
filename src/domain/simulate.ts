/**
 * Simulated sensor and check-in history (labelled "Simulated" in the UI).
 * Seeded, so the demo looks the same every time. The story arc: a healthy
 * month, then sleep slips in the last week, mood dips, and today's
 * temperature reads high. That gives the app something worth flagging.
 */
import type { IndicatorId } from './indicators';

export type Readings = Partial<Record<IndicatorId, number>>;

export interface CheckIn {
  /** Mission day number (1 = launch day). */
  day: number;
  readings: Readings;
  exerciseMin: number;
  note?: string;
  source: 'simulated' | 'manual';
}

/** Mulberry32: a tiny deterministic PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number, dp = 0) => Number(v.toFixed(dp));

/** Generate `days` check-ins ending on `todayDay`. */
export function simulateHistory(todayDay: number, days = 30, seed = 42): CheckIn[] {
  const r = rng(seed);
  const jitter = (spread: number) => (r() - 0.5) * 2 * spread;
  const out: CheckIn[] = [];
  const start = Math.max(1, todayDay - days + 1);
  for (let day = start; day <= todayDay; day++) {
    const fromEnd = todayDay - day; // 0 = today
    const lateWeek = fromEnd < 7;
    const sleep = lateWeek ? 5.6 + jitter(0.6) + fromEnd * 0.1 : 6.9 + jitter(0.7);
    const mood = lateWeek ? (fromEnd < 3 ? 2 : 3) : r() < 0.8 ? 4 : 3;
    const temp = fromEnd === 0 ? 37.8 : 36.9 + jitter(0.25); // space runs ~1 °C warm
    out.push({
      day,
      source: 'simulated',
      exerciseMin: round(lateWeek ? 55 + jitter(15) : 85 + jitter(15)),
      readings: {
        heartRate: round(64 + jitter(6) + (lateWeek ? 6 : 0)),
        systolic: round(118 + jitter(7)),
        diastolic: round(76 + jitter(5)),
        spo2: round(97.5 + jitter(1.2)),
        temperature: round(temp, 1),
        glucose: round(88 + jitter(9) + (lateWeek ? 8 : 0)),
        sleep: round(sleep, 1),
        mood,
        respiration: round(15 + jitter(2.5)),
      },
    });
  }
  return out;
}
