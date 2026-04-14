import { useMemo, useState } from 'react'
import penguinsData from './data/penguins.json'
import './App.css'

const SPECIES = ['Adelie', 'Chinstrap', 'Gentoo'] as const
const VIEW_OPTIONS = [
  { key: 'explorer', label: 'Explorer' },
  { key: 'dataset', label: 'Dataset' },
] as const

type Species = (typeof SPECIES)[number]
type Sex = 'Female' | 'Male' | 'Unknown'
type ViewKey = (typeof VIEW_OPTIONS)[number]['key']
type MetricKey = 'billLength' | 'billDepth' | 'flipperLength' | 'bodyMass'

type PenguinDatum = {
  species: Species
  island: string
  sex: Sex
  billLength: number
  billDepth: number
  flipperLength: number
  bodyMass: number
}

type RawPenguinDatum = {
  Species: string | null
  Island: string | null
  'Beak Length (mm)': number | null
  'Beak Depth (mm)': number | null
  'Flipper Length (mm)': number | null
  'Body Mass (g)': number | null
  Sex: string | null
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

const DATA_FIELDS = [
  { label: 'Species', detail: 'Categorical species label' },
  { label: 'Island', detail: 'Island where the penguin was observed' },
  { label: 'Sex', detail: 'Raw values MALE, FEMALE, or missing; normalized to Male, Female, Unknown' },
  { label: 'Beak Length (mm)', detail: 'Mapped to billLength for plotting' },
  { label: 'Beak Depth (mm)', detail: 'Mapped to billDepth for plotting' },
  { label: 'Flipper Length (mm)', detail: 'Mapped to flipperLength for plotting' },
  { label: 'Body Mass (g)', detail: 'Mapped to bodyMass for plotting' },
] as const

const SPECIES_OPTIONS: Array<Species | 'All species'> = ['All species', ...SPECIES]

const SPECIES_COLORS: Record<Species, string> = {
  Adelie: '#4f46e5',
  Chinstrap: '#0f766e',
  Gentoo: '#d97706',
}

const RAW_PENGUINS = penguinsData as RawPenguinDatum[]
const CHART_WIDTH = 620
const CHART_HEIGHT = 320
const CHART_PADDING = { top: 18, right: 18, bottom: 46, left: 54 }
const GRID_STEPS = 4

function formatMetricValue(value: number, metric: MetricOption) {
  return `${Math.round(value * 10) / 10} ${metric.unit}`
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function buildTicks(min: number, max: number) {
  const step = (max - min) / GRID_STEPS

  return Array.from({ length: GRID_STEPS + 1 }, (_, index) => min + step * index)
}

function isSpecies(value: string | null): value is Species {
  return value !== null && SPECIES.some((species) => species === value)
}

function normalizeSex(value: string | null): Sex {
  if (value === 'MALE') {
    return 'Male'
  }

  if (value === 'FEMALE') {
    return 'Female'
  }

  return 'Unknown'
}

function normalizePenguin(penguin: RawPenguinDatum): PenguinDatum | null {
  if (
    !isSpecies(penguin.Species) ||
    penguin.Island === null ||
    penguin['Beak Length (mm)'] === null ||
    penguin['Beak Depth (mm)'] === null ||
    penguin['Flipper Length (mm)'] === null ||
    penguin['Body Mass (g)'] === null
  ) {
    return null
  }

  return {
    species: penguin.Species,
    island: penguin.Island,
    sex: normalizeSex(penguin.Sex),
    billLength: penguin['Beak Length (mm)'],
    billDepth: penguin['Beak Depth (mm)'],
    flipperLength: penguin['Flipper Length (mm)'],
    bodyMass: penguin['Body Mass (g)'],
  }
}

const PENGUINS: PenguinDatum[] = RAW_PENGUINS.flatMap((penguin) => {
  const normalized = normalizePenguin(penguin)

  return normalized === null ? [] : [normalized]
})

export default function App() {
  const [view, setView] = useState<ViewKey>('explorer')
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

  const datasetSummary = useMemo(() => {
    const totalRows = RAW_PENGUINS.length
    const completeRows = PENGUINS.length
    const droppedRows = totalRows - completeRows
    const islands = Array.from(new Set(PENGUINS.map((penguin) => penguin.island))).sort()
    const speciesCounts = SPECIES.map((species) => ({
      species,
      total: RAW_PENGUINS.filter((penguin) => penguin.Species === species).length,
      complete: PENGUINS.filter((penguin) => penguin.species === species).length,
    }))

    return {
      totalRows,
      completeRows,
      droppedRows,
      islands,
      speciesCounts,
    }
  }, [])

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

  const explorerStats = [
    {
      label: 'Average body mass',
      value: `${Math.round(averageMass).toLocaleString()} g`,
    },
    {
      label: 'Average flipper length',
      value: `${Math.round(averageFlipper)} mm`,
    },
    {
      label: 'Islands represented',
      value: islands.size.toString(),
    },
  ]

  const title = view === 'explorer' ? 'Explorer' : 'Dataset'
  const summaryValue =
    view === 'explorer' ? filteredPenguins.length.toLocaleString() : datasetSummary.totalRows.toLocaleString()
  const summaryLabel = view === 'explorer' ? 'visible samples' : 'rows in source'

  return (
    <main className="penguins-app">
      <section className="panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Palmer Penguins</p>
            <h1>{title}</h1>
          </div>
          <div className="summary-chip">
            <strong>{summaryValue}</strong>
            <span>{summaryLabel}</span>
          </div>
        </header>

        <nav className="view-switch" aria-label="View selector">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={option.key === view ? 'view-tab is-active' : 'view-tab'}
              onClick={() => setView(option.key)}
            >
              {option.label}
            </button>
          ))}
        </nav>

        {view === 'explorer' ? (
          <>
            <section className="stats-row" aria-label="Summary statistics">
              {explorerStats.map((stat) => (
                <section key={stat.label} className="stat-card">
                  <span className="stat-label">{stat.label}</span>
                  <strong>{stat.value}</strong>
                </section>
              ))}
            </section>

            <section className="chart-card">
              <div className="card-heading">
                <div>
                  <h2>
                    {yMetric.label} vs. {xMetric.label}
                  </h2>
                  <p>
                    Showing complete records from <code>src/data/penguins.json</code>.
                  </p>
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

              <div className="chart-legend">
                <div>
                  <h2>Species legend</h2>
                  <p className="helper-text">
                    Records with missing measurements are excluded so the chart and summary cards stay aligned.
                  </p>
                </div>
                <ul className="legend-list">
                  {(Object.entries(SPECIES_COLORS) as Array<[Species, string]>).map(([species, color]) => (
                    <li key={species}>
                      <span className="legend-swatch" style={{ backgroundColor: color }} />
                      <span>{species}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="controls-card" aria-label="Chart controls">
              <div>
                <p className="eyebrow">Select</p>
              </div>
              <div className="control-grid">
                <label className="field">
                  <span>Species</span>
                  <select
                    value={speciesFilter}
                    onChange={(event) => setSpeciesFilter(event.target.value as Species | 'All species')}
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
                  <select value={xMetric.key} onChange={(event) => setXMetricKey(event.target.value as MetricKey)}>
                    {METRICS.map((metric) => (
                      <option key={metric.key} value={metric.key}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Y-axis</span>
                  <select value={yMetric.key} onChange={(event) => setYMetricKey(event.target.value as MetricKey)}>
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
          </>
        ) : (
          <section className="dataset-layout">
            <section className="dataset-hero-card">
              <p className="eyebrow">Data source</p>
              <h2>About this dataset</h2>
              <p className="dataset-copy">
                The app reads Palmer Penguins records from <code>src/data/penguins.json</code>. The explorer view
                plots only complete measurement rows so the chart, legend, and summary cards all use the same subset.
              </p>
            </section>

            <section className="stats-row" aria-label="Dataset summary">
              <section className="stat-card">
                <span className="stat-label">Rows in source</span>
                <strong>{datasetSummary.totalRows.toLocaleString()}</strong>
              </section>
              <section className="stat-card">
                <span className="stat-label">Complete rows used</span>
                <strong>{datasetSummary.completeRows.toLocaleString()}</strong>
              </section>
              <section className="stat-card">
                <span className="stat-label">Dropped rows</span>
                <strong>{datasetSummary.droppedRows.toLocaleString()}</strong>
              </section>
            </section>

            <div className="dataset-grid">
              <section className="info-card">
                <h2>Species counts</h2>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Species</th>
                        <th>Total rows</th>
                        <th>Complete rows</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasetSummary.speciesCounts.map((entry) => (
                        <tr key={entry.species}>
                          <td>{entry.species}</td>
                          <td>{entry.total}</td>
                          <td>{entry.complete}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="info-card">
                <h2>Islands represented</h2>
                <ul className="pill-list">
                  {datasetSummary.islands.map((island) => (
                    <li key={island}>{island}</li>
                  ))}
                </ul>
              </section>

              <section className="info-card info-card-wide">
                <h2>Penguin anatomy reference</h2>
                <figure className="dataset-figure">
                  <img
                    src="https://allisonhorst.github.io/palmerpenguins/reference/figures/culmen_depth.png"
                    alt="Penguin illustration labeling bill dimensions including culmen depth"
                    className="dataset-image"
                  />
                  <figcaption>
                    Artwork by @allison_horst.
                  </figcaption>
                </figure>
              </section>

              <section className="info-card info-card-wide">
                <h2>Available fields and units</h2>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DATA_FIELDS.map((field) => (
                        <tr key={field.label}>
                          <td>{field.label}</td>
                          <td>{field.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="info-card info-card-wide">
                <h2>Note</h2>
                <div className="note-list">
                  <p>
                    The chart excludes rows with missing beak length, beak depth, flipper length, body mass, species,
                    or island values.
                  </p>
                </div>
              </section>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
