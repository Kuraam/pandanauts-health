import { describe, expect, it } from 'vitest';
import { MISSIONS } from './missions';
import {
  boneLossPercent,
  boneStatus,
  cumulativeDose,
  muscleRisk,
  radiationStatus,
} from './models';

describe('radiation', () => {
  it('accumulates at the mission rate', () => {
    expect(cumulativeDose(MISSIONS.marsTransit, 100)).toBeCloseTo(184);
    expect(cumulativeDose(MISSIONS.iss, 10, 20)).toBeCloseTo(25);
  });
  it('flags against the 600 mSv career limit', () => {
    expect(radiationStatus(100)).toBe('normal');
    expect(radiationStatus(300)).toBe('watch');
    expect(radiationStatus(480)).toBe('critical');
  });
});

describe('bone loss', () => {
  it('is about 1.5%/month in microgravity without exercise', () => {
    expect(boneLossPercent(MISSIONS.iss, 30.4, 0)).toBeCloseTo(1.5);
  });
  it('is reduced by exercise and by gravity', () => {
    const none = boneLossPercent(MISSIONS.iss, 180, 0);
    const full = boneLossPercent(MISSIONS.iss, 180, 90);
    expect(full).toBeCloseTo(none * 0.3);
    expect(boneLossPercent(MISSIONS.marsSurface, 180, 0)).toBeLessThan(none);
  });
  it('maps to status', () => {
    expect(boneStatus(2)).toBe('normal');
    expect(boneStatus(6)).toBe('watch');
    expect(boneStatus(12)).toBe('critical');
  });
});

describe('muscle risk', () => {
  it('stays between 0 and 100 and drops with exercise', () => {
    expect(muscleRisk(MISSIONS.iss, 1000, 0)).toBe(100);
    expect(muscleRisk(MISSIONS.iss, 180, 90)).toBeLessThan(muscleRisk(MISSIONS.iss, 180, 0));
    expect(muscleRisk(MISSIONS.iss, 0, 0)).toBe(0);
  });
});
