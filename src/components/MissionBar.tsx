import { MISSION_LIST, formatDelay, type Mission, type MissionId } from '../domain/missions';

interface Props {
  mission: Mission;
  missionDay: number;
  onMission: (id: MissionId) => void;
  onDay: (day: number) => void;
}

export function MissionBar({ mission, missionDay, onMission, onDay }: Props) {
  return (
    <header className="card row spread" style={{ padding: '12px 16px' }}>
      <div className="row">
        <img src="/favicon.svg" alt="" width={40} height={40} />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>
            Pandanauts <span style={{ color: 'var(--orange)' }}>Health</span>
          </h1>
          <p className="small muted">Onboard health self-check · works offline</p>
        </div>
      </div>
      <div className="row small">
        <label className="row" style={{ gap: 6 }}>
          <span className="muted">Mission</span>
          <select
            className="btn"
            value={mission.id}
            onChange={(e) => onMission(e.target.value as MissionId)}
          >
            {MISSION_LIST.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="row" style={{ gap: 6 }}>
          <span className="muted">Day</span>
          <input
            className="btn"
            type="number"
            min={1}
            max={1000}
            value={missionDay}
            onChange={(e) => onDay(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
            style={{ width: 80 }}
          />
        </label>
        <span className="tag" title={mission.commsNote}>
          📡 Earth delay {formatDelay(mission.commsDelaySec)}
        </span>
        <span className="tag">{mission.gravity === 0 ? '0 g' : `${mission.gravity} g`}</span>
      </div>
    </header>
  );
}
