import { useState } from 'react';
import { INDICATOR_LIST, type IndicatorId } from '../domain/indicators';
import type { CheckIn, Readings } from '../domain/simulate';

const MOODS = ['😞', '🙁', '😐', '🙂', '😄'];

interface Props {
  day: number;
  previous?: CheckIn;
  onSave: (c: CheckIn) => void;
  onCancel: () => void;
}

/** Manual daily check-in. Values are prefilled from the last reading so it's quick to update. */
export function CheckInForm({ day, previous, onSave, onCancel }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(INDICATOR_LIST.map((i) => [i.id, previous?.readings[i.id]?.toString() ?? ''])),
  );
  const [exercise, setExercise] = useState(previous?.exerciseMin?.toString() ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const readings: Readings = {};
    for (const [id, raw] of Object.entries(values)) {
      const n = parseFloat(raw);
      if (raw.trim() !== '' && Number.isFinite(n)) readings[id as IndicatorId] = n;
    }
    onSave({ day, readings, exerciseMin: parseFloat(exercise) || 0, source: 'manual' });
  };

  return (
    <form className="card stack" onSubmit={submit}>
      <div className="row spread">
        <h2 className="hud-title">Daily check-in · mission day {day}</h2>
        <span className="small muted">Leave a field empty if you did not measure it.</span>
      </div>
      <div className="tiles">
        {INDICATOR_LIST.filter((i) => i.id !== 'mood').map((ind) => (
          <label key={ind.id} className="stack small" style={{ gap: 4 }}>
            <span className="muted">{ind.name} ({ind.unit})</span>
            <input
              className="btn"
              inputMode="decimal"
              value={values[ind.id]}
              onChange={(e) => setValues({ ...values, [ind.id]: e.target.value })}
              placeholder={`normal ${ind.normalLabel}`}
            />
          </label>
        ))}
        <label className="stack small" style={{ gap: 4 }}>
          <span className="muted">Exercise today (min)</span>
          <input className="btn" inputMode="numeric" value={exercise} onChange={(e) => setExercise(e.target.value)} placeholder="target 90" />
        </label>
      </div>
      <fieldset className="row" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="small muted" style={{ marginBottom: 6 }}>How do you feel today?</legend>
        {MOODS.map((m, i) => (
          <button
            type="button"
            key={m}
            className="btn"
            aria-label={`Mood ${i + 1} of 5`}
            aria-pressed={values.mood === String(i + 1)}
            style={{ fontSize: 24, borderColor: values.mood === String(i + 1) ? 'var(--orange)' : undefined }}
            onClick={() => setValues({ ...values, mood: String(i + 1) })}
          >
            {m}
          </button>
        ))}
      </fieldset>
      <div className="row">
        <button className="btn btn-primary" type="submit">Save check-in</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
