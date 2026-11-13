import { describe, expect, it } from 'vitest';
import type { Alert } from './guidance';
import { readiness, streak } from './readiness';
import type { CheckIn } from './simulate';

const alert = (id: string, status: 'watch' | 'critical'): Alert => ({ id, status, title: '', detail: '', actions: [] });

describe('readiness', () => {
  it('is 100 and ready with no flags', () => {
    expect(readiness([], [])).toEqual({ score: 100, status: 'normal', label: 'Mission ready' });
  });
  it('subtracts reading, trend and long-term penalties', () => {
    const r = readiness([alert('reading-sleep', 'watch'), alert('trend-mood', 'watch')], ['watch', 'normal']);
    expect(r.score).toBe(100 - 6 - 5 - 4);
  });
  it('maps score bands to status', () => {
    expect(readiness([alert('reading-a', 'watch')], []).status).toBe('normal'); // 94
    expect(readiness(Array.from({ length: 4 }, (_, i) => alert(`reading-${i}`, 'watch')), []).status).toBe('watch'); // 76
  });
  it('any critical finding forces "limit duties" regardless of points', () => {
    const r = readiness([alert('reading-spo2', 'critical')], []); // points alone would be 82
    expect(r.status).toBe('critical');
    expect(r.score).toBeLessThanOrEqual(59);
    expect(readiness([], ['critical']).status).toBe('critical');
  });
  it('never goes below 0', () => {
    expect(readiness(Array.from({ length: 10 }, (_, i) => alert(`reading-${i}`, 'critical')), []).score).toBe(0);
  });
});

describe('streak', () => {
  const c = (day: number): CheckIn => ({ day, readings: {}, exerciseMin: 0, source: 'manual' });
  it('counts consecutive days back from today', () => {
    expect(streak([c(1), c(3), c(4), c(5)], 5)).toBe(3);
    expect(streak([c(1), c(2)], 5)).toBe(0);
  });
});
