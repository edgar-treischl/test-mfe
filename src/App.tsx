import { useMemo, useState } from 'react'
import { DatasetView } from './components/DatasetView.tsx'
import { ExplorerView } from './components/ExplorerView.tsx'
import {
  DATASET_SUMMARY,
  filterPenguins,
  getMetric,
  type MetricKey,
  type SpeciesFilter,
} from './penguins.ts'
import './App.css'

const VIEW_OPTIONS = [
  { key: 'explorer', label: 'Explorer' },
  { key: 'dataset', label: 'Dataset' },
] as const

type ViewKey = (typeof VIEW_OPTIONS)[number]['key']

export default function App() {
  const [view, setView] = useState<ViewKey>('explorer')
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('All species')
  const [xMetricKey, setXMetricKey] = useState<MetricKey>('flipperLength')
  const [yMetricKey, setYMetricKey] = useState<MetricKey>('bodyMass')

  const filteredPenguins = useMemo(() => filterPenguins(speciesFilter), [speciesFilter])
  const xMetric = getMetric(xMetricKey)
  const yMetric = getMetric(yMetricKey)

  const title = view === 'explorer' ? 'Explorer' : 'Dataset'
  const summaryValue =
    view === 'explorer' ? filteredPenguins.length.toLocaleString() : DATASET_SUMMARY.totalRows.toLocaleString()
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
          <ExplorerView
            filteredPenguins={filteredPenguins}
            speciesFilter={speciesFilter}
            xMetric={xMetric}
            yMetric={yMetric}
            onSpeciesFilterChange={setSpeciesFilter}
            onXMetricChange={setXMetricKey}
            onYMetricChange={setYMetricKey}
          />
        ) : (
          <DatasetView datasetSummary={DATASET_SUMMARY} />
        )}
      </section>
    </main>
  )
}
