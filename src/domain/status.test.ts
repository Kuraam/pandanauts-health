import { describe, expect, it } from 'vitest';
import { classify, worst } from './status';
import { INDICATOR_LIST } from './indicators';

describe('classify: threshold boundaries', () => {
  const cases: [Parameters<typeof classify>[0], number, string][] = [
    ['heartRate', 39, 'critical'],
    ['heartRate', 40, 'watch'],
    ['heartRate', 50, 'normal'],
    ['heartRate', 100, 'normal'],
    ['heartRate', 101, 'watch'],
    ['heartRate', 130, 'watch'],
    ['heartRate', 131, 'critical'],
    ['systolic', 89, 'critical'],
    ['systolic', 90, 'normal'],
    ['systolic', 129, 'normal'],
    ['systolic', 130, 'watch'],
    ['systolic', 180, 'critical'],
    ['diastolic', 79, 'normal'],
    ['diastolic', 80, 'watch'],
    ['diastolic', 120, 'critical'],
    ['spo2', 89, 'critical'],
    ['spo2', 90, 'watch'],
    ['spo2', 94.9, 'watch'],
    ['spo2', 95, 'normal'],
    ['temperature', 34.9, 'critical'],
    ['temperature', 36.1, 'normal'],
    ['temperature', 37.5, 'normal'],
    ['temperature', 37.6, 'watch'],
    ['temperature', 38.5, 'critical'],
    ['glucose', 53, 'critical'],
    ['glucose', 54, 'watch'],
    ['glucose', 70, 'normal'],
    ['glucose', 99, 'normal'],
    ['glucose', 100, 'watch'],
    ['glucose', 250, 'watch'],
    ['glucose', 251, 'critical'],
    ['sleep', 4.9, 'critical'],
    ['sleep', 5, 'watch'],
    ['sleep', 7, 'normal'],
    ['mood', 1, 'critical'],
    ['mood', 2, 'watch'],
    ['mood', 3, 'normal'],
    ['respiration', 12, 'normal'],
    ['respiration', 21, 'watch'],
  ];
  it.each(cases)('%s = %d -> %s', (id, v, expected) => {
    expect(classify(id, v)).toBe(expected);
  });

  it('rejects non-finite values', () => {
    expect(() => classify('heartRate', NaN)).toThrow();
  });
});

describe('band tables are contiguous', () => {
  it.each(INDICATOR_LIST.map((i) => [i.id, i] as const))('%s', (_id, ind) => {
    expect(ind.bands[0].min).toBe(Number.NEGATIVE_INFINITY);
    expect(ind.bands.at(-1)!.max).toBe(Number.POSITIVE_INFINITY);
    for (let i = 1; i < ind.bands.length; i++) {
      expect(ind.bands[i].min).toBe(ind.bands[i - 1].max);
    }
  });
});

describe('worst', () => {
  it('picks the most severe', () => {
    expect(worst([])).toBe('normal');
    expect(worst(['normal', 'watch'])).toBe('watch');
    expect(worst(['watch', 'critical', 'normal'])).toBe('critical');
  });
});
