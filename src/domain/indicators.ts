/**
 * Health indicator catalogue.
 *
 * Each indicator carries:
 *  - thresholds (normal / watch / critical bands) with the source they come from
 *  - plain-language explanations shown in the app's "Why this matters" cards
 *
 * Thresholds are general adult reference ranges. On a real mission, flight
 * surgeons set individualised limits. This app is a decision aid, not a
 * medical device.
 */

export type Status = 'normal' | 'watch' | 'critical';

/** A numeric band: value v is inside when min <= v < max. */
export interface Band {
  min: number;
  max: number;
  status: Status;
}

export type IndicatorId =
  | 'heartRate'
  | 'systolic'
  | 'diastolic'
  | 'spo2'
  | 'temperature'
  | 'glucose'
  | 'sleep'
  | 'mood'
  | 'respiration';

export type BodyRegion = 'head' | 'heart' | 'lungs' | 'blood' | 'musculoskeletal' | 'wholeBody';

export interface Indicator {
  id: IndicatorId;
  name: string;
  unit: string;
  region: BodyRegion;
  /** Ordered, contiguous bands covering the plausible range. */
  bands: Band[];
  /** Normal range shown to the user, e.g. "60–100". */
  normalLabel: string;
  source: string;
  explain: {
    what: string;
    howToMeasure: string;
    whySpace: string;
  };
  /** Plain-language actions per non-normal status. */
  actions: { watch: string[]; critical: string[] };
}

const INF = Number.POSITIVE_INFINITY;
const NINF = Number.NEGATIVE_INFINITY;

export const INDICATORS: Record<IndicatorId, Indicator> = {
  heartRate: {
    id: 'heartRate',
    name: 'Resting heart rate',
    unit: 'bpm',
    region: 'heart',
    bands: [
      { min: NINF, max: 40, status: 'critical' },
      { min: 40, max: 50, status: 'watch' },
      { min: 50, max: 101, status: 'normal' },
      { min: 101, max: 131, status: 'watch' },
      { min: 131, max: INF, status: 'critical' },
    ],
    normalLabel: '50–100',
    source: 'AHA adult resting reference; NASA HRP Cardiovascular Evidence Report',
    explain: {
      what: 'How many times your heart beats per minute while at rest.',
      howToMeasure: 'Sit still for 5 minutes, then read your wearable or count your pulse at the wrist for 60 seconds.',
      whySpace:
        'In microgravity, body fluids shift toward the head and the heart does less work, so it slowly deconditions. Stress, fever, dehydration and poor sleep also raise the heart rate.',
    },
    actions: {
      watch: ['Re-measure after 10 minutes of rest.', 'Drink water and check you slept enough.', 'Avoid heavy exercise until it settles.'],
      critical: ['Stop all activity and lie still.', 'Re-measure now. If it is still out of range, alert your crew medical officer.', 'Contact flight surgeons (see comms delay).'],
    },
  },
  systolic: {
    id: 'systolic',
    name: 'Blood pressure (systolic)',
    unit: 'mmHg',
    region: 'heart',
    bands: [
      { min: NINF, max: 90, status: 'critical' },
      { min: 90, max: 130, status: 'normal' },
      { min: 130, max: 180, status: 'watch' },
      { min: 180, max: INF, status: 'critical' },
    ],
    normalLabel: '90–129',
    source: 'ACC/AHA 2017 Blood Pressure Guideline',
    explain: {
      what: 'The top number: the pressure in your arteries when the heart beats.',
      howToMeasure: 'Sit, rest your arm at heart level, and use the cuff. Take two readings 1 minute apart and average them.',
      whySpace:
        'Fluid shifts in microgravity change blood volume and vessel stiffness. Low pressure can cause dizziness or fainting, especially when returning to gravity (orthostatic intolerance).',
    },
    actions: {
      watch: ['Re-measure after 5 minutes of rest.', 'Cut back on salt and caffeine today.', 'Log it and check the trend tomorrow.'],
      critical: ['Lie down now. If pressure is low, raise your legs.', 'Re-measure. If it is still out of range, alert your crew medical officer.', 'Contact flight surgeons.'],
    },
  },
  diastolic: {
    id: 'diastolic',
    name: 'Blood pressure (diastolic)',
    unit: 'mmHg',
    region: 'heart',
    bands: [
      { min: NINF, max: 50, status: 'watch' },
      { min: 50, max: 80, status: 'normal' },
      { min: 80, max: 120, status: 'watch' },
      { min: 120, max: INF, status: 'critical' },
    ],
    normalLabel: '50–79',
    source: 'ACC/AHA 2017 Blood Pressure Guideline',
    explain: {
      what: 'The bottom number: the pressure in your arteries between beats.',
      howToMeasure: 'Measured at the same time as systolic with the cuff.',
      whySpace: 'Same causes as systolic. Together the two numbers describe cardiovascular strain.',
    },
    actions: {
      watch: ['Re-measure after 5 minutes of rest.', 'Cut back on salt and caffeine today.'],
      critical: ['Lie down and re-measure.', 'Alert your crew medical officer and contact flight surgeons.'],
    },
  },
  spo2: {
    id: 'spo2',
    name: 'Blood oxygen (SpO₂)',
    unit: '%',
    region: 'lungs',
    bands: [
      { min: NINF, max: 90, status: 'critical' },
      { min: 90, max: 95, status: 'watch' },
      { min: 95, max: INF, status: 'normal' },
    ],
    normalLabel: '≥95',
    source: 'WHO Pulse Oximetry Training Manual',
    explain: {
      what: 'The share of your red blood cells carrying oxygen.',
      howToMeasure: 'Clip the pulse oximeter on a warm finger and stay still for 30 seconds.',
      whySpace:
        'A spacecraft is a closed environment. A life-support fault, high cabin CO₂ or a lung infection can lower blood oxygen. It is one of the fastest warning signs.',
    },
    actions: {
      watch: ['Re-measure on another finger.', 'Check the cabin O₂/CO₂ readings.', 'Breathe slowly and deeply for 2 minutes, then re-measure.'],
      critical: ['Put on supplemental oxygen if available.', 'Check life support and alert your crew immediately.', 'Contact flight surgeons.'],
    },
  },
  temperature: {
    id: 'temperature',
    name: 'Body temperature',
    unit: '°C',
    region: 'wholeBody',
    bands: [
      { min: NINF, max: 35, status: 'critical' },
      { min: 35, max: 36.1, status: 'watch' },
      { min: 36.1, max: 37.6, status: 'normal' },
      { min: 37.6, max: 38.5, status: 'watch' },
      { min: 38.5, max: INF, status: 'critical' },
    ],
    normalLabel: '36.1–37.5',
    source: 'Clinical reference ranges; Stahn et al. 2017, Scientific Reports ("space fever")',
    explain: {
      what: 'Your core body temperature.',
      howToMeasure: 'Use the oral or forehead thermometer before eating or exercising.',
      whySpace:
        'Core temperature runs about 1 °C higher during long missions because heat dissipates poorly in microgravity. The immune system also weakens in space, so a fever can mean infection.',
    },
    actions: {
      watch: ['Drink fluids and rest.', 'Re-measure in 2 hours.', 'Note any other symptoms (cough, aches).'],
      critical: ['Rest and cool down, or warm up if your temperature is low.', 'Alert your crew medical officer.', 'Contact flight surgeons and check the medical kit for treatment.'],
    },
  },
  glucose: {
    id: 'glucose',
    name: 'Blood sugar (fasting)',
    unit: 'mg/dL',
    region: 'blood',
    bands: [
      { min: NINF, max: 54, status: 'critical' },
      { min: 54, max: 70, status: 'watch' },
      { min: 70, max: 100, status: 'normal' },
      { min: 100, max: 251, status: 'watch' },
      { min: 251, max: INF, status: 'critical' },
    ],
    normalLabel: '70–99',
    source: 'American Diabetes Association Standards of Care',
    explain: {
      what: 'The amount of glucose (sugar) in your blood after not eating for 8 hours or more.',
      howToMeasure: 'Prick a fingertip and use the glucometer, first thing in the morning before eating.',
      whySpace:
        'Less physical activity and stress hormones in space can make the body respond less well to insulin (insulin resistance). Low sugar causes shakiness and confusion, which is dangerous during critical tasks.',
    },
    actions: {
      watch: ['If your sugar is low, eat 15 g of fast carbs and re-test in 15 minutes.', 'If it is high, review today\'s meals and add light exercise.', 'Re-test tomorrow morning.'],
      critical: ['If your sugar is low, eat fast carbs now and tell a crewmate.', 'If it is high, re-test and alert your crew medical officer.', 'Contact flight surgeons.'],
    },
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep last night',
    unit: 'h',
    region: 'head',
    bands: [
      { min: NINF, max: 5, status: 'critical' },
      { min: 5, max: 7, status: 'watch' },
      { min: 7, max: INF, status: 'normal' },
    ],
    normalLabel: '≥7',
    source: 'AASM adult sleep recommendation; Barger et al. 2014, Lancet Neurology',
    explain: {
      what: 'Hours you actually slept.',
      howToMeasure: 'Read it from your wearable, or log the times you fell asleep and woke up.',
      whySpace:
        'On the ISS, the sun rises 16 times a day, and noise and stress disrupt sleep. Crews average only about 6 hours. Sleep loss slows reactions and raises the risk of errors.',
    },
    actions: {
      watch: ['Plan an earlier bedtime tonight.', 'Avoid screens and caffeine before sleep.', 'Use eye mask and ear plugs.'],
      critical: ['Avoid safety-critical tasks today if possible.', 'Schedule a short nap (20 minutes).', 'Tell your commander so the workload can be adjusted.'],
    },
  },
  mood: {
    id: 'mood',
    name: 'Mood',
    unit: '/5',
    region: 'head',
    bands: [
      { min: NINF, max: 2, status: 'critical' },
      { min: 2, max: 3, status: 'watch' },
      { min: 3, max: INF, status: 'normal' },
    ],
    normalLabel: '3–5',
    source: 'NASA HRP Behavioral Medicine Evidence Report (self-rating scale)',
    explain: {
      what: 'How you feel today, from 1 (very low) to 5 (great).',
      howToMeasure: 'Rate honestly once a day. No one judges this score.',
      whySpace:
        'Isolation, confinement and being far from Earth are among NASA\'s five spaceflight hazards. Low mood that lasts several days can affect sleep, teamwork and safety.',
    },
    actions: {
      watch: ['Schedule a call or message with family.', 'Do a 10-minute exercise session and look out the window.', 'Talk with a crewmate.'],
      critical: ['Tell a crewmate or your commander how you feel.', 'Book a private session with the ground psychologist (comms delay applies).', 'Reduce workload today if possible.'],
    },
  },
  respiration: {
    id: 'respiration',
    name: 'Breathing rate',
    unit: '/min',
    region: 'lungs',
    bands: [
      { min: NINF, max: 8, status: 'critical' },
      { min: 8, max: 12, status: 'watch' },
      { min: 12, max: 21, status: 'normal' },
      { min: 21, max: 30, status: 'watch' },
      { min: 30, max: INF, status: 'critical' },
    ],
    normalLabel: '12–20',
    source: 'Clinical adult reference range',
    explain: {
      what: 'Breaths per minute at rest.',
      howToMeasure: 'Count your chest rises for 60 seconds while resting, or read your wearable.',
      whySpace: 'Fast breathing can signal high CO₂ in the cabin, a lung infection or anxiety.',
    },
    actions: {
      watch: ['Rest and re-count in 5 minutes.', 'Check cabin CO₂ levels.'],
      critical: ['Check your SpO₂ and life support.', 'Alert your crew and contact flight surgeons.'],
    },
  },
};

export const INDICATOR_LIST: Indicator[] = Object.values(INDICATORS);
