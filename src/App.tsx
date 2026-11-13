import { useMemo, useState } from 'react';
import { BodyMap } from './components/BodyMap';
import { CheckInForm } from './components/CheckInForm';
import { IndicatorDetail } from './components/IndicatorDetail';
import { IndicatorTiles } from './components/IndicatorTiles';
import { MissionBar } from './components/MissionBar';
import { SpaceRisks } from './components/SpaceRisks';
import { StatusHero } from './components/StatusHero';
import { evaluate } from './domain/guidance';
import { INDICATOR_LIST, INDICATORS, type BodyRegion, type IndicatorId, type Status } from './domain/indicators';
import { MISSIONS, type MissionId } from './domain/missions';
import { boneLossPercent, boneStatus, cumulativeDose, muscleRisk, muscleStatus, radiationStatus } from './domain/models';
import { simulateHistory, type CheckIn } from './domain/simulate';
import { classify, worst } from './domain/status';
import { usePersistent } from './store';

const DEFAULT_DAY = 120;

export default function App() {
  const [missionId, setMissionId] = usePersistent<MissionId>('ph.mission', () => 'iss');
  const [missionDay, setMissionDay] = usePersistent<number>('ph.day', () => DEFAULT_DAY);
  const [history, setHistory] = usePersistent<CheckIn[]>('ph.history', () => simulateHistory(DEFAULT_DAY));
  const [selected, setSelected] = useState<IndicatorId | null>('sleep');
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const mission = MISSIONS[missionId];
  const recent = useMemo(() => history.filter((c) => c.day <= missionDay).slice(-30), [history, missionDay]);
  const today = recent.at(-1);
  const guidance = useMemo(() => evaluate(recent, mission), [recent, mission]);
  const avgExercise = useMemo(() => {
    const last7 = recent.slice(-7);
    return last7.length ? last7.reduce((s, c) => s + c.exerciseMin, 0) / last7.length : 0;
  }, [recent]);

  const statusByRegion = useMemo(() => {
    const by: Record<BodyRegion, Status[]> = { head: [], heart: [], lungs: [], blood: [], musculoskeletal: [], wholeBody: [] };
    for (const ind of INDICATOR_LIST) {
      const v = today?.readings[ind.id];
      if (v !== undefined) by[ind.region].push(classify(ind.id, v));
    }
    by.wholeBody.push(radiationStatus(cumulativeDose(mission, missionDay)));
    by.musculoskeletal.push(
      boneStatus(boneLossPercent(mission, missionDay, avgExercise)),
      muscleStatus(muscleRisk(mission, missionDay, avgExercise)),
    );
    return Object.fromEntries(Object.entries(by).map(([k, v]) => [k, worst(v)])) as Record<BodyRegion, Status>;
  }, [today, mission, missionDay, avgExercise]);

  const selectRegion = (r: BodyRegion) => {
    setRegion(r);
    const first = INDICATOR_LIST.find((i) => i.region === r);
    if (first) setSelected(first.id);
  };

  const saveCheckIn = (c: CheckIn) => {
    setHistory((h) => [...h.filter((x) => x.day !== c.day), c].sort((a, b) => a.day - b.day));
    setCheckingIn(false);
  };

  const resetDemo = () => {
    setHistory(simulateHistory(DEFAULT_DAY));
    setMissionDay(DEFAULT_DAY);
    setMissionId('iss');
  };

  return (
    <div className="app">
      <MissionBar mission={mission} missionDay={missionDay} onMission={setMissionId} onDay={setMissionDay} />

      <div className="row spread">
        <p className="muted small">
          Good day, astronaut. {today ? `Last check-in: mission day ${today.day}.` : 'No check-ins yet.'}
        </p>
        <div className="row">
          <button className="btn small" onClick={resetDemo} title="Restore the simulated 30-day demo history">↺ Reset demo data</button>
          <button className="btn btn-primary" onClick={() => setCheckingIn(true)}>＋ Daily check-in</button>
        </div>
      </div>

      {checkingIn && (
        <CheckInForm day={missionDay} previous={today} onSave={saveCheckIn} onCancel={() => setCheckingIn(false)} />
      )}

      <div className="grid-main">
        <div className="stack" style={{ gap: 16, alignContent: 'start' }}>
          <BodyMap statusByRegion={statusByRegion} selected={region} onSelect={selectRegion} />
          <SpaceRisks mission={mission} missionDay={missionDay} avgExerciseMin={avgExercise} />
        </div>
        <div className="stack" style={{ gap: 16, alignContent: 'start' }}>
          <StatusHero guidance={guidance} onSelect={setSelected} />
          {today && (
            <IndicatorTiles readings={today.readings} selected={selected} onSelect={setSelected} source={today.source} />
          )}
          {selected && INDICATORS[selected] && <IndicatorDetail id={selected} history={recent} />}
        </div>
      </div>

      <p className="disclaimer">
        Decision aid for training and demonstration. Not a medical device. Thresholds are general adult ranges;
        real missions use limits set by flight surgeons for each astronaut. Team Pandanauts · NASA Space Apps Challenge 2026.
      </p>
    </div>
  );
}
