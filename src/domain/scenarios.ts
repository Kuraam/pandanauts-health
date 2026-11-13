/**
 * Demo scenarios: preset situations that show how the app behaves across
 * environments and severities. All readings are SIMULATED (labelled in the UI).
 */
import type { MissionId } from './missions';
import { simulateHistory, type CheckIn } from './simulate';

export type ScenarioId = 'fatigue' | 'hypoxia' | 'solarStorm' | 'nominal';

export interface Scenario {
  id: ScenarioId;
  name: string;
  tagline: string;
  missionId: MissionId;
  missionDay: number;
  /** Extra dose from a solar particle event, mSv (adds to the cumulative dose). */
  eventDoseMsv: number;
  /** A solar particle event is in progress right now. */
  solarEvent: boolean;
  build: () => CheckIn[];
}

const patchLast = (h: CheckIn[], fromEnd: number, patch: Partial<CheckIn['readings']>, exercise?: number) => {
  const c = h[h.length - 1 - fromEnd];
  if (!c) return;
  c.readings = { ...c.readings, ...patch };
  if (exercise !== undefined) c.exerciseMin = exercise;
};

/** A calm, healthy month: every reading in range, exercise on target. */
function healthy(day: number, seed: number): CheckIn[] {
  const h = simulateHistory(day, 30, seed);
  h.forEach((c, i) => {
    const wobble = Math.sin(i * 1.7) * 0.3;
    c.exerciseMin = 92 + Math.round(wobble * 10);
    c.readings = {
      ...c.readings,
      sleep: Number((7.4 + wobble).toFixed(1)),
      mood: i % 4 === 0 ? 5 : 4,
      temperature: Number((36.9 + wobble / 3).toFixed(1)),
      glucose: Math.round(86 + wobble * 8),
      heartRate: Math.round(62 + wobble * 6),
    };
  });
  return h;
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  fatigue: {
    id: 'fatigue',
    name: 'ISS · Fatigue building',
    tagline: 'Day 120 on the ISS. A week of short sleep, low mood and slipping exercise.',
    missionId: 'iss',
    missionDay: 120,
    eventDoseMsv: 0,
    solarEvent: false,
    build: () => simulateHistory(120),
  },
  hypoxia: {
    id: 'hypoxia',
    name: 'Mars transit · Low oxygen',
    tagline: 'Day 143, 12 light-minutes from Earth. A CO₂ scrubber fault: oxygen falling, breathing fast.',
    missionId: 'marsTransit',
    missionDay: 143,
    eventDoseMsv: 0,
    solarEvent: false,
    build: () => {
      const h = healthy(143, 7);
      patchLast(h, 1, { spo2: 94, respiration: 21, heartRate: 92 });
      patchLast(h, 0, { spo2: 88, respiration: 27, heartRate: 118, systolic: 134, temperature: 37.1 });
      return h;
    },
  },
  solarStorm: {
    id: 'solarStorm',
    name: 'Lunar base · Solar storm',
    tagline: 'Day 210 on the Moon. A solar particle event is under way; dose jumping fast.',
    missionId: 'moon',
    missionDay: 210,
    eventDoseMsv: 200,
    solarEvent: true,
    build: () => {
      const h = healthy(210, 11);
      patchLast(h, 0, { heartRate: 96, sleep: 6.2, mood: 3 });
      return h;
    },
  },
  nominal: {
    id: 'nominal',
    name: 'Mars surface · All nominal',
    tagline: 'Day 60 at a Mars base. Healthy routine; every indicator in range.',
    missionId: 'marsSurface',
    missionDay: 60,
    eventDoseMsv: 0,
    solarEvent: false,
    build: () => healthy(60, 3),
  },
};

export const SCENARIO_LIST = Object.values(SCENARIOS);
