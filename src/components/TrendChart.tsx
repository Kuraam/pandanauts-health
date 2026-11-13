import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { INDICATORS, type IndicatorId } from '../domain/indicators';
import type { CheckIn } from '../domain/simulate';
import { classify, STATUS_LABEL } from '../domain/status';

const BAND_FILL = { normal: 'rgba(52,211,153,0.13)', watch: 'rgba(251,191,36,0.13)', critical: 'rgba(255,92,92,0.15)' };

/** One indicator over time, with the threshold bands shaded behind the line. */
export function TrendChart({ id, history }: { id: IndicatorId; history: CheckIn[] }) {
  const ind = INDICATORS[id];
  const data = history
    .filter((c) => c.readings[id] !== undefined)
    .map((c) => ({ day: c.day, value: c.readings[id]! }));
  if (data.length === 0) return <p className="muted small">No readings yet.</p>;

  const values = data.map((d) => d.value);
  const pad = (Math.max(...values) - Math.min(...values)) * 0.4 || 2;
  const lo = Math.floor(Math.min(...values) - pad);
  const hi = Math.ceil(Math.max(...values) + pad);

  return (
    <div className="glow-line" style={{ width: '100%', height: 240 }} role="img" aria-label={`${ind.name} trend over the last ${data.length} days`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          {ind.bands.map((b, i) => {
            const y1 = Math.max(b.min, lo);
            const y2 = Math.min(b.max, hi);
            return y2 > y1 ? <ReferenceArea key={i} y1={y1} y2={y2} fill={BAND_FILL[b.status]} strokeOpacity={0} ifOverflow="hidden" /> : null;
          })}
          <CartesianGrid stroke="#2a3561" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="day" stroke="#8790b0" fontSize={12} tickLine={false} minTickGap={16} tickFormatter={(d) => `D${d}`} />
          <YAxis domain={[lo, hi]} stroke="#8790b0" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a2347', border: '1px solid #2a3561', borderRadius: 8, color: '#eef1fa' }}
            formatter={(v: number) => [`${v} ${ind.unit} · ${STATUS_LABEL[classify(id, v)]}`, ind.name]}
            labelFormatter={(d) => `Day ${d}`}
          />
          <Line type="monotone" dataKey="value" stroke="#FF7A1A" strokeWidth={2} dot={{ r: 3, fill: '#FF7A1A' }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
