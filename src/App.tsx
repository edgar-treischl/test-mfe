import { useMemo, useState } from 'react'
import './App.css'

type Species = 'Adelie' | 'Chinstrap' | 'Gentoo'
type MetricKey = 'billLength' | 'billDepth' | 'flipperLength' | 'bodyMass'

type PenguinDatum = {
  species: Species
  island: string
  sex: 'Female' | 'Male'
  billLength: number
  billDepth: number
  flipperLength: number
  bodyMass: number
}

type MetricOption = {
  key: MetricKey
  label: string
  unit: string
}

const METRICS: MetricOption[] = [
  { key: 'billLength', label: 'Bill length', unit: 'mm' },
  { key: 'billDepth', label: 'Bill depth', unit: 'mm' },
  { key: 'flipperLength', label: 'Flipper length', unit: 'mm' },
  { key: 'bodyMass', label: 'Body mass', unit: 'g' },
]

const PENGUINS: PenguinDatum[] = [
  { species: 'Adelie', island: 'Torgersen', sex: 'Female', billLength: 39.1, billDepth: 18.7, flipperLength: 181, bodyMass: 3750 },
  { species: 'Adelie', island: 'Torgersen', sex: 'Male', billLength: 39.5, billDepth: 17.4, flipperLength: 186, bodyMass: 3800 },
  { species: 'Adelie', island: 'Dream', sex: 'Female', billLength: 37.2, billDepth: 18.1, flipperLength: 178, bodyMass: 3900 },
  { species: 'Adelie', island: 'Biscoe', sex: 'Male', billLength: 41.1, billDepth: 17.6, flipperLength: 182, bodyMass: 3200 },
  { species: 'Adelie', island: 'Dream', sex: 'Female', billLength: 36.7, billDepth: 19.3, flipperLength: 193, bodyMass: 3450 },
  { species: 'Chinstrap', island: 'Dream', sex: 'Female', billLength: 46.5, billDepth: 17.9, flipperLength: 192, bodyMass: 3500 },
  { species: 'Chinstrap', island: 'Dream', sex: 'Male', billLength: 50.0, billDepth: 19.5, flipperLength: 196, bodyMass: 3900 },
  { species: 'Chinstrap', island: 'Dream', sex: 'Female', billLength: 51.3, billDepth: 19.2, flipperLength: 193, bodyMass: 3650 },
  { species: 'Chinstrap', island: 'Dream', sex: 'Male', billLength: 45.4, billDepth: 18.7, flipperLength: 188, bodyMass: 3525 },
  { species: 'Chinstrap', island: 'Dream', sex: 'Female', billLength: 49.5, billDepth: 16.2, flipperLength: 229, bodyMass: 5800 },
  { species: 'Gentoo', island: 'Biscoe', sex: 'Female', billLength: 46.1, billDepth: 13.2, flipperLength: 211, bodyMass: 4500 },
  { species: 'Gentoo', island: 'Biscoe', sex: 'Male', billLength: 50.0, billDepth: 16.3, flipperLength: 230, bodyMass: 5700 },
  { species: 'Gentoo', island: 'Biscoe', sex: 'Female', billLength: 48.7, billDepth: 14.1, flipperLength: 210, bodyMass: 4450 },
  { species: 'Gentoo', island: 'Biscoe', sex: 'Male', billLength: 50.5, billDepth: 15.9, flipperLength: 225, bodyMass: 5400 },
  { species: 'Gentoo', island: 'Biscoe', sex: 'Female', billLength: 45.2, billDepth: 14.8, flipperLength: 212, bodyMass: 5200 },
]

const SPECIES_OPTIONS: Array<Species | 'All species'> = [
  'All species',
  'Adelie',
  'Chinstrap',
  'Gentoo',
]

const SPECIES_COLORS: Record<Species, string> = {
  Adelie: '#4f46e5',
  Chinstrap: '#0f766e',
  Gentoo: '#d97706',
}

const CHART_WIDTH = 680
const CHART_HEIGHT = 360
const CHART_PADDING = { top: 24, right: 24, bottom: 52, left: 60 }
const GRID_STEPS = 4

function formatMetricValue(value: number, metric: MetricOption) {
  return `${Math.round(value * 10) / 10} ${metric.unit}`
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function buildTicks(min: number, max: number) {
  const step = (max - min) / GRID_STEPS

  return Array.from({ length: GRID_STEPS + 1 }, (_, index) => min + step * index)
}

export default function App() {
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'All species'>('All species')
  const [xMetricKey, setXMetricKey] = useState<MetricKey>('flipperLength')
  const [yMetricKey, setYMetricKey] = useState<MetricKey>('bodyMass')

  const xMetric = METRICS.find((metric) => metric.key === xMetricKey) ?? METRICS[0]
  const yMetric = METRICS.find((metric) => metric.key === yMetricKey) ?? METRICS[1]

  const filteredPenguins = useMemo(() => {
    if (speciesFilter === 'All species') {
      return PENGUINS
    }

    return PENGUINS.filter((penguin) => penguin.species === speciesFilter)
  }, [speciesFilter])

  const xValues = filteredPenguins.map((penguin) => penguin[xMetric.key])
  const yValues = filteredPenguins.map((penguin) => penguin[yMetric.key])

  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  const chartInnerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  const xScale = (value: number) => {
    const domain = xMax - xMin || 1

    return CHART_PADDING.left + ((value - xMin) / domain) * chartInnerWidth
  }

  const yScale = (value: number) => {
    const domain = yMax - yMin || 1

    return CHART_HEIGHT - CHART_PADDING.bottom - ((value - yMin) / domain) * chartInnerHeight
  }

  const averageMass = average(filteredPenguins.map((penguin) => penguin.bodyMass))
  const averageFlipper = average(filteredPenguins.map((penguin) => penguin.flipperLength))
  const islands = new Set(filteredPenguins.map((penguin) => penguin.island))

  return (
    <main className="app-shell">
      <section className="panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">HR micro-frontend</p>
            <h1>Penguin explorer</h1>
            <p className="panel-copy">
              A compact single-page example that fits inside a host shell: pick a
              species and axes, then compare a small Palmer Penguins sample with a
              scatter plot.
            </p>
          </div>
          <div className="summary-chip">
            <strong>{filteredPenguins.length}</strong>
            <span>visible samples</span>
          </div>
        </header>

        <section className="controls-card" aria-label="Chart controls">
          <div className="control-grid">
            <label className="field">
              <span>Species</span>
              <select
                value={speciesFilter}
                onChange={(event) =>
                  setSpeciesFilter(event.target.value as Species | 'All species')
                }
              >
                {SPECIES_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>X-axis</span>
              <select
                value={xMetric.key}
                onChange={(event) => setXMetricKey(event.target.value as MetricKey)}
              >
                {METRICS.map((metric) => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Y-axis</span>
              <select
                value={yMetric.key}
                onChange={(event) => setYMetricKey(event.target.value as MetricKey)}
              >
                {METRICS.map((metric) => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="helper-text">
            Switch metrics or narrow to one species to see how the cluster changes.
          </p>
        </section>

        <div className="content-grid">
          <section className="chart-card">
            <div className="card-heading">
              <div>
                <h2>{yMetric.label} vs. {xMetric.label}</h2>
                <p>Static sample data rendered in a plain SVG chart for fast first load.</p>
              </div>
            </div>

            <div className="chart-frame">
              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="chart"
                role="img"
                aria-label={`Scatter plot of ${yMetric.label} versus ${xMetric.label}`}
              >
                {buildTicks(yMin, yMax).map((tick) => {
                  const y = yScale(tick)

                  return (
                    <g key={`y-${tick}`}>
                      <line
                        x1={CHART_PADDING.left}
                        x2={CHART_WIDTH - CHART_PADDING.right}
                        y1={y}
                        y2={y}
                        className="grid-line"
                      />
                      <text x={CHART_PADDING.left - 10} y={y + 4} className="axis-label axis-label-y">
                        {Math.round(tick)}
                      </text>
                    </g>
                  )
                })}

                {buildTicks(xMin, xMax).map((tick) => {
                  const x = xScale(tick)

                  return (
                    <g key={`x-${tick}`}>
                      <line
                        x1={x}
                        x2={x}
                        y1={CHART_PADDING.top}
                        y2={CHART_HEIGHT - CHART_PADDING.bottom}
                        className="grid-line"
                      />
                      <text
                        x={x}
                        y={CHART_HEIGHT - CHART_PADDING.bottom + 24}
                        textAnchor="middle"
                        className="axis-label"
                      >
                        {Math.round(tick)}
                      </text>
                    </g>
                  )
                })}

                <line
                  x1={CHART_PADDING.left}
                  x2={CHART_WIDTH - CHART_PADDING.right}
                  y1={CHART_HEIGHT - CHART_PADDING.bottom}
                  y2={CHART_HEIGHT - CHART_PADDING.bottom}
                  className="axis-line"
                />
                <line
                  x1={CHART_PADDING.left}
                  x2={CHART_PADDING.left}
                  y1={CHART_PADDING.top}
                  y2={CHART_HEIGHT - CHART_PADDING.bottom}
                  className="axis-line"
                />

                {filteredPenguins.map((penguin, index) => (
                  <g key={`${penguin.species}-${penguin.billLength}-${penguin.bodyMass}-${index}`}>
                    <circle
                      cx={xScale(penguin[xMetric.key])}
                      cy={yScale(penguin[yMetric.key])}
                      r={7}
                      fill={SPECIES_COLORS[penguin.species]}
                      className="plot-point"
                    />
                    <title>
                      {penguin.species} {penguin.sex} - {xMetric.label}:{' '}
                      {formatMetricValue(penguin[xMetric.key], xMetric)}, {yMetric.label}:{' '}
                      {formatMetricValue(penguin[yMetric.key], yMetric)}
                    </title>
                  </g>
                ))}

                <text
                  x={CHART_PADDING.left + chartInnerWidth / 2}
                  y={CHART_HEIGHT - 12}
                  textAnchor="middle"
                  className="axis-title"
                >
                  {xMetric.label} ({xMetric.unit})
                </text>
                <text
                  x={18}
                  y={CHART_PADDING.top + chartInnerHeight / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 18 ${CHART_PADDING.top + chartInnerHeight / 2})`}
                  className="axis-title"
                >
                  {yMetric.label} ({yMetric.unit})
                </text>
              </svg>
            </div>
          </section>

          <aside className="sidebar">
            <section className="stat-card">
              <span className="stat-label">Average body mass</span>
              <strong>{Math.round(averageMass).toLocaleString()} g</strong>
            </section>
            <section className="stat-card">
              <span className="stat-label">Average flipper length</span>
              <strong>{Math.round(averageFlipper)} mm</strong>
            </section>
            <section className="stat-card">
              <span className="stat-label">Islands represented</span>
              <strong>{islands.size}</strong>
            </section>

            <section className="legend-card">
              <h2>Species legend</h2>
              <ul className="legend-list">
                {(Object.entries(SPECIES_COLORS) as Array<[Species, string]>).map(
                  ([species, color]) => (
                    <li key={species}>
                      <span className="legend-swatch" style={{ backgroundColor: color }} />
                      <span>{species}</span>
                    </li>
                  ),
                )}
              </ul>
              <p className="helper-text">
                Source: Palmer Penguins sample values, trimmed for a lightweight demo.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}
