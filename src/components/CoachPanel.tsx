import { useEffect, useRef, useState } from 'react';
import type { Guidance } from '../domain/guidance';
import type { Mission } from '../domain/missions';
import type { Readiness } from '../domain/readiness';
import { ask, briefing, checkSupport, loadCoach, type CoachSupport } from '../llm/coach';

interface Props {
  guidance: Guidance;
  readiness: Readiness;
  mission: Mission;
}

type Phase = 'checking' | 'unsupported' | 'idle' | 'loading' | 'ready' | 'error';

const SUGGESTED = ['Why does space affect my sleep?', 'What should I do first today?', 'Why is my temperature higher in space?'];

/** Optional onboard AI coach. The rules engine still works fully without it. */
export function CoachPanel({ guidance, readiness, mission }: Props) {
  const [support, setSupport] = useState<CoachSupport | null>(null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [progress, setProgress] = useState({ text: '', value: 0 });
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState('');
  const [lastQ, setLastQ] = useState<string | null>(null);
  const autoBriefed = useRef(false);

  useEffect(() => {
    checkSupport().then((s) => {
      setSupport(s);
      setPhase(s.ok ? 'idle' : 'unsupported');
    });
  }, []);

  const run = async (fn: (onToken: (t: string) => void) => Promise<void>) => {
    setBusy(true);
    setOutput('');
    try {
      await fn((t) => setOutput((o) => o + t));
    } catch (e) {
      setOutput(`The coach could not answer (${(e as Error).message}). The rules engine above is unaffected.`);
    } finally {
      setBusy(false);
    }
  };

  const doBriefing = () => {
    setLastQ(null);
    return run((cb) => briefing(guidance, readiness, mission, cb));
  };

  const activate = async () => {
    if (!support?.ok) return;
    setPhase('loading');
    try {
      await loadCoach(support.f16, (text, value) => setProgress({ text, value }));
      setPhase('ready');
    } catch (e) {
      setProgress({ text: (e as Error).message, value: 0 });
      setPhase('error');
    }
  };

  // First briefing as soon as the model is ready; refresh when the situation changes.
  useEffect(() => {
    if (phase !== 'ready' || busy) return;
    if (!autoBriefed.current || lastQ === null) {
      autoBriefed.current = true;
      doBriefing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, guidance.headline, mission.id]);

  const submit = (q: string) => {
    if (!q.trim() || busy) return;
    setLastQ(q);
    setQuestion('');
    run((cb) => ask(q, guidance, readiness, mission, cb));
  };

  return (
    <section className="card stack coach">
      <div className="row spread">
        <h2 className="hud-title">Panda · onboard AI coach</h2>
        <span className="tag" title="The model runs on this device. Statuses and actions always come from the rules engine.">
          🔒 ON-DEVICE · RULES ENGINE DECIDES
        </span>
      </div>

      <div className="coach-body">
        <img src="/logo-mark.png" alt="" width={56} height={56} className="coach-avatar" />
        <div className="stack" style={{ gap: 10, flex: 1, minWidth: 0 }}>
          {phase === 'checking' && <p className="muted small">Checking this device…</p>}

          {phase === 'unsupported' && support && !support.ok && (
            <p className="small muted">
              {support.reason} The coach is optional: every status, alert and action above comes from the rules engine and works on any device.
            </p>
          )}

          {phase === 'idle' && (
            <>
              <p>
                Hi, I'm Panda. I can turn today's assessment into a short briefing and answer questions about your readings,
                <strong> with no connection to Earth</strong>. My language model runs on this device's graphics card.
              </p>
              <div className="row">
                <button className="btn btn-primary" onClick={activate}>⚡ Activate coach</button>
                <span className="small muted">One-time download ≈ 0.9 GB, then fully offline.</span>
              </div>
            </>
          )}

          {phase === 'loading' && (
            <div className="stack" style={{ gap: 6 }}>
              <p className="small">Loading the onboard model… {Math.round(progress.value * 100)}%</p>
              <div className="meter"><div style={{ width: `${progress.value * 100}%` }} /></div>
              <p className="mono small muted" style={{ overflowWrap: 'anywhere' }}>{progress.text}</p>
            </div>
          )}

          {phase === 'error' && (
            <p className="small" style={{ color: 'var(--crit)' }}>
              The coach could not start: {progress.text}. Everything else in the app keeps working.
            </p>
          )}

          {phase === 'ready' && (
            <>
              {lastQ && <p className="small muted">You asked: “{lastQ}”</p>}
              <div className="speech" aria-live="polite">
                {output || (busy ? 'Thinking…' : 'Ask me anything about your readings.')}
                {busy && <span className="caret" aria-hidden>▍</span>}
              </div>
              <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); submit(question); }}>
                <input className="btn" style={{ flex: '1 1 220px', textAlign: 'left' }} value={question}
                  onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Panda a question…" aria-label="Question for the coach" />
                <button className="btn btn-primary" type="submit" disabled={busy}>Ask</button>
                <button className="btn" type="button" onClick={doBriefing} disabled={busy}>↻ Briefing</button>
              </form>
              <div className="row" style={{ gap: 6 }}>
                {SUGGESTED.map((q) => (
                  <button key={q} className="tag" style={{ cursor: 'pointer' }} onClick={() => submit(q)} disabled={busy}>{q}</button>
                ))}
              </div>
              <p className="small muted">AI-rephrased. If anything here differs from the assessment above, follow the assessment.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
