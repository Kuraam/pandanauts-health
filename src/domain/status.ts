import { INDICATORS, type IndicatorId, type Status } from './indicators';

const RANK: Record<Status, number> = { normal: 0, watch: 1, critical: 2 };

/** Classify one reading against its indicator's bands. */
export function classify(id: IndicatorId, value: number): Status {
  if (!Number.isFinite(value)) throw new Error(`Invalid value for ${id}: ${value}`);
  const band = INDICATORS[id].bands.find((b) => value >= b.min && value < b.max);
  // Bands cover -inf..+inf, so a match always exists.
  return band!.status;
}

/** The most severe of several statuses. */
export function worst(statuses: Status[]): Status {
  return statuses.reduce<Status>((acc, s) => (RANK[s] > RANK[acc] ? s : acc), 'normal');
}

export const STATUS_LABEL: Record<Status, string> = {
  normal: 'Normal',
  watch: 'Watch',
  critical: 'Critical',
};
