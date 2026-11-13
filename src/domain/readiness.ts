/**
 * Mission Readiness: one 0–100 number summarising today's state.
 * It is a transparent points system, not a medical score:
 * start at 100 and subtract a fixed penalty for every flag.
 */
import type { Status } from './indicators';
import type { Alert } from './guidance';
import type { CheckIn } from './simulate';

export const PENALTY = {
  reading: { watch: 6, critical: 18 },
  trend: { watch: 5, critical: 15 },
  longTerm: { watch: 4, critical: 12 },
} as const;

export interface Readiness {
  score: number;
  status: Status;
  label: string;
}

export function readiness(alerts: Alert[], longTerm: Status[]): Readiness {
  let score = 100;
  for (const a of alerts) {
    const kind = a.id.startsWith('reading-') ? 'reading' : 'trend';
    score -= PENALTY[kind][a.status];
  }
  for (const s of longTerm) if (s !== 'normal') score -= PENALTY.longTerm[s];
  score = Math.max(0, Math.min(100, score));
  // Safety override: any critical finding means duties must be limited,
  // whatever the points total says.
  const anyCritical = alerts.some((a) => a.status === 'critical') || longTerm.includes('critical');
  if (anyCritical) score = Math.min(score, 59);
  if (score >= 80) return { score, status: 'normal', label: 'Mission ready' };
  if (score >= 60) return { score, status: 'watch', label: 'Ready with cautions' };
  return { score, status: 'critical', label: 'Limit duties, follow actions' };
}

/** Consecutive mission days with a check-in, counting back from `today`. */
export function streak(history: CheckIn[], today: number): number {
  const days = new Set(history.map((c) => c.day));
  let n = 0;
  while (days.has(today - n)) n++;
  return n;
}
