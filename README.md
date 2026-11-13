<p align="center">
  <img src="public/logo-mark.png" width="120" alt="Team Pandanauts logo" />
</p>

<h1 align="center">Pandanauts Health</h1>
<p align="center"><b>An offline health self-check for astronauts on long-duration missions</b><br/>
Team Pandanauts · NASA Space Apps Challenge 2026 · <i>Create Health Monitoring Software for Astronauts on Space Missions</i></p>

<p align="center">
  <a href="https://pandanauts-health.netlify.app"><b>▶ Live app</b></a> ·
  <a href="https://pandanauts-health.netlify.app/?scenario=hypoxia">Mars low-oxygen scenario</a> ·
  <a href="https://pandanauts-health.netlify.app/?scenario=solarStorm">Lunar solar-storm scenario</a>
</p>

---

## The problem

On the ISS, a flight surgeon is a video call away. On the way to Mars, a message takes **up to 20 minutes each way**, and during solar conjunction there's no link at all. NASA's Human Research Program names five hazards of spaceflight (**radiation, isolation and confinement, distance from Earth, gravity fields, and a hostile closed environment**), and they cause bone loss, heart deconditioning, poor sleep, low mood, immune changes and more. On long missions, **astronauts have to spot and act on these changes themselves.**

## What it does

Pandanauts Health turns a few daily measurements into a clear answer to three questions: *How am I? Why? What do I do now?*

| | |
|---|---|
| **Measure** | A 60-second daily check-in (heart rate, blood pressure, SpO₂, temperature, blood sugar, sleep, mood, breathing, exercise) or wearable data. Routine reminders mark what's still **DUE**. |
| **Assess** | An onboard **rules engine** compares every reading with published clinical thresholds and looks for multi-day trends (e.g. 3 nights of sleep debt). Every value gets **Normal / Watch / Critical** with icon + label + colour. |
| **Act** | Plain-language steps for each finding, a **Mission Readiness** score, and a *Send to flight surgeons* action that shows the real signal delay, so the crew knows to start the onboard steps first. |
| **Understand** | A clickable **body scan**, NASA's **5 hazards** panel, trend charts with threshold bands, and a "why does space change this?" card for every indicator. |
| **Long-term risk** | Cumulative **radiation dose** against NASA's 600 mSv career limit (real measured rates per environment), estimated **bone loss** and **muscle atrophy** risk driven by gravity and logged exercise. |
| **AI coach (optional)** | *Panda*, a small language model (Llama 3.2 1B) running **on the device's GPU** via WebLLM, turns the assessment into a friendly briefing and answers questions. It **cannot change** any status or action; the rules engine decides. |
| **Works offline** | Installable PWA: after the first visit the whole app, fonts included, runs with no network. |

### Demo scenarios (all simulated)
| Scenario | What it shows |
|---|---|
| 😴 ISS · Fatigue building | Slow drift: sleep debt, low mood, slipping exercise, "space fever". Watch-level guidance. |
| 🫁 Mars transit · Low oxygen | CO₂ scrubber fault: SpO₂ 88 %, fast breathing. **Critical**, with a 12-minute Earth delay, so the crew acts alone. |
| ☀️ Lunar base · Solar storm | Solar particle event: **shelter now**; dose jumps to 81 % of the career limit. |
| ✅ Mars surface · All nominal | Healthy routine; readiness 100. |

## Design principles

1. **Deterministic first, AI second.** Medical status must be predictable and auditable, so a tested rules engine decides it (72 unit tests, including every threshold boundary). The LLM only rephrases.
2. **Every number has a source.** Thresholds cite AHA/ACC, ADA, WHO, AASM and NASA HRP; radiation rates are real instrument measurements (MSL/RAD, Curiosity RAD, Chang'e-4 LND). See *About & data sources* in the app.
3. **Real vs simulated is always labelled.** 📡 published data · 🧪 simulated · ✍ your check-in.
4. **Safety overrides.** Any critical finding forces readiness to "Limit duties", whatever the points total says.
5. **Accessible.** Status is never colour-only; keyboard navigable; respects reduced-motion.

## Data & references

| Used for | Source |
|---|---|
| Five hazards framework, bone/muscle/cardiovascular/behavioural risks | NASA Human Research Program Evidence Reports |
| Radiation career limit 600 mSv | NASA-STD-3001 Vol. 1 Rev. B (2022) |
| Mars cruise 1.84 mSv/day | Zeitlin et al. 2013, *Science* (MSL/RAD) |
| Mars surface 0.64 mSv/day | Hassler et al. 2014, *Science* (Curiosity RAD) |
| Lunar surface 1.37 mSv/day | Zhang et al. 2020, *Science Advances* (Chang'e-4 LND) |
| Bone loss ≈1–1.5 %/month; exercise protection | LeBlanc et al. 2000; Smith et al. 2012, *JBMR* |
| "Space fever" (+≈1 °C core temp) | Stahn et al. 2017, *Scientific Reports* |
| ISS crew sleep ≈6 h | Barger et al. 2014, *Lancet Neurology* |
| Blood pressure / glucose / SpO₂ / sleep thresholds | ACC/AHA 2017 · ADA Standards of Care · WHO pulse oximetry manual · AASM |

Crew readings in the demo are **simulated** (seeded, reproducible). Individual astronaut medical data is not public.

## Tech

React 19 + TypeScript + Vite · Recharts · vite-plugin-pwa (Workbox) · WebLLM (in-browser LLM on WebGPU) · Vitest · Netlify. Domain logic lives in [`src/domain/`](src/domain) as pure, tested TypeScript.

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (vitest)
npm run build    # production build → dist/
```

## Disclaimer

A decision aid built for a hackathon, **not a medical device**. Thresholds are general adult reference ranges; real missions use limits set by flight surgeons for each astronaut.

<p align="center"><sub>Built by Team Pandanauts 🐼🚀 for NASA Space Apps 2026: The Next Frontier</sub></p>
