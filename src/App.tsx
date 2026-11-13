import { useEffect, useMemo, useState } from 'react';
import { AboutDialog } from './components/AboutDialog';
import { BodyMap } from './components/BodyMap';
import { CheckInForm } from './components/CheckInForm';
import { HazardsPanel, type HazardState } from './components/HazardsPanel';
import { IndicatorDetail } from './components/IndicatorDetail';
import { IndicatorTiles } from './components/IndicatorTiles';
import { MissionBar } from './components/MissionBar';
import { ReadinessPanel } from './components/ReadinessPanel';
import { ScenarioBar } from './components/ScenarioBar';
import { SpaceRisks } from './components/SpaceRisks';
import { StatusHero } from './components/StatusHero';
import { evaluate } from './domain/guidance';
import { INDICATOR_LIST, INDICATORS, type BodyRegion, type IndicatorId, type Status } from './domain/indicators';
import { MISSIONS, type MissionId } from './domain/missions';
import { boneLossPercent, boneStatus, cumulativeDose, muscleRisk, muscleStatus, radiationStatus } from './domain/models';
import { readiness, streak } from './domain/readiness';
import { SCENARIOS, type ScenarioId } from './domain/scenarios';
import type { CheckIn } from './domain/simulate';
import { classify, worst } from './domain/status';
import { usePersistent } from './store';

const START: ScenarioId = 'fatigue';
const FOCUS: Record<ScenarioId, IndicatorId> = { fatigue: 'sleep', hypoxia: 'spo2', solarStorm: 'heartRate', nominal: 'heartRate' };

export default function App() {
  const s0 = SCENARIOS[START];
  const [scenarioId, setScenarioId] = usePersistent<ScenarioId | null>('ph.scenario', () => START);
  const [missionId, setMissionId] = usePersistent<MissionId>('ph.mission', () => s0.missionId);
  const [missionDay, setMissionDay] = usePersistent<number>('ph.day', () => s0.missionDay);
  const [history, setHistory] = usePersistent<CheckIn[]>('ph.history', () => s0.build());
  const [eventDose, setEventDose] = usePersistent<number>('ph.eventDose', () => s0.eventDoseMsv);
  const [solarEvent, setSolarEvent] = usePersistent<boolean>('ph.solarEvent', () => s0.solarEvent);
  const [selected, setSelected] = useState<IndicatorId | null>(FOCUS[scenarioId ?? START]);
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const mission = MISSIONS[missionId];
  const recent = useMemo(() => history.filter((c) => c.day <= missionDay).slice(-30), [history, missionDay]);
  const today = recent.at(-1);
  const guidance = useMemo(() => evaluate(recent, mission, { solarEvent }), [recent, mission, solarEvent]);
  const avgExercise = useMemo(() => {
    const last7 = recent.slice(-7);
    return last7.length ? last7.reduce((s, c) => s + c.exerciseMin, 0) / last7.length : 0;
  }, [recent]);

  const dose = cumulativeDose(mission, missionDay, eventDose);
  const longTerm = useMemo(() => ({
    radiation: radiationStatus(dose),
    bone: boneStatus(boneLossPercent(mission, missionDay, avgExercise)),
    muscle: muscleStatus(muscleRisk(mission, missionDay, avgExercise)),
  }), [dose, mission, missionDay, avgExercise]);

  const ready = useMemo(() => readiness(guidance.alerts, Object.values(longTerm)), [guidance, longTerm]);
  const checkInStreak = useMemo(() => streak(history, missionDay), [history, missionDay]);

  const statusOf = (id: IndicatorId): Status => {
    const v = today?.readings[id];
    return v === undefined ? 'normal' : classify(id, v);
  };

  const statusByRegion = useMemo(() => {
    const by: Record<BodyRegion, Status[]> = { head: [], heart: [], lungs: [], blood: [], musculoskeletal: [], wholeBody: [] };
    for (const ind of INDICATOR_LIST) {
      const v = today?.readings[ind.id];
      if (v !== undefined) by[ind.region].push(classify(ind.id, v));
    }
    by.wholeBody.push(longTerm.radiation, solarEvent ? 'critical' : 'normal');
    by.musculoskeletal.push(longTerm.bone, longTerm.muscle);
    return Object.fromEntries(Object.entries(by).map(([k, v]) => [k, worst(v)])) as Record<BodyRegion, Status>;
  }, [today, longTerm, solarEvent]);

  const hazards: HazardState = {
    radiation: worst([longTerm.radiation, solarEvent ? 'critical' : 'normal']),
    isolation: worst([statusOf('mood'), statusOf('sleep')]),
    distance: mission.commsDelaySec >= 60 ? 'watch' : 'normal',
    gravity: worst([longTerm.bone, longTerm.muscle, statusOf('heartRate'), statusOf('systolic')]),
    environment: worst([statusOf('spo2'), statusOf('respiration'), statusOf('temperature')]),
  };

  const selectScenario = (id: ScenarioId) => {
    const s = SCENARIOS[id];
    setScenarioId(id);
    setMissionId(s.missionId);
    setMissionDay(s.missionDay);
    setHistory(s.build());
    setEventDose(s.eventDoseMsv);
    setSolarEvent(s.solarEvent);
    setSelected(FOCUS[id]);
    setRegion(null);
    setCheckingIn(false);
  };

  // Deep link: ?scenario=hypoxia opens straight into a scenario (for demos and judges).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('scenario');
    if (id && id in SCENARIOS) selectScenario(id as ScenarioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeMission = (id: MissionId) => {
    setMissionId(id);
    setSolarEvent(false);
    setEventDose(0);
    setScenarioId(null);
  };

  const selectRegion = (r: BodyRegion) => {
    setRegion(r);
    const first = INDICATOR_LIST.find((i) => i.region === r);
    if (first) setSelected(first.id);
  };

  const openCheckIn = () => {
    setCheckingIn(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCheckIn = (c: CheckIn) => {
    setHistory((h) => [...h.filter((x) => x.day !== c.day), c].sort((a, b) => a.day - b.day));
    setScenarioId(null);
    setCheckingIn(false);
  };

  return (
    <div className="app">
      <MissionBar mission={mission} missionDay={missionDay} onMission={changeMission} onDay={setMissionDay} />
      <ScenarioBar active={scenarioId} onSelect={selectScenario} onAbout={() => setAboutOpen(true)} />

      {checkingIn && (
        <CheckInForm day={missionDay} previous={today} onSave={saveCheckIn} onCancel={() => setCheckingIn(false)} />
      )}

      <div className="band band-hero">
        <ReadinessPanel readiness={ready} streak={checkInStreak} today={today} missionDay={missionDay} onCheckIn={openCheckIn} />
        <StatusHero guidance={guidance} onSelect={setSelected} />
      </div>

      <HazardsPanel mission={mission} state={hazards} doseMsv={dose} onSelect={setSelected} />

      <div className="band band-body">
        <BodyMap statusByRegion={statusByRegion} selected={region} onSelect={selectRegion} />
        <IndicatorTiles history={recent} selected={selected} onSelect={setSelected} />
      </div>

      <div className="band band-detail">
        {selected && INDICATORS[selected] ? <IndicatorDetail id={selected} history={recent} /> : <div />}
        <SpaceRisks mission={mission} missionDay={missionDay} avgExerciseMin={avgExercise} eventDoseMsv={eventDose} solarEvent={solarEvent} />
      </div>

      <footer className="stack" style={{ justifyItems: 'center', gap: 8 }}>
        <button className="btn small" onClick={() => selectScenario(START)} title="Restore the first demo scenario">↺ Reset demo data</button>
        <p className="disclaimer">
          Decision aid for training and demonstration. Not a medical device. Thresholds are general adult ranges;
          real missions use limits set by flight surgeons for each astronaut. Team Pandanauts · NASA Space Apps Challenge 2026.
        </p>
      </footer>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
