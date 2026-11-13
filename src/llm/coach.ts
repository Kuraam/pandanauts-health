/**
 * Onboard AI coach: a small LLM running entirely in the browser (WebGPU).
 *
 * Safety design: the deterministic rules engine decides every status and
 * action. The model only REPHRASES that output in a friendly voice and answers
 * questions grounded in the app's own explanation texts. It never sees the
 * internet at runtime: weights are cached after the first download.
 */
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import type { Guidance } from '../domain/guidance';
import { INDICATOR_LIST } from '../domain/indicators';
import type { Mission } from '../domain/missions';
import { formatDelay } from '../domain/missions';
import type { Readiness } from '../domain/readiness';

const MODEL_F16 = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const MODEL_F32 = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

export type CoachSupport = { ok: true; f16: boolean } | { ok: false; reason: string };

/** Check WebGPU support and whether the GPU supports 16-bit shaders. */
export async function checkSupport(): Promise<CoachSupport> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<{ features: Set<string> } | null> } }).gpu;
  if (!gpu) return { ok: false, reason: 'This browser has no WebGPU. Use a recent Chrome or Edge on a laptop.' };
  try {
    // Some devices never resolve requestAdapter(); don't leave the UI hanging.
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    const adapter = await Promise.race([gpu.requestAdapter(), timeout]);
    if (!adapter) return { ok: false, reason: 'No compatible graphics adapter was found.' };
    return { ok: true, f16: adapter.features.has('shader-f16') };
  } catch {
    return { ok: false, reason: 'WebGPU is blocked on this device.' };
  }
}

let engine: MLCEngineInterface | null = null;

export async function loadCoach(f16: boolean, onProgress: (text: string, progress: number) => void) {
  if (engine) return engine;
  // Loaded on demand so the main app stays small and fast.
  const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
  engine = await CreateMLCEngine(f16 ? MODEL_F16 : MODEL_F32, {
    initProgressCallback: (r) => onProgress(r.text, r.progress),
  });
  return engine;
}

const RULES = `You are "Panda", the onboard health coach on a spacecraft. You talk to one astronaut.
Hard rules:
- The onboard rules engine has ALREADY decided every status and action. Never change, add or remove a status, number, threshold or action.
- Never diagnose a disease and never prescribe medication.
- Be calm, warm and brief. Use plain words, no jargon.
- If a status is CRITICAL, say so first and clearly.`;

function situation(g: Guidance, r: Readiness, m: Mission) {
  const alerts = g.alerts.length
    ? g.alerts.map((a) => `- [${a.status.toUpperCase()}] ${a.title}. Actions: ${a.actions.join(' ')}`).join('\n')
    : '- None. All indicators normal.';
  return `Mission: ${m.name}. Earth signal delay: ${formatDelay(m.commsDelaySec)} each way.
Readiness: ${r.score}/100 (${r.label}).
Assessment: ${g.headline}.
Findings:
${alerts}`;
}

/** Stream a short spoken-style briefing that rephrases the rules output. */
export async function briefing(g: Guidance, r: Readiness, m: Mission, onToken: (t: string) => void) {
  if (!engine) throw new Error('Coach not loaded');
  const stream = await engine.chat.completions.create({
    stream: true,
    temperature: 0.4,
    max_tokens: 220,
    messages: [
      { role: 'system', content: RULES },
      {
        role: 'user',
        content: `${situation(g, r, m)}

Write a morning briefing for the astronaut in 3 to 5 short sentences. Mention only the findings above, keep their order, and end with the single most important next step.`,
      },
    ],
  });
  for await (const chunk of stream) onToken(chunk.choices[0]?.delta?.content ?? '');
}

/** Answer a question, grounded only in the app's indicator explanations and today's findings. */
export async function ask(question: string, g: Guidance, r: Readiness, m: Mission, onToken: (t: string) => void) {
  if (!engine) throw new Error('Coach not loaded');
  const knowledge = INDICATOR_LIST.map(
    (i) => `${i.name} (normal ${i.normalLabel} ${i.unit}): ${i.explain.what} ${i.explain.whySpace} How to measure: ${i.explain.howToMeasure}`,
  ).join('\n');
  const stream = await engine.chat.completions.create({
    stream: true,
    temperature: 0.3,
    max_tokens: 260,
    messages: [
      {
        role: 'system',
        content: `${RULES}
- Answer ONLY from the reference notes and today's situation below. If the answer is not there, say you are not sure and suggest asking the crew medical officer or flight surgeons.
- Keep answers under 90 words.

Reference notes:
${knowledge}

Today's situation:
${situation(g, r, m)}`,
      },
      { role: 'user', content: question },
    ],
  });
  for await (const chunk of stream) onToken(chunk.choices[0]?.delta?.content ?? '');
}
