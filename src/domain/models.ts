/**
 * Simple, explainable models for the slow spaceflight risks:
 * radiation, bone loss and muscle loss.
 *
 * Published rates are real. How they combine with gravity and exercise is an
 * illustrative model built for this app, and the UI labels it that way.
 */
import type { Status } from './indicators';
import type { Mission } from './missions';

/** NASA career effective-dose limit, mSv (NASA-STD-3001 Vol. 1, Rev. B, 2022). */
export const CAREER_LIMIT_MSV = 600;

export function cumulativeDose(mission: Mission, missionDay: number, priorDoseMsv = 0): number {
  return priorDoseMsv + mission.radiationPerDay * missionDay;
}

export function radiationStatus(doseMsv: number): Status {
  const frac = doseMsv / CAREER_LIMIT_MSV;
  if (frac >= 0.8) return 'critical';
  if (frac >= 0.5) return 'watch';
  return 'normal';
}

/**
 * Bone loss in weight-bearing bones (hip/spine). Microgravity: about 1–1.5% per month
 * (LeBlanc et al. 2000; NASA HRP Bone Fracture Evidence Report). We use 1.5%.
 * Partial gravity is assumed to scale loss linearly (an assumption: no human data yet).
 * Resistive exercise (ARED) reduces loss. Full protection is assumed at 90 min/day,
 * with up to 70% reduction (Smith et al. 2012, JBMR showed ARED preserved BMD).
 */
export const BONE_LOSS_PER_MONTH_MICRO_G = 1.5;
export const EXERCISE_TARGET_MIN = 90;

export function exerciseProtection(avgExerciseMin: number): number {
  return 0.7 * Math.min(Math.max(avgExerciseMin, 0) / EXERCISE_TARGET_MIN, 1);
}

export function boneLossPercent(mission: Mission, missionDay: number, avgExerciseMin: number): number {
  const gravityFactor = Math.max(0, 1 - mission.gravity);
  const months = missionDay / 30.4;
  return BONE_LOSS_PER_MONTH_MICRO_G * gravityFactor * months * (1 - exerciseProtection(avgExerciseMin));
}

export function boneStatus(lossPercent: number): Status {
  if (lossPercent >= 10) return 'critical';
  if (lossPercent >= 5) return 'watch';
  return 'normal';
}

/**
 * Muscle atrophy risk score from 0 to 100. Calf and thigh muscles can lose 10–20% volume in
 * 6 months without countermeasures (NASA HRP Muscle Evidence Report).
 * The score grows with time in low gravity and shrinks with exercise.
 */
export function muscleRisk(mission: Mission, missionDay: number, avgExerciseMin: number): number {
  const gravityFactor = Math.max(0, 1 - mission.gravity);
  const exposure = Math.min(missionDay / 180, 1.5); // 6 months is the reference duration
  const raw = 100 * gravityFactor * exposure * (1 - exerciseProtection(avgExerciseMin));
  return Math.round(Math.min(raw, 100));
}

export function muscleStatus(score: number): Status {
  if (score >= 60) return 'critical';
  if (score >= 30) return 'watch';
  return 'normal';
}
