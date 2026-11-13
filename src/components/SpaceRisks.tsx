import type { Mission } from '../domain/missions';
import {
  CAREER_LIMIT_MSV,
  boneLossPercent,
  boneStatus,
  cumulativeDose,
  muscleRisk,
  muscleStatus,
  radiationStatus,
} from '../domain/models';
import { StatusPill } from './StatusPill';

interface Props {
  mission: Mission;
  missionDay: number;
  avgExerciseMin: number;
  eventDoseMsv?: number;
  solarEvent?: boolean;
}

function Meter({ frac, color }: { frac: number; color: string }) {
  return (
    <div style={{ height: 8, background: 'var(--navy)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(frac, 1) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
  );
}

export function SpaceRisks({ mission, missionDay, avgExerciseMin, eventDoseMsv = 0, solarEvent = false }: Props) {
  const dose = cumulativeDose(mission, missionDay, eventDoseMsv);
  const bone = boneLossPercent(mission, missionDay, avgExerciseMin);
  const muscle = muscleRisk(mission, missionDay, avgExerciseMin);
  const rs = radiationStatus(dose);
  const bs = boneStatus(bone);
  const ms = muscleStatus(muscle);

  return (
    <section className="card stack">
      <div className="row spread">
        <h2 className="hud-title">Long-term exposure</h2>
        <span className="tag" title="Real published rates combined with a simple illustrative model">📡 PUBLISHED RATES + MODEL</span>
      </div>

      <div className="tile" data-status={rs}>
        <div className="row spread"><span className="name">☢ Radiation dose</span><StatusPill status={rs} /></div>
        <span className="value">{dose.toFixed(0)}<span className="unit">mSv of {CAREER_LIMIT_MSV} career limit</span></span>
        <Meter frac={dose / CAREER_LIMIT_MSV} color="var(--orange)" />
        {solarEvent && (
          <span className="tag" style={{ color: 'var(--crit)', borderColor: 'rgba(255,92,92,.5)', justifySelf: 'start' }}>
            ☀ SOLAR STORM +{eventDoseMsv} mSv (simulated)
          </span>
        )}
        <span className="range">{mission.radiationPerDay} mSv/day · {mission.radiationSource}</span>
      </div>

      <div className="tile" data-status={bs}>
        <div className="row spread"><span className="name">🦴 Est. bone density loss</span><StatusPill status={bs} /></div>
        <span className="value">{bone.toFixed(1)}<span className="unit">% (hip/spine)</span></span>
        <span className="range">
          About 1.5%/month in microgravity without exercise (NASA HRP). Your 7-day exercise average of {Math.round(avgExerciseMin)} min/day lowers it.
        </span>
      </div>

      <div className="tile" data-status={ms}>
        <div className="row spread"><span className="name">💪 Muscle atrophy risk</span><StatusPill status={ms} /></div>
        <span className="value">{muscle}<span className="unit">/ 100</span></span>
        <Meter frac={muscle / 100} color="var(--orange)" />
        <span className="range">Rises with time in low gravity and falls with daily resistive exercise (target 90 min).</span>
      </div>
    </section>
  );
}
