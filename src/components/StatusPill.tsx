import type { Status } from '../domain/indicators';
import { STATUS_LABEL } from '../domain/status';

const ICON: Record<Status, string> = { normal: '✓', watch: '!', critical: '▲' };

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={`pill pill-${status}`}>
      <span aria-hidden>{ICON[status]}</span>
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export const STATUS_COLOR: Record<Status, string> = {
  normal: 'var(--ok)',
  watch: 'var(--watch)',
  critical: 'var(--crit)',
};
