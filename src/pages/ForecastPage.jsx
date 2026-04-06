import { useState, useMemo, useEffect } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import Topbar from '../components/Topbar.jsx'
import { useAuth } from '../App.jsx'
import { getToken } from '../utils/auth.js'

/* ── Monte Carlo simulation (runs fully in browser) ─────────── */
function runMonteCarlo(base, { interactionsPerDay, complexityRate, learningRate, fatigueRate, numSimulations }) {
  const DAYS = 90
  const all  = []

  for (let i = 0; i < numSimulations; i++) {
    const t = new Array(DAYS + 1)
    t[0] = base
    for (let d = 1; d <= DAYS; d++) {
      const noise   = (Math.random() - 0.5) * 8
      const gain    = learningRate * (complexityRate / 100) * (interactionsPerDay / 25) * 100
      const fatigue = fatigueRate * Math.random() * 100
      t[d] = Math.max(0, Math.min(100, t[d - 1] + gain - fatigue + noise))
    }
    all.push(t)
  }

  // Sample every 3 days for chart performance (~31 points)
  const points = []
  for (let d = 0; d <= DAYS; d += 3) {
    const vs = all.map(t => t[d]).sort((a, b) => a - b)
    const n  = vs.length
    const μ  = vs.reduce((s, v) => s + v, 0) / n
    points.push({
      day:      d,
      mean:     +μ.toFixed(1),
      ciUpper:  +vs[Math.min(n - 1, Math.floor(n * 0.975))].toFixed(1),
      ciLower:  +vs[Math.max(0,     Math.floor(n * 0.025))].toFixed(1),
      iqrUpper: +vs[Math.min(n - 1, Math.floor(n * 0.75))].toFixed(1),
      iqrLower: +vs[Math.max(0,     Math.floor(n * 0.25))].toFixed(1),
    })
  }
  // Ensure day 90 is always included
  if (points[points.length - 1].day !== DAYS) {
    const vs = all.map(t => t[DAYS]).sort((a, b) => a - b)
    const n  = vs.length
    const μ  = vs.reduce((s, v) => s + v, 0) / n
    points.push({ day: DAYS, mean: +μ.toFixed(1),
      ciUpper:  +vs[Math.min(n-1, Math.floor(n*0.975))].toFixed(1),
      ciLower:  +vs[Math.max(0,   Math.floor(n*0.025))].toFixed(1),
      iqrUpper: +vs[Math.min(n-1, Math.floor(n*0.75))].toFixed(1),
      iqrLower: +vs[Math.max(0,   Math.floor(n*0.25))].toFixed(1),
    })
  }

  const passProb       = all.filter(t => t[DAYS] >= 80).length / numSimulations * 100
  const predictedScore = points[points.length - 1].mean
  return { points, passProb, predictedScore }
}

/* ── Slider ──────────────────────────────────────────────────── */
function SliderParam({ label, value, min, max, step, fmt, onChange }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{label}</span>
        <span style={{
          fontSize: '12px', fontWeight: '700', color: 'white',
          background: '#1e3a35', borderRadius: '6px', padding: '2px 10px',
        }}>
          {fmt(value)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#1e3a35', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span style={{ fontSize: '10px', color: '#c4c9d4' }}>{fmt(min)}</span>
        <span style={{ fontSize: '10px', color: '#c4c9d4' }}>{fmt(max)}</span>
      </div>
    </div>
  )
}

/* ── Tooltip ─────────────────────────────────────────────────── */
function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const lbl = label === 0 ? 'Now' : `Day ${label} (Month ${(label / 30).toFixed(1)})`
  const rows = payload.filter(e => e.name && e.value != null && e.name !== '')
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
      padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      fontFamily: "'Inter', sans-serif", minWidth: '170px',
    }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>{lbl}</div>
      {rows.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.stroke || '#9ca3af', flexShrink: 0 }}/>
          <span style={{ fontSize: '12px', color: '#6b7280', flex: 1 }}>{e.name}</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{e.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ label, value, sub, iconBg, iconColor, iconPath, badge, badgeColor, progressBar }) {
  return (
    <div style={{
      background: 'white', borderRadius: '14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      padding: '22px 24px', flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {iconPath}
          </svg>
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: '1', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
        {sub && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{sub}</div>}
        {badge && (
          <div style={{ background: badgeColor.bg, color: badgeColor.text, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' }}>
            {badge}
          </div>
        )}
      </div>
      {progressBar != null && (
        <div style={{ background: '#eff6ff', borderRadius: '4px', height: '5px', marginTop: '12px', overflow: 'hidden' }}>
          <div style={{ background: '#3b82f6', height: '100%', borderRadius: '4px', width: `${Math.min(100, progressBar)}%`, transition: 'width 0.4s ease' }}/>
        </div>
      )}
    </div>
  )
}

/* ── Chart legend ────────────────────────────────────────────── */
const LEGEND = [
  { color: '#1e3a35', label: 'Predicted Mean',      dash: null  },
  { color: '#3b82f6', label: '95% CI Upper',         dash: '5 3' },
  { color: '#93c5fd', label: '95% CI Lower',         dash: '5 3' },
  { color: '#f97316', label: 'IQR Upper (75th %ile)',dash: '4 2' },
  { color: '#22c55e', label: 'IQR Lower (25th %ile)',dash: '4 2' },
  { color: '#f97316', label: 'Coaching (60%)',       dash: '6 3' },
  { color: '#16a34a', label: 'Pass Benchmark (80%)', dash: null  },
]

/* ── Main page ───────────────────────────────────────────────── */
export default function ForecastPage() {
  const { viewingAs } = useAuth()
  const [baseScore, setBaseScore]       = useState(70)
  const [referenceDate, setReferenceDate] = useState(null)
  const [params, setParams] = useState({
    interactionsPerDay: 25,
    complexityRate:     50,
    learningRate:       0.08,
    fatigueRate:        0.03,
    numSimulations:     200,
  })

  // Pull current score from DB as simulation baseline
  useEffect(() => {
    const url = `/api/dashboard${viewingAs?.id ? `?officerId=${viewingAs.id}` : ''}`
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => {
        if (d.stats?.competencyScore != null) setBaseScore(+d.stats.competencyScore.toFixed(1))
        if (d.stats?.referenceDate)           setReferenceDate(d.stats.referenceDate)
      })
      .catch(() => {})
  }, [viewingAs?.id])

  const setParam = (key, val) => setParams(p => ({ ...p, [key]: val }))

  const { points, passProb, predictedScore } = useMemo(
    () => runMonteCarlo(baseScore, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseScore, params.interactionsPerDay, params.complexityRate, params.learningRate, params.fatigueRate, params.numSimulations]
  )

  const delta    = predictedScore - baseScore
  const deltaPos = delta >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Topbar
        title="3-Month Performance Forecast"
        subtitle={`Monte Carlo simulation · ${params.numSimulations} iterations${referenceDate ? ` · Data as of ${referenceDate}` : ''}`}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Stat cards ── */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <StatCard
            label="Predicted Performance"
            value={`${predictedScore.toFixed(1)}%`}
            sub="At day 90"
            iconBg="#e8f5f0" iconColor="#1e3a35"
            iconPath={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
            badge={`${deltaPos ? '+' : ''}${delta.toFixed(1)}% from baseline`}
            badgeColor={deltaPos ? { bg: '#dcfce7', text: '#166534' } : { bg: '#fef2f2', text: '#dc2626' }}
          />
          <StatCard
            label="Pass Probability"
            value={`${passProb.toFixed(0)}%`}
            sub="Reach 80% benchmark"
            iconBg="#eff6ff" iconColor="#3b82f6"
            iconPath={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}
            progressBar={passProb}
          />
          <StatCard
            label="Confidence Level"
            value="95%"
            sub="Statistical confidence"
            iconBg="#f5f3ff" iconColor="#7c3aed"
            iconPath={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>}
          />
        </div>

        {/* ── Trajectory chart ── */}
        <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
              Performance Trajectory with Confidence Bands
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px' }}>
              Baseline: {baseScore.toFixed(1)}% — {params.numSimulations} simulated trajectories over 90 days
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={points} margin={{ top: 10, right: 24, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ciBandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.18}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false}/>

              <XAxis
                dataKey="day" type="number"
                domain={[0, 90]} ticks={[0, 30, 60, 90]}
                tickFormatter={d => d === 0 ? 'Now' : `Month ${d / 30}`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`}
                label={{ value: 'Performance Score (%)', angle: -90, position: 'insideLeft', offset: 18, style: { fontSize: 10, fill: '#c4c9d4' } }}
              />

              <Tooltip content={<ForecastTooltip />}/>

              {/* CI filled band: ciUpper fills blue, ciLower masks with white */}
              <Area type="monotone" dataKey="ciUpper" fill="url(#ciBandFill)" stroke="none" dot={false} name="" legendType="none" activeDot={false}/>
              <Area type="monotone" dataKey="ciLower" fill="white" stroke="none" dot={false} name="" legendType="none" activeDot={false}/>

              {/* Reference lines (rendered above band) */}
              <ReferenceLine y={60} stroke="#f97316" strokeDasharray="6 3" strokeWidth={1.5}
                label={{ value: 'Coaching (60%)', position: 'insideTopRight', fontSize: 10, fill: '#f97316', fontFamily: 'Inter, sans-serif' }}/>
              <ReferenceLine y={80} stroke="#16a34a" strokeWidth={2}
                label={{ value: 'Pass (80%)', position: 'insideTopRight', fontSize: 10, fill: '#16a34a', fontFamily: 'Inter, sans-serif' }}/>

              {/* 95% CI lines */}
              <Line type="monotone" dataKey="ciUpper"  stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="95% CI Upper"  legendType="none"/>
              <Line type="monotone" dataKey="ciLower"  stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="95% CI Lower"  legendType="none"/>

              {/* IQR lines */}
              <Line type="monotone" dataKey="iqrUpper" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="IQR Upper (75th %ile)" legendType="none"/>
              <Line type="monotone" dataKey="iqrLower" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="IQR Lower (25th %ile)" legendType="none"/>

              {/* Mean */}
              <Line type="monotone" dataKey="mean" stroke="#1e3a35" strokeWidth={2.5} dot={false} name="Predicted Mean" legendType="none"/>
            </ComposedChart>
          </ResponsiveContainer>

          {/* Custom legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px 20px', marginTop: '16px' }}>
            {LEGEND.map(({ color, label, dash }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280' }}>
                <svg width="20" height="10" viewBox="0 0 20 10">
                  <line x1="0" y1="5" x2="20" y2="5"
                    stroke={color}
                    strokeWidth={dash ? '1.5' : '2.5'}
                    strokeDasharray={dash ?? 'none'}
                  />
                </svg>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Simulation Parameters ── */}
        <div style={{
          background: 'white', borderRadius: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          padding: '24px 28px', marginBottom: '4px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
            Simulation Parameters
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>
            Adjust parameters to explore different scenarios — chart updates in real time.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
            <SliderParam label="Interactions per Day"   value={params.interactionsPerDay} min={1}    max={50}  step={1}    fmt={v => v}           onChange={v => setParam('interactionsPerDay', v)}/>
            <SliderParam label="Complexity Rate"        value={params.complexityRate}     min={0}    max={100} step={1}    fmt={v => `${v}%`}     onChange={v => setParam('complexityRate', v)}/>
            <SliderParam label="Learning Rate"          value={params.learningRate}        min={0.01} max={0.20} step={0.01} fmt={v => v.toFixed(2)} onChange={v => setParam('learningRate', v)}/>
            <SliderParam label="Fatigue Rate"           value={params.fatigueRate}         min={0.00} max={0.10} step={0.01} fmt={v => v.toFixed(2)} onChange={v => setParam('fatigueRate', v)}/>
            <SliderParam label="Number of Simulations"  value={params.numSimulations}      min={50}   max={500} step={10}   fmt={v => v}           onChange={v => setParam('numSimulations', v)}/>
          </div>
        </div>

      </div>
    </div>
  )
}
