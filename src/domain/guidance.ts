/**
 * Onboard rules engine: the single source of truth for status and actions.
 * It works fully offline and is deterministic. An optional LLM may only
 * rephrase this output; it never decides anything.
 */
import { INDICATORS, type IndicatorId, type Status } from './indicators';
import { classify, worst } from './status';
import type { CheckIn } from './simulate';
import type { Mission } from './missions';
import { formatDelay } from './missions';

export interface Alert {
  id: string;
  status: Exclude<Status, 'normal'>;
  title: string;
  detail: string;
  actions: string[];
  indicator?: IndicatorId;
}

export interface Guidance {
  overall: Status;
  headline: string;
  summary: string;
  alerts: Alert[];
  escalate: boolean;
  escalateNote: string;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

export function evaluate(history: CheckIn[], mission: Mission): Guidance {
  const alerts: Alert[] = [];
  const today = history.at(-1);

  if (today) {
    for (const [id, value] of Object.entries(today.readings) as [IndicatorId, number][]) {
      if (value === undefined || !Number.isFinite(value)) continue;
      const status = classify(id, value);
      if (status === 'normal') continue;
      const ind = INDICATORS[id];
      alerts.push({
        id: `reading-${id}`,
        status,
        indicator: id,
        title: `${ind.name}: ${value} ${ind.unit}`,
        detail: `Outside the normal range (${ind.normalLabel} ${ind.unit}). ${ind.explain.whySpace}`,
        actions: ind.actions[status],
      });
    }
  }

  // Trend rules: patterns across several days matter more than one reading.
  const last3 = history.slice(-3);
  if (last3.length === 3 && last3.every((c) => (c.readings.sleep ?? 99) < 6)) {
    alerts.push({
      id: 'trend-sleep-debt',
      status: 'watch',
      indicator: 'sleep',
      title: 'Sleep debt building',
      detail: 'You slept less than 6 h on each of the last 3 nights. Sleep debt adds up and slows reaction time.',
      actions: ['Protect 8 h in tonight\'s schedule.', 'Ask the commander to move complex tasks to tomorrow afternoon.'],
    });
  }
  if (last3.length === 3 && last3.every((c) => (c.readings.mood ?? 5) <= 2)) {
    alerts.push({
      id: 'trend-mood',
      status: 'watch',
      indicator: 'mood',
      title: 'Low mood for 3 days',
      detail: 'Several low days in a row can be an early sign of isolation stress.',
      actions: ['Talk to a crewmate today.', 'Schedule a private conference with the ground psychologist.'],
    });
  }
  const last7 = history.slice(-7);
  const avgExercise = avg(last7.map((c) => c.exerciseMin));
  if (mission.gravity < 0.5 && last7.length >= 3 && avgExercise < 75) {
    alerts.push({
      id: 'trend-exercise',
      status: 'watch',
      title: `Exercise down to ${Math.round(avgExercise)} min/day`,
      detail: 'Without about 90 minutes of daily exercise, bones and muscles weaken faster in low gravity.',
      actions: ['Add a resistive exercise session (squats, deadlifts) today.', 'Target 90 min/day this week.'],
    });
  }

  const overall = worst(alerts.map((a) => a.status));
  const criticalCount = alerts.filter((a) => a.status === 'critical').length;
  const watchCount = alerts.length - criticalCount;
  const delay = formatDelay(mission.commsDelaySec);

  const headline =
    overall === 'normal'
      ? 'All indicators normal'
      : overall === 'watch'
        ? `${watchCount} item${watchCount === 1 ? '' : 's'} to watch`
        : `${criticalCount} critical item${criticalCount === 1 ? '' : 's'}: act now`;

  const summary =
    overall === 'normal'
      ? 'Your readings are within normal ranges. Keep up your exercise and sleep routine.'
      : `Focus first on: ${alerts
          .slice()
          .sort((a, b) => (a.status === b.status ? 0 : a.status === 'critical' ? -1 : 1))
          .slice(0, 3)
          .map((a) => a.title.split(':')[0].toLowerCase())
          .join(', ')}. Follow the steps below.`;

  const escalate = overall === 'critical';
  const escalateNote =
    mission.commsDelaySec >= 60
      ? `Earth is ${delay} away each way. Start the onboard steps now; don't wait for a reply.`
      : `Flight surgeons can be reached in near-real time (${delay}).`;

  return { overall, headline, summary, alerts, escalate, escalateNote };
}
