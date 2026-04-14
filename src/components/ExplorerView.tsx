import {
  buildExplorerStats,
  buildTicks,
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  formatMetricValue,
  METRICS,
  SPECIES_COLORS,
  SPECIES_OPTIONS,
  type MetricKey,
  type MetricOption,
  type PenguinDatum,
  type SpeciesFilter,
  type Species,
} from '../penguins.ts'

type ExplorerViewProps = {
  filteredPenguins: PenguinDatum[]
  speciesFilter: SpeciesFilter
  xMetric: MetricOption
  yMetric: MetricOption
  onSpeciesFilterChange: (value: SpeciesFilter) => void
  onXMetricChange: (value: MetricKey) => void
  onYMetricChange: (value: MetricKey) => void
}

export function ExplorerView({
  filteredPenguins,
  speciesFilter,
  xMetric,
  yMetric,
  onSpeciesFilterChange,
  onXMetricChange,
  onYMetricChange,
}: ExplorerViewProps) {
  const xValues = filteredPenguins.map((penguin) => penguin[xMetric.key])
  const yValues = filteredPenguins.map((penguin) => penguin[yMetric.key])

  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  const chartInnerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom
  const stats = buildExplorerStats(filteredPenguins)

  const xScale = (value: number) => {
    const domain = xMax - xMin || 1

    return CHART_PADDING.left + ((value - xMin) / domain) * chartInnerWidth
  }

  const yScale = (value: number) => {
    const domain = yMax - yMin || 1

    return CHART_HEIGHT - CHART_PADDING.bottom - ((value - yMin) / domain) * chartInnerHeight
  }

  return (
    <>
      <section className="stats-row" aria-label="Summary statistics">
        {stats.map((stat) => (
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
                  {penguin.species} {penguin.sex} - {xMetric.label}: {formatMetricValue(penguin[xMetric.key], xMetric)}
                  , {yMetric.label}: {formatMetricValue(penguin[yMetric.key], yMetric)}
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
            <select value={speciesFilter} onChange={(event) => onSpeciesFilterChange(event.target.value as SpeciesFilter)}>
              {SPECIES_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>X-axis</span>
            <select value={xMetric.key} onChange={(event) => onXMetricChange(event.target.value as MetricKey)}>
              {METRICS.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Y-axis</span>
            <select value={yMetric.key} onChange={(event) => onYMetricChange(event.target.value as MetricKey)}>
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
  )
}
