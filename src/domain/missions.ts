/**
 * Mission environments. Radiation rates are real measured values from
 * published instrument data (labelled "real" in the UI).
 */
export type MissionId = 'iss' | 'moon' | 'marsTransit' | 'marsSurface';

export interface Mission {
  id: MissionId;
  name: string;
  short: string;
  /** Gravity as a fraction of Earth's (1 = Earth). */
  gravity: number;
  /** Measured dose-equivalent rate, mSv/day. */
  radiationPerDay: number;
  radiationSource: string;
  /** One-way signal delay to Earth, seconds (typical value). */
  commsDelaySec: number;
  commsNote: string;
}

export const MISSIONS: Record<MissionId, Mission> = {
  iss: {
    id: 'iss',
    name: 'International Space Station',
    short: 'ISS',
    gravity: 0,
    radiationPerDay: 0.5,
    radiationSource: 'ISS dosimetry, about 0.3–0.8 mSv/day depending on solar cycle and shielding (NASA)',
    commsDelaySec: 0.5,
    commsNote: 'Near-real-time link through relay satellites',
  },
  moon: {
    id: 'moon',
    name: 'Lunar surface base',
    short: 'Moon',
    gravity: 0.166,
    radiationPerDay: 1.37,
    radiationSource: 'Chang\'e-4 LND, 1.37 mSv/day on the lunar surface (Zhang et al. 2020, Science Advances)',
    commsDelaySec: 1.3,
    commsNote: '1.3 s each way',
  },
  marsTransit: {
    id: 'marsTransit',
    name: 'Mars transit (deep space)',
    short: 'Mars transit',
    gravity: 0,
    radiationPerDay: 1.84,
    radiationSource: 'MSL/RAD cruise, 1.84 mSv/day (Zeitlin et al. 2013, Science)',
    commsDelaySec: 12 * 60,
    commsNote: 'Up to about 20 minutes each way. You must act without waiting for Earth.',
  },
  marsSurface: {
    id: 'marsSurface',
    name: 'Mars surface base',
    short: 'Mars',
    gravity: 0.38,
    radiationPerDay: 0.64,
    radiationSource: 'Curiosity RAD, 0.64 mSv/day at Gale Crater (Hassler et al. 2014, Science)',
    commsDelaySec: 12 * 60,
    commsNote: '3–22 minutes each way, plus blackouts during solar conjunction',
  },
};

export const MISSION_LIST = Object.values(MISSIONS);

export function formatDelay(sec: number): string {
  if (sec < 60) return `${sec} s`;
  return `${Math.round(sec / 60)} min`;
}
