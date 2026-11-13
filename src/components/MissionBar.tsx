import { useEffect, useState } from 'react';
import { MISSION_LIST, formatDelay, type Mission, type MissionId } from '../domain/missions';

interface Props {
  mission: Mission;
  missionDay: number;
  onMission: (id: MissionId) => void;
  onDay: (day: number) => void;
}

/** Mission Elapsed Time: mission day plus today's clock time, ticking every second. */
function useMet(missionDay: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(missionDay).padStart(3, '0')}d ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function MissionBar({ mission, missionDay, onMission, onDay }: Props) {
  const met = useMet(missionDay);
  return (
    <header className="card row spread" style={{ padding: '12px 18px' }}>
      <div className="row" style={{ gap: 12 }}>
        <img src="/logo-mark.png" alt="Team Pandanauts logo" width={48} height={48}
          style={{ borderRadius: 12, boxShadow: '0 0 0 1px rgba(255,122,26,.4), 0 0 24px rgba(255,122,26,.25)' }} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.01em' }}>
            PANDANAUTS <span style={{ color: 'var(--orange)' }}>HEALTH</span>
          </h1>
          <p className="row small muted" style={{ gap: 8 }}>
            <span className="live-dot" aria-hidden /> <span className="mono">ONBOARD · OFFLINE-READY</span>
          </p>
        </div>
      </div>

      <div className="row small" style={{ gap: 8 }}>
        <div className="tag" style={{ fontSize: 13, padding: '6px 10px' }} aria-label="Mission elapsed time">
          <span className="muted">MET </span>
          <span style={{ color: 'var(--orange)' }}>{met}</span>
        </div>
        <select className="btn" aria-label="Mission" value={mission.id} onChange={(e) => onMission(e.target.value as MissionId)}>
          {MISSION_LIST.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <label className="row mono" style={{ gap: 6 }}>
          <span className="muted">DAY</span>
          <input className="btn mono" type="number" min={1} max={1000} value={missionDay}
            onChange={(e) => onDay(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
            style={{ width: 78 }} />
        </label>
        <span className="tag" title={mission.commsNote}>📡 EARTH {formatDelay(mission.commsDelaySec)}</span>
        <span className="tag">⦿ {mission.gravity === 0 ? '0 g' : `${mission.gravity} g`}</span>
      </div>
    </header>
  );
}
